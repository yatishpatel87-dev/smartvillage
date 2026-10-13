import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, BookOpen, Sparkles, Globe, Eye, EyeOff } from 'lucide-react';
import { VillageState } from '../types/village';
import { sound } from '../utils/audio';

interface HeaderProps {
  state: VillageState;
  onStartAutomation: () => void;
  onResetVillage: () => void;
  onToggleLanguage: () => void;
  onToggleSound: () => void;
  onOpenGuide: () => void;
  onToggleCleanMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onStartAutomation,
  onResetVillage,
  onToggleLanguage,
  onToggleSound,
  onOpenGuide,
  onToggleCleanMode,
}) => {
  const isGu = state.language === 'gu';

  // If cleanLiveMode is active, only render a floating restore button in the top corner
  if (state.cleanLiveMode) {
    return (
      <div className="absolute top-4 right-4 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onToggleCleanMode();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-emerald-400 border border-emerald-400/40 backdrop-blur-xl shadow-2xl transition-all cursor-pointer text-xs font-semibold hover:scale-105"
          title={isGu ? 'લખાણ અને કંટ્રોલ્સ પાછા લાવો' : 'Show UI Controls'}
        >
          <Eye className="w-4 h-4" />
          <span>{isGu ? 'કંટ્રોલ્સ બતાવો' : 'Show Controls'}</span>
        </button>
      </div>
    );
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2.5 sm:p-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Project Branding Banner */}
        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-2.5 w-full md:w-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {isGu ? '૩D સ્માર્ટ એકો-વિલેજ AI સિમ્યુલેટર' : '3D Smart Eco-Village AI Simulator'}
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isGu ? 'વિજ્ઞાન મેળો' : 'Science Fair'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300">
              {isGu
                ? '૭ સ્માર્ટ મોડ્યુલ્સ · લાઈવ સિમ્યુલેશન · શાળા પ્રોજેક્ટ પ્રદર્શન'
                : '7 Smart Modules · Live 3D Simulation · Science Exhibition'}
            </p>
          </div>
        </div>

        {/* Action Controls & Master Automation CTA */}
        <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap justify-center sm:justify-end">
          {/* 100% PURE LIVE VIEW (CLEAN VIEW - NO TEXT IN BETWEEN) */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onToggleCleanMode();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-400/40 backdrop-blur-md shadow-md transition-all cursor-pointer"
            title={isGu ? 'લખાણ વગર માત્ર લાઈવ ૩D ગામ જુઓ' : 'Pure Live 3D View (No Text In Between)'}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>{isGu ? 'લખાણ છુપાવો (લાઈવ વ્યુ)' : 'Live View (No Text)'}</span>
          </button>

          {/* MASTER AUTOMATION BUTTON */}
          <button
            type="button"
            onClick={() => {
              sound.playCelebration();
              onStartAutomation();
            }}
            className="group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all border border-emerald-300/40 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>
              {isGu
                ? 'ઓટોમેશન શરૂ કરો'
                : 'Start Automation'}
            </span>
          </button>

          {/* Science Fair Presentation Guide */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenGuide();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-md transition-all cursor-pointer"
            title={isGu ? 'વિજ્ઞાન મેળો માર્ગદર્શિકા' : 'Science Fair Guide'}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isGu ? 'ગાઇડ' : 'Guide'}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onToggleLanguage();
            }}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/15 backdrop-blur-md shadow-md transition-all cursor-pointer"
            title="ભાષા બદલો / Toggle Language"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>{isGu ? 'ENG' : 'ગુજ'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/15 backdrop-blur-md shadow-md transition-all cursor-pointer"
            title={state.soundEnabled ? 'અવાજ બંધ (Mute)' : 'અવાજ ચાલુ (Unmute)'}
          >
            {state.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Reset Village */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onResetVillage();
            }}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/15 backdrop-blur-md shadow-md transition-all cursor-pointer"
            title={isGu ? 'ગામ રિસેટ કરો' : 'Reset Village'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
