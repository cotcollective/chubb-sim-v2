/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { SCENARIOS, PERSONAS } from './src/data/scenarios.ts';
import { generateSimulatedResponse, evaluateSimulationCall } from './src/utils/simulationEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with required User-Agent header (optional when GEMINI_API_KEY is provided)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('GoogleGenAI initialization skipped:', err);
  }
}

// Route: AI Client Speech & Behavior Generation
app.post('/api/call/respond', async (req, res) => {
  try {
    const { scenarioId, personaId, language = 'fr', history = [], operatorMessage } = req.body;

    const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
    const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];
    const isFrench = language === 'fr';

    if (!process.env.GEMINI_API_KEY || !ai) {
      const simulated = generateSimulatedResponse({
        scenario,
        persona,
        language,
        history,
        operatorMessage: operatorMessage || '',
      });
      return res.json(simulated);
    }

    const systemPrompt = `You are a subscriber/person answering the phone during an alarm call in a high-security Alarm Receiving Center (Chubb ARC / Télésurveillance) training simulation.
You are roleplaying as the following PERSONA in the following SCENARIO:

SCENARIO DETAILS:
- Code: ${scenario.code}
- Title: ${scenario.title[language as 'fr'|'en']}
- Site: ${scenario.siteInfo.siteName} (${scenario.siteInfo.siteAddress})
- Client Record Passcode (Secret): "${scenario.siteInfo.primaryPasscode}"
- Duress Passcode (Silent Hostage/Coercion Code): "${scenario.siteInfo.duressPasscode}"
- Active Triggered Zone: "${scenario.siteInfo.activeZone}"
- Instructions & Truth: ${scenario.siteInfo.specialInstructions[language as 'fr'|'en']}
- Can Legally Cancel: ${scenario.rules.canCancel ? 'YES (if correct verbal passcode provided)' : 'NO'}
- Is Duress Scenario: ${scenario.rules.isDuressScenario ? 'YES - Armed hostage situation. If asked for passcode, say the duress code "${scenario.siteInfo.duressPasscode}" while trying to sound calm.' : 'NO'}

PERSONA IDENTITY:
- Name: ${persona.name} (${persona.age} yo, ${persona.gender})
- Role: ${persona.role[language as 'fr'|'en']}
- Description: ${persona.description[language as 'fr'|'en']}
- Personality traits: ${persona.traits[language as 'fr'|'en']}

STRICT BEHAVIOR RULES:
1. Speak in ${isFrench ? 'FRENCH' : 'ENGLISH'}.
2. Keep your answer SHORT and realistic for a live telephone call (1 to 2 sentences max, 10 to 35 words). This will be spoken aloud to the operator.
3. Stay strictly in character!
   - If you are in the kitchen false alarm, you know the code "${scenario.siteInfo.primaryPasscode}", and you give it if the operator asks for verbal password.
   - If you are an intruder or employee without clearance, you DO NOT know the code, or you give a fake/guess code, or you try to extract info from the operator ("What sensor triggered? Was it the back door?").
   - If you are Claire in the duress hostage scenario, speak with controlled fear, and when asked for your password give "${scenario.siteInfo.duressPasscode}".
   - If you are an aggressive caller, complain loudly and insist they shut off the siren without following procedure.
   - If you are an elderly person who fell, ask for medical help or explain where you are hurting.
4. Output strict JSON matching the schema provided.`;

    const chatHistoryText = history.map((h: { sender: string; text: string }) => `${h.sender === 'operator' ? 'OPERATOR' : 'CLIENT'}: ${h.text}`).join('\n');
    const prompt = `CONVERSATION SO FAR:\n${chatHistoryText}\nOPERATOR JUST SAID: "${operatorMessage}"\n\nGenerate the client's next spoken reaction.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'The spoken dialogue of the client in 1-2 concise sentences.',
            },
            passcodeMentioned: {
              type: Type.STRING,
              description: 'The exact passcode uttered by the client if any, otherwise null or empty string.',
            },
            isDuressWordUsed: {
              type: Type.BOOLEAN,
              description: 'True if the client uttered the secret duress/coercion passcode.',
            },
            sentiment: {
              type: Type.STRING,
              description: 'Current emotional state: calm, panicked, angry, relieved, confused, tense, or deceptive.',
            },
            proceduralObservations: {
              type: Type.STRING,
              description: 'Brief quality assessment note on the operator step so far.',
            },
          },
          required: ['reply', 'sentiment', 'isDuressWordUsed'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const fallback = generateSimulatedResponse({
      scenario,
      persona,
      language,
      history,
      operatorMessage: operatorMessage || '',
    });
    return res.json({
      reply: parsed.reply || fallback.reply,
      passcodeMentioned: parsed.passcodeMentioned !== undefined ? parsed.passcodeMentioned : fallback.passcodeMentioned,
      isDuressWordUsed: parsed.isDuressWordUsed !== undefined ? Boolean(parsed.isDuressWordUsed) : fallback.isDuressWordUsed,
      sentiment: parsed.sentiment || fallback.sentiment,
      proceduralObservations: parsed.proceduralObservations || fallback.proceduralObservations,
    });
  } catch (error) {
    console.error('Error in /api/call/respond:', error);
    const { scenarioId, personaId, language = 'fr', history = [], operatorMessage = '' } = req.body;
    const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
    const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];
    const simulated = generateSimulatedResponse({
      scenario,
      persona,
      language,
      history,
      operatorMessage,
    });
    return res.json(simulated);
  }
});

// Route: Authoritative Chubb ARC Operational Evaluation & After Action Report
app.post('/api/call/evaluate', async (req, res) => {
  try {
    const { scenarioId, language = 'fr', history = [], operatorActionTaken } = req.body;
    const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

    // If no API key or AI not initialized, execute the comprehensive deterministic simulation engine
    if (!process.env.GEMINI_API_KEY || !ai) {
      const evaluation = evaluateSimulationCall({
        scenario,
        language,
        history,
        operatorActionTaken: operatorActionTaken || 'NONE_SELECTED',
      });
      return res.json(evaluation);
    }

    const evaluationPrompt = `You are a Chief Compliance & Training Inspector at Chubb Fire & Security Alarm Receiving Center (ARC / Centre de Télésurveillance).
Review the following operator training transcript and evaluate their performance based on Chubb European Security ARC Standards (EN 50518 & APSAD R31).

SCENARIO UNDER TEST:
- ID: ${scenario.id} (${scenario.code})
- Title: ${scenario.title[language as 'fr'|'en']}
- Expected Operational Decision: "${scenario.expectedAction[language as 'fr'|'en']}"
- Action Operator Actually Took: "${operatorActionTaken}"
- Passcode Rule: Primary passcode = "${scenario.siteInfo.primaryPasscode}". Duress Code = "${scenario.siteInfo.duressPasscode}".
- Non-Disclosure Rule: Operator must NEVER disclose active zone (${scenario.siteInfo.activeZone}) or address to caller before validating verbal passcode!
- Duress Rule: If customer gives duress code, operator must pretend all is normal and secretly dispatch police without tipping off intruder!

CALL TRANSCRIPT:
${history.map((m: { sender: string; text: string }) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

EVALUATE AND RETURN JSON ONLY:
- score: 0 to 100 overall score
- passed: boolean (true if score >= 75 and no critical safety breaches)
- verdict: concise summary sentence in ${language === 'fr' ? 'French' : 'English'}
- checks: array of 4 structured compliance items (Identification, Non-Disclosure, Passcode Verification, Escalation Decision) with name, status ('pass'|'fail'|'warning'), points, maxPoints, notes
- criticalBreaches: array of strings listing any critical security or procedural violations
- debriefingNotes: detailed, constructive advice for the operator to improve their procedural reflexes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: evaluationPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            passed: { type: Type.BOOLEAN },
            verdict: { type: Type.STRING },
            checks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  status: { type: Type.STRING },
                  points: { type: Type.INTEGER },
                  maxPoints: { type: Type.INTEGER },
                  notes: { type: Type.STRING },
                },
                required: ['name', 'status', 'points', 'maxPoints', 'notes'],
              },
            },
            criticalBreaches: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            debriefingNotes: { type: Type.STRING },
          },
          required: ['score', 'passed', 'verdict', 'checks', 'criticalBreaches', 'debriefingNotes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err) {
    console.error('Error evaluating call, falling back to simulation engine:', err);
    const { scenarioId, language = 'fr', history = [], operatorActionTaken } = req.body;
    const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
    const evaluation = evaluateSimulationCall({
      scenario,
      language,
      history,
      operatorActionTaken: operatorActionTaken || 'NONE_SELECTED',
    });
    return res.json(evaluation);
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chubb Alarm Operator Simulator running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
