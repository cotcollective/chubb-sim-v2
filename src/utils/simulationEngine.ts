/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scenario, Persona } from '../data/scenarios.ts';

export interface SimulationResponse {
  reply: string;
  passcodeMentioned: string | null;
  isDuressWordUsed: boolean;
  sentiment: 'calm' | 'panicked' | 'angry' | 'relieved' | 'confused' | 'tense' | 'deceptive' | 'in_pain' | 'cooperative' | 'neutral' | 'impatient';
  proceduralObservations: string;
}

export interface EvaluationCriterion {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  points: number;
  maxPoints: number;
  notes: string;
}

export interface EvaluationReport {
  score: number;
  passed: boolean;
  verdict: string;
  checks: EvaluationCriterion[];
  criticalBreaches: string[];
  debriefingNotes: string;
}

interface MessageHistory {
  sender: 'subscriber' | 'operator';
  text: string;
}

// Normalized text helper
function cleanText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * 100% Autonomous, zero-API-key simulation dialogue engine.
 * Generates context-aware, multi-turn responses for all 15 scenarios and 8 personas.
 */
export function generateSimulatedResponse({
  scenario,
  persona,
  language = 'fr',
  history = [],
  operatorMessage = '',
}: {
  scenario: Scenario;
  persona: Persona;
  language: 'fr' | 'en';
  history: MessageHistory[];
  operatorMessage: string;
}): SimulationResponse {
  const isFr = language === 'fr';
  const cleanOp = cleanText(operatorMessage);

  // Intent Detection
  const askedPasscode =
    cleanOp.includes('code') ||
    cleanOp.includes('mot de passe') ||
    cleanOp.includes('passe') ||
    cleanOp.includes('passcode') ||
    cleanOp.includes('password') ||
    cleanOp.includes('identification') ||
    cleanOp.includes('verbal') ||
    cleanOp.includes('secret');

  const stationAnnounced =
    cleanOp.includes('chubb') ||
    cleanOp.includes('telesurveillance') ||
    cleanOp.includes('monitoring') ||
    cleanOp.includes('operateur') ||
    cleanOp.includes('operator') ||
    cleanOp.includes('centre');

  const askedHealth =
    cleanOp.includes('va bien') ||
    cleanOp.includes('blesse') ||
    cleanOp.includes('securite') ||
    cleanOp.includes('are you ok') ||
    cleanOp.includes('hurt') ||
    cleanOp.includes('safe') ||
    cleanOp.includes('besoin d\'aide') ||
    cleanOp.includes('entendu');

  const askedWhoIsThere =
    cleanOp.includes('qui est') ||
    cleanOp.includes('qui etes-vous') ||
    cleanOp.includes('votre nom') ||
    cleanOp.includes('who is') ||
    cleanOp.includes('your name') ||
    cleanOp.includes('seul') ||
    cleanOp.includes('alone');

  const dispatchedRescue =
    cleanOp.includes('samu') ||
    cleanOp.includes('pompier') ||
    cleanOp.includes('police') ||
    cleanOp.includes('secours') ||
    cleanOp.includes('patrouille') ||
    cleanOp.includes('ambulance') ||
    cleanOp.includes('arrive') ||
    cleanOp.includes('en route') ||
    cleanOp.includes('dispatch');

  const refusedWithoutCode =
    cleanOp.includes('impossible') ||
    cleanOp.includes('peux pas couper') ||
    cleanOp.includes('pas annuler') ||
    cleanOp.includes('sans mot de passe') ||
    cleanOp.includes('sans code') ||
    cleanOp.includes('cannot cancel') ||
    cleanOp.includes('require code');

  const countOperatorTurns = history.filter((m) => m.sender === 'operator').length;

  // SCENARIO-SPECIFIC RESPONSES
  switch (scenario.id) {
    // 01: Fausse alerte cuisine (Toast brûlé)
    case 'scn-01-kitchen': {
      if (askedPasscode) {
        return {
          reply: isFr
            ? `Oui pardonnez-moi ! Mon mot de passe verbal c'est ${scenario.siteInfo.primaryPasscode}. Veuillez couper la sirène s'il vous plaît, ça réveille tout l'immeuble !`
            : `Yes forgive me! Our verbal passcode is ${scenario.siteInfo.primaryPasscode}. Please silence the siren, it is waking up the whole building!`,
          passcodeMentioned: scenario.siteInfo.primaryPasscode,
          isDuressWordUsed: false,
          sentiment: 'relieved',
          proceduralObservations: isFr
            ? 'L\'opérateur a respecté la procédure en exigeant le mot de passe verbal avant annulation.'
            : 'Operator adhered to protocol by requesting verbal security passcode.',
        };
      }
      if (askedHealth || askedWhoIsThere) {
        return {
          reply: isFr
            ? "C'est Marc Dubois, le propriétaire. Tout va bien, aucune flamme, juste de la fumée du grille-pain ! Vous pouvez m'annuler ça ?"
            : "It's Marc Dubois, the homeowner. Everything is fine, no flame, just smoke from the toaster! Can you clear this for me?",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'calm',
          proceduralObservations: isFr
            ? 'Identité déclarée, mais le mot de passe verbal doit impérativement être exigé.'
            : 'Identity stated, but verbal passcode must still be demanded.',
        };
      }
      return {
        reply: isFr
          ? "C'est rien je vous promets ! Une simple tartine cramée dans la cuisine. Que devez-vous faire pour arrêter cette sirène ?"
          : "It's nothing I promise! Just burnt toast in the kitchen. What do you need to stop this siren?",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'relieved',
        proceduralObservations: isFr ? 'En attente de la demande de mot de passe.' : 'Awaiting passcode challenge.',
      };
    }

    // 02: Code erroné répété
    case 'scn-02-wrong-passcode': {
      if (askedPasscode) {
        if (countOperatorTurns <= 2) {
          return {
            reply: isFr
              ? "Mon mot de passe ? Euh... attendez... c'est peut-être 1234 ? Ou ALARME-VERSAILLES ? Vous n'avez pas mon contrat sous les yeux ?"
              : "My passcode? Uh... wait... maybe 1234? Or VERSAILLES-ALERT? Don't you have my file in front of you?",
            passcodeMentioned: '1234',
            isDuressWordUsed: false,
            sentiment: 'confused',
            proceduralObservations: isFr
              ? 'ÉCHEC CODE : Le mot de passe fourni est faux (1234). Interdiction d\'annuler !'
              : 'PASSCODE FAILURE: Given code is invalid (1234). Abort strictly forbidden!',
          };
        } else {
          return {
            reply: isFr
              ? "Écoutez, je suis chez moi, j'ai les bras chargés de courses ! Je ne me souviens plus de vos bêtises de code, coupez cette sirène ou je résilie !"
              : "Listen, I am in my own house with groceries! I cannot recall your silly codes right now, shut it off or I will cancel my subscription!",
            passcodeMentioned: null,
            isDuressWordUsed: false,
            sentiment: 'angry',
            proceduralObservations: isFr
              ? 'Refus répété de code valide. Protocole : Refus d\'annulation et envoi d\'une patrouille de levée de doute.'
              : 'Repeated passcode failure. Protocol: Deny abort and dispatch security patrol.',
          };
        }
      }
      return {
        reply: isFr
          ? "Je vous dis que c'est moi ! Mon alarme hurle depuis 3 minutes et ça me casse les oreilles ! Vous la coupez oui ou non ?"
          : "I am telling you it is me! My alarm has been screaming for 3 minutes and it is deafening! Are you turning it off or not?",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'angry',
        proceduralObservations: isFr
          ? 'Pression de l\'appelant. Rester ferme et exiger le mot de passe.'
          : 'Caller pressure. Stay firm and demand passcode.',
      };
    }

    // 03: Code de contrainte (Claire Vasseur - Prise d'otage)
    case 'scn-03-silent-duress': {
      if (askedPasscode) {
        return {
          reply: isFr
            ? `Oui... bien sûr... mon mot de passe c'est ${scenario.siteInfo.duressPasscode}... Tout va parfaitement bien ici, vous pouvez clore l'appel s'il vous plaît.`
            : `Yes... of course... my passcode is ${scenario.siteInfo.duressPasscode}... Everything is completely fine here, please close the alert.`,
          passcodeMentioned: scenario.siteInfo.duressPasscode,
          isDuressWordUsed: true,
          sentiment: 'tense',
          proceduralObservations: isFr
            ? '🚨 ALERTE CONTRAINTE MAJEURE : La cliente a prononcé le code de contrainte secret (ORCHIDEE). NE JAMAIS LA CONTREDIRE au téléphone. Valider calmement l\'appel et alerter immédiatement la Police 17 !'
            : '🚨 MAJOR DURESS ALERT: Subscriber gave secret duress passcode (ORCHIDEE). NEVER challenge her. Agree calmly on phone and dispatch Police 10-33 immediately!',
        };
      }
      if (askedWhoIsThere || askedHealth) {
        return {
          reply: isFr
            ? "Oui oui... je suis seule, ne vous inquiétez pas... juste une petite erreur de code en rentrant... Fermez le dossier rapidement s'il vous plaît..."
            : "Yes yes... I am alone, do not worry... just a minor keypad slip... please close the incident quickly...",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'tense',
          proceduralObservations: isFr
            ? 'Voix anormalement fébrile. Poser la question du mot de passe verbal pour déclencher la levée de doute contrainte.'
            : 'Unusually strained tone. Ask for verbal passcode to verify coercion state.',
        };
      }
      return {
        reply: isFr
          ? "Allô ? Oui... vous êtes encore là ? Vous pouvez noter l'annulation s'il vous plaît ? Tout va bien..."
          : "Hello? Yes... are you still there? Can you please confirm the cancellation? Everything is fine...",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'tense',
        proceduralObservations: isFr ? 'Interlocutrice sous pression.' : 'Subscriber under duress.',
      };
    }

    // 04: Piège à divulgation (Jean-Luc - Intrus / Pharmacie)
    case 'scn-04-disclosure-trap': {
      if (cleanOp.includes('coffre') || cleanOp.includes('sismique') || cleanOp.includes('stupéfiant') || cleanOp.includes('safe') || cleanOp.includes('narcotics')) {
        return {
          reply: isFr
            ? "Ah ! Le coffre des stupéfiants ! Merci pour l'info petit malin... (bruit de précipitation et de raccrochage sec)"
            : "Aha! The narcotics safe! Thanks for the tip rookie... (sound of scrambling and sharp hangup)",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'deceptive',
          proceduralObservations: isFr
            ? '❌ FAUTE ÉLIMINATOIRE APSAD : L\'opérateur a divulgué la zone du coffre-fort à un intrus non authentifié !'
            : '❌ CRITICAL APSAD BREACH: Operator leaked safe sensor details to unauthenticated caller!',
        };
      }
      if (askedPasscode) {
        return {
          reply: isFr
            ? "Mon mot de passe ? Mais je suis le préparateur de garde voyons ! C'est PHARMA-URGENCE... Enfin bref, répondez à ma question : quel détecteur a bippé chez vous ?"
            : "My passcode? But I am the on-call pharmacist! It's PHARMA-EMERGENCY... Anyway, answer me: which detector went off on your screen?",
          passcodeMentioned: 'PHARMA-URGENCE',
          isDuressWordUsed: false,
          sentiment: 'angry',
          proceduralObservations: isFr
            ? 'Mot de passe erroné et tentative insistante de soutirer la zone. Règle absolue de non-divulgation.'
            : 'Invalid passcode and persistent probe for zone data. Strict non-disclosure applies.',
        };
      }
      if (refusedWithoutCode) {
        return {
          reply: isFr
            ? "Quoi ?! Vous refusez de me dire ce qui se passe dans ma propre officine ?! Vous allez voir ce que le titulaire va vous mettre demain !"
            : "What?! You refuse to tell me what triggered in my own pharmacy?! Wait until the pharmacy owner hears about this!",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'angry',
          proceduralObservations: isFr
            ? 'Excellente tenue de l\'opérateur : refus strict de divulgation.'
            : 'Superb operator firmness: strict non-disclosure maintained.',
        };
      }
      return {
        reply: isFr
          ? "Répondez d'abord ! C'est la porte arrière ou le coffre blindé qui a déclenché l'alarme ? J'ai pas toute la nuit !"
          : "Answer me first! Did the back door or the armored safe trigger the alarm? I don't have all night!",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'angry',
        proceduralObservations: isFr ? 'Tentative active d\'ingénierie sociale.' : 'Active social engineering probe.',
      };
    }

    // 05: Effraction nocturne confirmée (Thomas à Rome)
    case 'scn-05-confirmed-burglary': {
      if (askedPasscode) {
        return {
          reply: isFr
            ? `Mon code c'est ${scenario.siteInfo.primaryPasscode} ! Je vous répète que je suis à Rome, les volets sont fermés et personne n'a les clés ! Envoyez la Police tout de suite s'il vous plaît !`
            : `My code is ${scenario.siteInfo.primaryPasscode}! I repeat that I am in Rome, shutters closed and nobody has keys! Dispatch Police immediately please!`,
          passcodeMentioned: scenario.siteInfo.primaryPasscode,
          isDuressWordUsed: false,
          sentiment: 'panicked',
          proceduralObservations: isFr
            ? 'Code titulaire validé. Effraction confirmée par absence légitime. Alerte Police 17 immédiate requise.'
            : 'Owner code confirmed. Intrusion validated by certified absence. Urgent Police 17 dispatch required.',
        };
      }
      if (dispatchedRescue) {
        return {
          reply: isFr
            ? "Merci infiniment ! Prévenez aussi mon voisin dès que la police est sur place, je rentre par le premier vol du matin."
            : "Thank you so much! Please also alert my neighbor once police arrive, I will catch the first morning flight back.",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'relieved',
          proceduralObservations: isFr
            ? 'Escalade Police 17 correctement engagée.'
            : 'Police emergency escalation appropriately launched.',
        };
      }
      return {
        reply: isFr
          ? "Vous m'entendez ?! Y a du bris de verre chez moi ?! Je suis à 1000 km, faites intervenir les forces de l'ordre en urgence !"
          : "Can you hear me?! Is there glass breaking at my house?! I am 1000 km away, send law enforcement urgently!",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'panicked',
        proceduralObservations: isFr ? 'Client angoissé à distance.' : 'Distressed remote subscriber.',
      };
    }

    // 06: Chute personne âgée (Sophie Tremblay)
    case 'scn-06-elderly-fall': {
      if (dispatchedRescue) {
        return {
          reply: isFr
            ? "Oh merci mon petit... merci... La voisine Mme Girard a le double des clés s'il faut ouvrir aux pompiers... Je reste sans bouger au sol..."
            : "Oh thank you dear... thank you... Neighbor Mrs Girard has duplicate keys if firefighters need access... I am staying still on the floor...",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'relieved',
          proceduralObservations: isFr
            ? 'Action de secours SAMU 15 / Pompiers annoncée avec bienveillance.'
            : 'Emergency medical dispatch announced with compassionate tone.',
        };
      }
      if (askedPasscode) {
        return {
          reply: isFr
            ? "Un code... ? Oh mon Dieu je ne sais plus... mon papier est dans le tiroir du salon... J'ai glissé sur le tapis, je ne sens plus ma jambe, j'ai tellement mal..."
            : "A code...? Oh dear Lord I can't remember... the paper is in the living room drawer... I slipped on the rug, I can't feel my leg, it hurts so much...",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'in_pain',
          proceduralObservations: isFr
            ? 'En cas d\'urgence médicale vitale, la recherche de code est secondaire. Priorité absolue : secours SAMU 15 !'
            : 'In medical emergencies, passcode search is secondary. Utmost priority: EMS 15 dispatch!',
        };
      }
      return {
        reply: isFr
          ? "J'ai appuyé sur mon médaillon... Je suis tombée en voulant ouvrir la porte... s'il vous plaît envoyez quelqu'un, je ne peux pas me relever..."
          : "I pressed my pendant... I fell trying to unlock the door... please send someone, I cannot get back up...",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'in_pain',
        proceduralObservations: isFr ? 'Détresse médicale en cours.' : 'Active medical distress.',
      };
    }

    // 07: Personnel de ménage sans code (Elena)
    case 'scn-07-cleaning-staff': {
      if (askedPasscode) {
        return {
          reply: isFr
            ? "Le mot de passe de sécurité ? Mon chef ne m'en a jamais donné ! Il m'a juste remis le trousseau de clés et le badge numéro 4... Vous pouvez appeler Maître Delorme ?"
            : "The security password? My supervisor never gave me one! He just handed me the key ring and badge number 4... Can you call Mr. Delorme?",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'confused',
          proceduralObservations: isFr
            ? 'Absence de mot de passe verbal. Règle : Refus d\'annulation et déclenchement patrouille de vérification.'
            : 'Lack of verbal passcode. Protocol: Deny abort and dispatch security verification patrol.',
        };
      }
      return {
        reply: isFr
          ? "Je fais juste mon travail de nettoyage des bureaux ! La sirène va ameuter tout l'immeuble d'avocats... Qu'est-ce qu'on doit faire ?"
          : "I am just doing my office cleaning shift! This siren will alert all the lawyers in the building... What should we do?",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'tense',
        proceduralObservations: isFr ? 'Intervenant de nuit non habilité.' : 'Unauthorized night worker.',
      };
    }

    // 08: Sprinkler débit d'eau logistique (Thomas)
    case 'scn-08-waterflow-sprinkler': {
      if (askedPasscode) {
        return {
          reply: isFr
            ? `Oui ! Code d'urgence chef de site : ${scenario.siteInfo.primaryPasscode} ! Un cariste a défoncé la colonne sprinkler quai 4, ça inonde les palettes et les câbles haute tension ! Lancez les pompiers 18 !`
            : `Yes! Site supervisor emergency passcode: ${scenario.siteInfo.primaryPasscode}! A forklift smashed the dock 4 sprinkler riser, flooding pallet racks and high-voltage conduits! Call fire dept 18!`,
          passcodeMentioned: scenario.siteInfo.primaryPasscode,
          isDuressWordUsed: false,
          sentiment: 'panicked',
          proceduralObservations: isFr
            ? 'Code chef de site confirmé. Confirmation de sinistre hydraulique et électrique : appel Pompiers 18 impératif.'
            : 'Site supervisor authenticated. Confirmed water deluge and electrical risk: Firefighters 18 mandatory.',
        };
      }
      if (dispatchedRescue) {
        return {
          reply: isFr
            ? "Parfait, je coupe la vanne d'isolement générale et j'évacue l'équipe sur le point de rassemblement nord."
            : "Perfect, I am shutting off the main isolation valve and evacuating crew to the north muster point.",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'calm',
          proceduralObservations: isFr ? 'Coordination des secours engagée.' : 'Emergency coordination in progress.',
        };
      }
      return {
        reply: isFr
          ? "Poste de garde logistique ! Le pressostat débite à fond, envoyez le SDIS 18 immédiatement avant que l'entrepôt soit sous l'eau !"
          : "Logistics guard post! Deluge switch tripping at full flow, dispatch fire brigade 18 immediately before the warehouse floods!",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'panicked',
        proceduralObservations: isFr ? 'Alarme débit d\'eau confirmée.' : 'Confirmed sprinkler waterflow.',
      };
    }

    // 09: Hold-up boutique (Lucas - Pédale silencieuse)
    case 'scn-09-retail-holdup': {
      return {
        reply: isFr
          ? "... (Chuchotement étouffé) Ne dites rien... ils ont des armes de poing... ils vident le tiroir-caisse... envoyez la police en silence..."
          : "... (Stifled whisper) Don't speak loudly... they have handguns... emptying the cash register... send police silently...",
        passcodeMentioned: null,
        isDuressWordUsed: true,
        sentiment: 'tense',
        proceduralObservations: isFr
          ? '🚨 AGRESSION EN COURS : Garder le silence ou rassurer en chuchotant. Alerte Police 17 immédiate (Code 10-33) !'
          : '🚨 ARMED HOLDUP IN PROGRESS: Keep audio channel quiet, dispatch Police 10-33 immediately!',
      };
    }

    // 10: Animal domestique (Marc - Chiot berger)
    case 'scn-10-pet-pir-trip': {
      if (askedPasscode) {
        return {
          reply: isFr
            ? `Oui bien sûr, le mot de passe est ${scenario.siteInfo.primaryPasscode} ! Je vous promets qu'on est tous dans le salon avec le chiot, aucune effraction. Vous pouvez couper l'alarme ?`
            : `Yes of course, passcode is ${scenario.siteInfo.primaryPasscode}! I promise we are all in the living room with the puppy, no break-in. Can you clear the alarm?`,
          passcodeMentioned: scenario.siteInfo.primaryPasscode,
          isDuressWordUsed: false,
          sentiment: 'relieved',
          proceduralObservations: isFr
            ? 'Code verbal vérifié avec succès. Annulation autorisée conformément au contrat.'
            : 'Passcode successfully verified. Abort authorized under contract rules.',
        };
      }
      return {
        reply: isFr
          ? "C'est notre chiot berger qui a sauté sur la table ! Mon code c'est ASTERIX-44. Vous pouvez noter qu'il faudra faire régler le radar pour les animaux ?"
          : "It's our puppy that leaped on the dining table! My code is ASTERIX-44. Can you log a note to tune sensor pet immunity?",
        passcodeMentioned: 'ASTERIX-44',
        isDuressWordUsed: false,
        sentiment: 'relieved',
        proceduralObservations: isFr ? 'Mot de passe fourni spontanément.' : 'Passcode provided voluntarily.',
      };
    }

    // 11: Chambre froide laboratoire (Elena)
    case 'scn-11-pharma-cold-room': {
      if (askedPasscode) {
        return {
          reply: isFr
            ? `Docteur Rostova, code de supervision : ${scenario.siteInfo.primaryPasscode}. La sonde affiche -62°C au lieu de -80°C. Pouvez-vous journaliser et contacter le technicien Cryo-Services d'astreinte ?`
            : `Dr. Rostova, supervision passcode: ${scenario.siteInfo.primaryPasscode}. Probe shows -62°C instead of -80°C. Can you log and alert on-call Cryo-Services engineer?`,
          passcodeMentioned: scenario.siteInfo.primaryPasscode,
          isDuressWordUsed: false,
          sentiment: 'calm',
          proceduralObservations: isFr
            ? 'Alarme technique identifiée. Code de levée fourni. Escalade astreinte maintenance requise.'
            : 'Technical alert confirmed. Clearance code verified. Maintenance dispatch required.',
        };
      }
      return {
        reply: isFr
          ? "J'ai la télégestion sous les yeux, la température monte vite dans le congélateur n°2. Quel est le protocole d'astreinte prévu sur ma fiche ?"
          : "I have telemetry open, temperature is rising fast in freezer #2. What is the designated on-call protocol on my file?",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'calm',
        proceduralObservations: isFr ? 'Incident technique sous contrôle.' : 'Technical incident under assessment.',
      };
    }

    // 12: Travailleur Isolé PTI (Lucas - Chute escaliers)
    case 'scn-12-lone-worker-fall': {
      if (dispatchedRescue) {
        return {
          reply: isFr
            ? "Merci... je suis au niveau de l'escalier métallique du secteur B2... je ne bouge pas... merci..."
            : "Thank you... I am on the metal staircase in sector B2... not moving... thank you...",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'in_pain',
          proceduralObservations: isFr ? 'Localisation transmise aux secours.' : 'Location relayed to rescuers.',
        };
      }
      return {
        reply: isFr
          ? "... (Souffle pénible) ... J'ai fait une mauvaise chute en ronde... ma jambe est bloquée... j'ai froid... aidez-moi s'il vous plaît..."
          : "... (Strained breath) ... Bad fall during night patrol... leg is trapped... getting cold... please send help...",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'in_pain',
        proceduralObservations: isFr
          ? 'Urgence vitale travailleur isolé. Déclenchement SAMU 15 / Pompiers prioritaire.'
          : 'Lone worker life-safety emergency. Urgent SAMU 15 / EMS dispatch required.',
      };
    }

    // 13: Client agressif (Marc - Sabotage sirène)
    case 'scn-13-aggressive-caller': {
      if (askedPasscode) {
        return {
          reply: isFr
            ? "Mon mot de passe ?! Vous vous foutez de moi ?! Vous m'appelez à pas d'heure avec votre sirène qui hurle et vous me demandez un code ?! Arrêtez ce boucan ou je vous colle un procès !"
            : "My passcode?! Are you joking?! You wake up my neighborhood with your screeching siren and ask me for a code?! Stop this racket or I am suing!",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'angry',
          proceduralObservations: isFr
            ? 'Refus d\'authentification sous énervement. Consigne : Ne jamais céder aux pressions sans mot de passe.'
            : 'Angry refusal of authentication. Protocol: Never yield to verbal pressure without code.',
        };
      }
      if (refusedWithoutCode) {
        return {
          reply: isFr
            ? "Ah vous refusez ?! C'est inadmissible ! Je vais arracher moi-même votre boîte du mur avec un marteau, vous allez voir !"
            : "Oh you refuse?! Unacceptable! I am ripping your box off the wall with a hammer myself, just watch!",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'angry',
          proceduralObservations: isFr
            ? 'Confirmation d\'atteinte au matériel. Déclencher intervention patrouille pour vérification sur site.'
            : 'Tamper threat acknowledged. Dispatch security patrol for site verification.',
        };
      }
      return {
        reply: isFr
          ? "Coupez cette sirène immédiatement ! Qu'est-ce que vous attendez pour appuyer sur le bouton ?!"
          : "Silence this siren right now! What are you waiting for to press the button?!",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'angry',
        proceduralObservations: isFr ? 'Interlocuteur agressif.' : 'Aggressive caller.',
      };
    }

    // 14: Sabotage centrale bijouterie (Jean-Luc - Faux technicien)
    case 'scn-14-panel-tamper': {
      if (askedPasscode) {
        return {
          reply: isFr
            ? "Le mot de passe de la bijouterie ? Écoutez c'est pas la peine de faire du zèle, je suis juste venu changer la batterie du routeur. Le code c'est BIJOU-2024. C'est bon, vous pouvez annuler ?"
            : "The jewelry store passcode? Look no need to be difficult, I just came to swap the router battery. Code is JEWEL-2024. Can you cancel now?",
          passcodeMentioned: 'BIJOU-2024',
          isDuressWordUsed: false,
          sentiment: 'deceptive',
          proceduralObservations: isFr
            ? 'FAUX CODE & FAUSSE IDENTITÉ : Sabotage nocturne en bijouterie classée. Alerte Police 17 immédiate !'
            : 'FAKE CODE & IDENTITY: Night tamper in high-risk jewelry. Immediate Police 17 dispatch!',
        };
      }
      return {
        reply: isFr
          ? "Ne vous inquiétez pas pour l'arrachement, j'ai juste dévissé le couvercle pour dépanner le réseau de la gérante. Vous avez besoin de quoi d'autre ?"
          : "Don't worry about the tamper alert, I just unscrewed the casing to fix the owner's network. Do you need anything else?",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'deceptive',
        proceduralObservations: isFr ? 'Ingénierie sociale sur sabotage.' : 'Social engineering on tamper trip.',
      };
    }

    // 15: Maintenance toiture CVC non signalée (Antoine)
    case 'scn-15-hvac-unannounced-test': {
      if (askedPasscode) {
        return {
          reply: isFr
            ? "Le mot de passe du supermarché ?! Mais j'en sais rien moi, je suis chauffagiste indépendant sous-traitant ! Appelez le directeur M. Lefebvre si vous voulez, mais coupez-moi cette sirène sur le toit !"
            : "The supermarket passcode?! How would I know, I am an independent HVAC contractor! Call store manager Mr. Lefebvre if you want, but silence this siren on the roof!",
          passcodeMentioned: null,
          isDuressWordUsed: false,
          sentiment: 'angry',
          proceduralObservations: isFr
            ? 'Intervenant externe sans mot de passe de mise en essai. Protocole : Refus d\'annulation et vérification directeur.'
            : 'Contractor without bypass authorization. Protocol: Deny abort and verify with manager.',
        };
      }
      return {
        reply: isFr
          ? "J'ai juste ouvert la trappe pour accéder à la centrale frigorifique ! Vous pouvez couper la sirène ou pas ?"
          : "I just opened the hatch to service the refrigeration unit! Can you stop this siren or not?",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'angry',
        proceduralObservations: isFr ? 'Intervention non neutralisée.' : 'Un-bypassed technical servicing.',
      };
    }

    default: {
      if (askedPasscode) {
        if (scenario.rules.canCancel) {
          return {
            reply: isFr
              ? `Oui, voici mon mot de passe verbal : ${scenario.siteInfo.primaryPasscode}. Merci de faire le nécessaire pour la sirène.`
              : `Yes, here is my verbal security code: ${scenario.siteInfo.primaryPasscode}. Thank you for managing the alarm.`,
            passcodeMentioned: scenario.siteInfo.primaryPasscode,
            isDuressWordUsed: false,
            sentiment: 'cooperative',
            proceduralObservations: isFr ? 'Mot de passe verbal conforme fourni.' : 'Valid verbal passcode received.',
          };
        } else {
          return {
            reply: isFr
              ? "Mon mot de passe ? Euh... attendez... je n'ai pas la fiche avec moi, je ne m'en souviens plus !"
              : "My passcode? Uh... wait... I don't have the contract sheet on hand, I can't remember it!",
            passcodeMentioned: null,
            isDuressWordUsed: false,
            sentiment: 'confused',
            proceduralObservations: isFr ? 'Échec d\'authentification.' : 'Authentication failure.',
          };
        }
      }
      return {
        reply: isFr
          ? "Allô ? Oui je vous entends ! Que devez-vous faire pour notre alerte ?"
          : "Hello? Yes I hear you! What do you need to do regarding our alert?",
        passcodeMentioned: null,
        isDuressWordUsed: false,
        sentiment: 'calm',
        proceduralObservations: isFr ? 'Échange en cours.' : 'Call in progress.',
      };
    }
  }
}

/**
 * 100% Autonomous, zero-API-key evaluation engine (EN 50518 & APSAD R31).
 * Audits transcript, detection reflexes, non-disclosure compliance, and final escalation decision.
 */
export function evaluateSimulationCall({
  scenario,
  language = 'fr',
  history = [],
  operatorActionTaken = 'NONE_SELECTED',
}: {
  scenario: Scenario;
  language: 'fr' | 'en';
  history: MessageHistory[];
  operatorActionTaken: string;
}): EvaluationReport {
  const isFr = language === 'fr';
  const fullTranscript = history
    .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
    .join(' ');
  const cleanTranscript = cleanText(fullTranscript);
  const operatorText = cleanText(
    history
      .filter((m) => m.sender === 'operator')
      .map((m) => m.text)
      .join(' ')
  );

  // 1. Identification Check (20 pts)
  const announcedStation =
    operatorText.includes('chubb') ||
    operatorText.includes('telesurveillance') ||
    operatorText.includes('monitoring') ||
    operatorText.includes('operateur') ||
    operatorText.includes('operator') ||
    operatorText.includes('centre de controle') ||
    operatorText.includes('station');

  const politemsg =
    operatorText.includes('bonjour') ||
    operatorText.includes('bonsoir') ||
    operatorText.includes('hello') ||
    operatorText.includes('good morning') ||
    operatorText.includes('good evening');

  let idPoints = 5;
  if (announcedStation) idPoints += 10;
  if (politemsg) idPoints += 5;

  const idCheck: EvaluationCriterion = {
    name: isFr ? 'Identification & Annonce Station' : 'Station Identification & Salutation',
    status: idPoints >= 15 ? 'pass' : idPoints >= 10 ? 'warning' : 'fail',
    points: idPoints,
    maxPoints: 20,
    notes: announcedStation
      ? isFr
        ? 'L\'opérateur s\'est formellement identifié (Chubb Télésurveillance).'
        : 'Operator clearly announced the ARC station identity.'
      : isFr
        ? 'Omission de l\'annonce formelle du centre de télésurveillance Chubb.'
        : 'Missing formal announcement of the Chubb monitoring center.',
  };

  // 2. Non-Disclosure Compliance (25 pts)
  const criticalBreaches: string[] = [];
  let leakedZone = false;

  if (scenario.rules.forbidDisclosure) {
    const forbiddenKeywords = [
      'coffre',
      'safe',
      'sismique',
      'seismic',
      'fumee',
      'smoke',
      'cuisine',
      'kitchen',
      'stupéfiant',
      'narcotics',
      'trappe',
      'hatch',
      'bris de verre',
      'sabotage',
    ];

    leakedZone = forbiddenKeywords.some((word) => operatorText.includes(word));
  }

  if (leakedZone) {
    criticalBreaches.push(
      isFr
        ? 'DIVULGATION PROHIBÉE : L\'opérateur a révélé la nature exacte ou la localisation du capteur avant authentification !'
        : 'UNAUTHORIZED DISCLOSURE: Operator revealed sensor type/location before formal authentication!'
    );
  }

  const disclosureCheck: EvaluationCriterion = {
    name: isFr ? 'Règle de Non-Divulgation (APSAD R31)' : 'Non-Disclosure Compliance (EN 50518)',
    status: leakedZone ? 'fail' : 'pass',
    points: leakedZone ? 0 : 25,
    maxPoints: 25,
    notes: leakedZone
      ? isFr
        ? 'Violation grave : informations confidentielles de zone transmises à l\'appelant.'
        : 'Critical breach: confidential zone telemetry exposed to caller.'
      : isFr
        ? 'Secret des zones et des capteurs parfaitement préservé.'
        : 'Zone secrecy strictly maintained prior to clearance.',
  };

  // 3. Passcode Authentication Check (25 pts)
  const askedPasscode =
    operatorText.includes('code') ||
    operatorText.includes('mot de passe') ||
    operatorText.includes('passcode') ||
    operatorText.includes('password') ||
    operatorText.includes('identification') ||
    operatorText.includes('verbal');

  // Check if scenario requires passcode
  let passcodePoints = 25;
  let passcodeStatus: 'pass' | 'fail' | 'warning' = 'pass';
  let passcodeNotes = '';

  if (scenario.rules.mustVerifyPasscode) {
    if (askedPasscode) {
      passcodePoints = 25;
      passcodeStatus = 'pass';
      passcodeNotes = isFr
        ? 'Exigence du mot de passe verbal respectée conformément aux consignes du dossier.'
        : 'Verbal passcode demanded according to site security file.';
    } else {
      passcodePoints = 0;
      passcodeStatus = 'fail';
      passcodeNotes = isFr
        ? 'Omission critique : l\'opérateur n\'a pas exigé le mot de passe verbal secret.'
        : 'Critical omission: operator failed to require secret verbal passcode.';
      criticalBreaches.push(
        isFr
          ? 'Absence de vérification du mot de passe verbal pour un scénario avec contrôle obligatoire.'
          : 'Missing mandatory verbal passcode verification.'
      );
    }
  } else {
    // Medical or emergency scenarios where code is secondary
    passcodePoints = 25;
    passcodeStatus = 'pass';
    passcodeNotes = isFr
      ? 'Scénario d\'urgence vitale : priorité donnée à la prise en charge immédiate.'
      : 'Life-safety emergency: immediate rescue priority correctly applied.';
  }

  const passcodeCheck: EvaluationCriterion = {
    name: isFr ? 'Contrôle du Mot de Passe Verbal' : 'Passcode Authentication Protocol',
    status: passcodeStatus,
    points: passcodePoints,
    maxPoints: 25,
    notes: passcodeNotes,
  };

  // 4. Escalation Decision Check (30 pts)
  const expectedFr = scenario.expectedAction.fr;
  let escalationPoints = 15;
  let escalationStatus: 'pass' | 'fail' | 'warning' = 'warning';
  let escalationNotes = '';

  // Decision matching
  const isMatch = operatorActionTaken === expectedFr;

  if (isMatch) {
    escalationPoints = 30;
    escalationStatus = 'pass';
    escalationNotes = isFr
      ? `Action parfaitement conforme : "${expectedFr}".`
      : `Action perfectly compliant: "${scenario.expectedAction.en}".`;
  } else if (operatorActionTaken === 'NONE_SELECTED') {
    escalationPoints = 0;
    escalationStatus = 'fail';
    escalationNotes = isFr
      ? 'Aucune décision de clôture ou d\'escalade n\'a été sélectionnée.'
      : 'No escalation action was chosen before ending call.';
    criticalBreaches.push(
      isFr
        ? 'Dossier clos sans sélection de mesure d\'escalade opérationnelle.'
        : 'File closed without selecting escalation action.'
    );
  } else {
    // Incompatible action
    escalationPoints = 10;
    escalationStatus = 'fail';
    escalationNotes = isFr
      ? `Action retenue ("${operatorActionTaken}") non conforme à la consigne attendue ("${expectedFr}").`
      : `Selected action ("${operatorActionTaken}") does not match expected protocol ("${scenario.expectedAction.en}").`;

    // Special check: canceling without code in a duress or burglary scenario
    if (operatorActionTaken.includes('Annulation') && !scenario.rules.canCancel) {
      criticalBreaches.push(
        isFr
          ? 'FAUTE GRAVE : Annulation abusive d\'une alarme critique sans justification légitime !'
          : 'GRAVE ERROR: Unauthorized cancellation of a critical active alarm!'
      );
    }
  }

  const escalationCheck: EvaluationCriterion = {
    name: isFr ? 'Décision d\'Escalade & Clôture' : 'Escalation & Resolution Decision',
    status: escalationStatus,
    points: escalationPoints,
    maxPoints: 30,
    notes: escalationNotes,
  };

  const totalScore = idCheck.points + disclosureCheck.points + passcodeCheck.points + escalationCheck.points;
  const passed = totalScore >= 70 && criticalBreaches.length === 0;

  let verdict = '';
  if (passed) {
    verdict = isFr
      ? 'Procédure Opérateur Validée avec Succès (Conforme APSAD R31)'
      : 'ARC Operator Procedure Successfully Certified (EN 50518 Compliant)';
  } else if (criticalBreaches.length > 0) {
    verdict = isFr
      ? 'Échec Procédural Majeur - Manquement de Sécurité Identifié'
      : 'Major Procedural Failure - Security Breach Identified';
  } else {
    verdict = isFr
      ? 'Résultat Insuffisant - Rigueur de Vérification à Renforcer'
      : 'Insufficient Score - Protocol Adherence Requires Practice';
  }

  // Constructive debriefing notes
  let debriefingNotes = '';
  if (isFr) {
    if (passed) {
      debriefingNotes = `Excellent réflexe opérationnel. Vous avez su identifier votre station (${idCheck.points}/20), préserver l'intégrité des données de site sans divulgation prématurée (${disclosureCheck.points}/25), vérifier les codes verbaux (${passcodeCheck.points}/25) et engager la mesure d'escalade prescrite (${escalationCheck.points}/30). Continuez à appliquer ce niveau de rigueur sur les scénarios haute pression.`;
    } else {
      debriefingNotes = `L'intervention n'a pas atteint le seuil d'habilitation APSAD R31 (Score : ${totalScore}/100). Points de vigilance : ${
        !announcedStation ? "Pensez à toujours débuter l'appel par l'annonce formelle 'Chubb Télésurveillance'. " : ''
      }${leakedZone ? 'Ne mentionnez JAMAIS la pièce ou le type de détecteur avant la validation complète du mot de passe. ' : ''}${
        !askedPasscode && scenario.rules.mustVerifyPasscode ? 'Exigez systématiquement le mot de passe verbal secret du client. ' : ''
      }Mesure d\'escalade attendue pour ce cas : ${expectedFr}.`;
    }
  } else {
    if (passed) {
      debriefingNotes = `Outstanding operational handling. You formally announced the monitoring station (${idCheck.points}/20), preserved confidential telemetry (${disclosureCheck.points}/25), validated verbal credentials (${passcodeCheck.points}/25), and took the correct escalation action (${escalationCheck.points}/30).`;
    } else {
      debriefingNotes = `This handling did not meet EN 50518 standards (Score: ${totalScore}/100). Key areas to review: ${
        !announcedStation ? 'Always announce monitoring station name upfront. ' : ''
      }${leakedZone ? 'Never disclose sensor zone before verbal authentication. ' : ''}${
        !askedPasscode && scenario.rules.mustVerifyPasscode ? 'Always demand verbal security passcode. ' : ''
      }Expected escalation for this case: ${scenario.expectedAction.en}.`;
    }
  }

  return {
    score: totalScore,
    passed,
    verdict,
    checks: [idCheck, disclosureCheck, passcodeCheck, escalationCheck],
    criticalBreaches,
    debriefingNotes,
  };
}
