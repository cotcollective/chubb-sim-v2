/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  BookOpen,
  ListFilter,
  Volume2,
  VolumeX,
  RefreshCw,
  Cpu,
  CheckCircle2,
  X,
  Zap,
  Globe2,
  Lock,
} from 'lucide-react';

interface TopNavProps {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  audioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  engineMode: 'zero_key' | 'cloud_ai';
  setEngineMode: (mode: 'zero_key' | 'cloud_ai') => void;
  onOpenScenarios: () => void;
  onOpenProcedures: () => void;
  onResetCall: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  language,
  setLanguage,
  audioMuted,
  setAudioMuted,
  engineMode,
  setEngineMode,
  onOpenScenarios,
  onOpenProcedures,
  onResetCall,
}) => {
  const isFr = language === 'fr';
  const [zeroKeyModalOpen, setZeroKeyModalOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        {/* Left: Brand Wordmark & Zero-Key Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Shield className="w-4 h-4" />
          </div>
          <a href="/" className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            CHUBB <span className="text-red-500 font-extrabold">ARC</span> SIMULATOR
          </a>

          {/* Zero-Key / Autonomous Pill Badge */}
          <button
            onClick={() => setZeroKeyModalOpen(true)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              engineMode === 'zero_key'
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80 shadow-xs'
                : 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/80'
            }`}
            title={isFr ? 'Cliquez pour voir les détails du mode zero clé API' : 'Click to inspect zero API key engine details'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>{isFr ? '100% Autonome (Sans Clé API)' : 'Zero API Key (Autonomous)'}</span>
          </button>
        </div>

        {/* Center: Navigation Actions */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={onOpenScenarios}
            className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap"
          >
            <ListFilter className="w-4 h-4 text-slate-400" />
            <span>{isFr ? '15 Scénarios' : '15 Scenarios'}</span>
          </button>
          <button
            onClick={onOpenProcedures}
            className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>{isFr ? 'Procédures Opérateur' : 'ARC Procedures'}</span>
          </button>
          <button
            onClick={onResetCall}
            className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap text-slate-300"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            <span>{isFr ? 'Réinitialiser Appel' : 'Reset Call'}</span>
          </button>
        </nav>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile Autonomous Button */}
          <button
            onClick={() => setZeroKeyModalOpen(true)}
            className="sm:hidden p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
            title={isFr ? 'Mode autonome sans clé API' : 'Autonomous mode details'}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className={`p-2 rounded-lg border transition-colors ${
              audioMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={audioMuted ? (isFr ? 'Son coupé' : 'Audio muted') : (isFr ? 'Son activé' : 'Audio on')}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <div className="flex items-center rounded-lg bg-slate-800/80 p-0.5 border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                language === 'fr'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                language === 'en'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Zero API Key / Autonomous Mode Information Modal */}
      {zeroKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-200">
            <button
              onClick={() => setZeroKeyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isFr ? 'Version 100% Autonome · Zéro Clé API' : '100% Autonomous · Zero API Key'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {isFr ? 'Fonctionne sans compte, sans quota et sans connexion externe' : 'Works with 0 accounts, 0 quotas & offline'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">
                      {isFr ? 'Moteur de Dialogue Procédural Embarqué :' : 'Embedded Procedural Dialogue Engine:'}
                    </span>{' '}
                    {isFr
                      ? '15 scénarios réalistes et 8 profils psychologiques gérés en local avec détection des passcodes, codes de contrainte et tentatives de divulgation.'
                      : '15 realistic ARC scenarios and 8 psychological personas managed locally with passcode, duress and disclosure trap detection.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">
                      {isFr ? 'Audio & Synthèse Vocale 100% Natives :' : '100% Native Web Audio & Speech APIs:'}
                    </span>{' '}
                    {isFr
                      ? 'Tonalités DTMF, sonnerie 425Hz européenne, clic de décroché et synthèse vocale par SpeechSynthesis sans fichier MP3 ni CDN.'
                      : 'Real-time DTMF tones, 425Hz ringback, line pickup pops, and voice synthesis powered by native browser Web Audio and Web Speech.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">
                      {isFr ? 'Reconnaissance Vocale Micro Push-To-Talk :' : 'Push-To-Talk Speech-to-Text:'}
                    </span>{' '}
                    {isFr
                      ? 'Transcription en temps réel par Web Speech Recognition (Google Chrome / Edge / Safari).'
                      : 'Real-time transcription powered by native browser Speech Recognition.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">
                      {isFr ? 'Audit APSAD R31 & EN 50518 Intégré :' : 'Built-in APSAD R31 & EN 50518 Audit:'}
                    </span>{' '}
                    {isFr
                      ? 'Barème de 100 points, détection des fautes éliminatoires et recommandations de debriefing calculées instantanément.'
                      : '100-point rubric, critical breach detection, and immediate debriefing analysis computed locally.'}
                  </div>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-300 mb-2">
                  {isFr ? 'Mode d\'exécution actif :' : 'Active Execution Engine:'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEngineMode('zero_key')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      engineMode === 'zero_key'
                        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isFr ? 'Mode Autonome' : 'Zero Key'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {isFr ? 'Zero clé · 0ms latence · 100% local' : '0 API key · 0ms latency · Offline'}
                    </div>
                  </button>

                  <button
                    onClick={() => setEngineMode('cloud_ai')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      engineMode === 'cloud_ai'
                        ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200 ring-2 ring-indigo-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isFr ? 'Mode Hybride' : 'Hybrid AI'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {isFr ? 'Avec Gemini si clé active' : 'Uses Gemini if configured'}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setZeroKeyModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {isFr ? 'Fermer et continuer' : 'Close and continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
