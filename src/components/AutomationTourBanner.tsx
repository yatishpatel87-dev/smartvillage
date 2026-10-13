import React from 'react';
import { Pause, Play, SkipForward, SkipBack, X } from 'lucide-react';
import { VillageState, TOUR_STEPS } from '../types/village';
import { sound } from '../utils/audio';

interface AutomationTourBannerProps {
  state: VillageState;
  onPauseToggle: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onExitTour: () => void;
}

export const AutomationTourBanner: React.FC<AutomationTourBannerProps> = ({
  state,
  onPauseToggle,
  onNextStep,
  onPrevStep,
  onExitTour,
}) => {
  if (!state.automation.isRunning) return null;

  const currentStep = TOUR_STEPS[state.automation.currentStepIndex] || TOUR_STEPS[0];
  const isGu = state.language === 'gu';
  const stepNumber = state.automation.currentStepIndex + 1;
  const totalSteps = TOUR_STEPS.length;

  return (
    // Positioned at the bottom (above controls) so the center view is 100% UNCLUTTERED AND FREE OF TEXT!
    <div className="absolute bottom-24 sm:bottom-26 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-2xl pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-400/40 rounded-2xl p-3 sm:p-3.5 shadow-2xl shadow-emerald-950/80 transition-all">
        {/* Step Header & Controls */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold">
              {stepNumber}
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              {isGu
                ? `લાઈવ ઓટોમેશન: ${stepNumber}/${totalSteps}`
                : `Live Automation: ${stepNumber}/${totalSteps}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onPrevStep();
              }}
              disabled={state.automation.currentStepIndex === 0}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-40 text-slate-200"
              title="પાછળ"
            >
              <SkipBack className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onPauseToggle();
              }}
              className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1"
            >
              {state.automation.isPaused ? (
                <>
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>{isGu ? 'શરૂ' : 'Play'}</span>
                </>
              ) : (
                <>
                  <Pause className="w-2.5 h-2.5 fill-white" />
                  <span>{isGu ? 'થોભો' : 'Pause'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onNextStep();
              }}
              disabled={state.automation.currentStepIndex === totalSteps - 1}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-40 text-slate-200"
              title="આગળ"
            >
              <SkipForward className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onExitTour();
              }}
              className="p-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 ml-0.5"
              title="સમાપ્ત"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Crisp 1-Line Narration (Never blocks center screen) */}
        <p className="text-xs sm:text-sm font-medium text-emerald-200 leading-snug">
          {isGu ? currentStep.narrationGu : currentStep.narrationEn}
        </p>

        {/* Minimal Progress Bar */}
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-200"
            style={{
              width: `${((stepNumber - 1 + state.automation.stepProgress / 100) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
