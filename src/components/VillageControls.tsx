import React from 'react';
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Camera,
  Layers,
  Sprout,
  Droplets,
  Lamp,
  Trash2,
  Flame,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { VillageState, ModuleId, MODULE_DEFINITIONS } from '../types/village';
import { sound } from '../utils/audio';

interface VillageControlsProps {
  state: VillageState;
  onTimeChange: (hour: number) => void;
  onSelectModule: (id: ModuleId | null) => void;
  isAutoCycleActive: boolean;
  onToggleAutoCycle: () => void;
}

export const VillageControls: React.FC<VillageControlsProps> = ({
  state,
  onTimeChange,
  onSelectModule,
  isAutoCycleActive,
  onToggleAutoCycle,
}) => {
  if (state.cleanLiveMode) return null;

  const isGu = state.language === 'gu';

  const cameraButtons: { id: ModuleId | null; labelGu: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: null,
      labelGu: 'સમગ્ર ગામ',
      labelEn: 'Village',
      icon: <Layers className="w-3 h-3" />,
    },
    {
      id: 'solar',
      labelGu: '૧. સોલાર',
      labelEn: '1. Solar',
      icon: <Sun className="w-3 h-3 text-amber-400" />,
    },
    {
      id: 'agriculture',
      labelGu: '૨. ખેતી',
      labelEn: '2. Agri',
      icon: <Sprout className="w-3 h-3 text-emerald-400" />,
    },
    {
      id: 'streetlights',
      labelGu: '૩. લાઈટ્સ',
      labelEn: '3. Lights',
      icon: <Lamp className="w-3 h-3 text-yellow-300" />,
    },
    {
      id: 'watertank',
      labelGu: '૪. ટાંકી',
      labelEn: '4. Tank',
      icon: <Droplets className="w-3 h-3 text-cyan-400" />,
    },
    {
      id: 'dustbin',
      labelGu: '૫. ડસ્ટબિન',
      labelEn: '5. Dustbin',
      icon: <Trash2 className="w-3 h-3 text-teal-400" />,
    },
    {
      id: 'biogas',
      labelGu: '૬. બાયોગેસ',
      labelEn: '6. Biogas',
      icon: <Flame className="w-3 h-3 text-orange-400" />,
    },
    {
      id: 'evstation',
      labelGu: '૭. EV કાર',
      labelEn: '7. EV',
      icon: <Zap className="w-3 h-3 text-green-400" />,
    },
  ];

  const formatHour = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${suffix}`;
  };

  return (
    <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-5xl pointer-events-none">
      <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col gap-1.5">
        {/* Top row: Camera view selectors */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="flex items-center gap-1 shrink-0 pr-1">
            <Camera className="w-3 h-3 text-slate-400 hidden sm:inline" />
            <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline uppercase tracking-wider">
              {isGu ? 'કેમેરા:' : 'View:'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {cameraButtons.map((btn) => {
              const isSelected = state.selectedModule === btn.id;
              return (
                <button
                  key={btn.id || 'overview'}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSelectModule(btn.id);
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/40 font-semibold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {btn.icon}
                  <span>{isGu ? btn.labelGu : btn.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom row: Day/Night Slider, Live Auto-Cycle & Live Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-white/10">
          {/* Day & Night Time Slider + Live Auto Cycle */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 text-amber-400 shrink-0">
              {state.timeOfDay >= 6 && state.timeOfDay <= 18 ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-cyan-300" />
              )}
              <span className="text-xs font-mono font-bold text-white w-17">
                {formatHour(state.timeOfDay)}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="24"
              step="0.25"
              value={state.timeOfDay}
              onChange={(e) => onTimeChange(parseFloat(e.target.value))}
              className="w-full sm:w-36 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              title={isGu ? 'દિવસ / રાત્રિ સમય' : 'Day / Night Slider'}
            />

            {/* Continuous Live Day/Night Cycle Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onToggleAutoCycle();
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all border ${
                isAutoCycleActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 animate-pulse'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
              title={isGu ? 'લાઈવ ૨૪-કલાક ડે/નાઈટ સાયકલ' : 'Continuous Live Day/Night Cycle'}
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isAutoCycleActive ? 'animate-spin' : ''}`} />
              <span>{isGu ? 'લાઈવ સાયકલ' : 'Live Cycle'}</span>
            </button>

            {/* Quick Time Presets */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playRelay();
                  onTimeChange(6.5);
                }}
                className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-amber-400"
                title="સવાર"
              >
                <Sunrise className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playRelay();
                  onTimeChange(12.0);
                }}
                className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-yellow-400"
                title="બપોર"
              >
                <Sun className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playRelay();
                  onTimeChange(18.5);
                }}
                className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-orange-400"
                title="સાંજ"
              >
                <Sunset className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playRelay();
                  onTimeChange(22.0);
                }}
                className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-cyan-300"
                title="રાત્રિ"
              >
                <Moon className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Real-time Eco Stats Ticker & Ambient Soundscape Badge */}
          <div className="flex items-center gap-2 text-[10px] text-slate-300 overflow-x-auto w-full sm:w-auto justify-between sm:justify-end">
            {/* Ambient Soundscape Indicator & Instant Sound Play */}
            <button
              type="button"
              onClick={() => {
                sound.testCurrentAmbient();
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer border border-white/10 shrink-0"
              title={
                isGu
                  ? state.timeOfDay >= 6 && state.timeOfDay <= 18
                    ? 'દિવસ: પક્ષીઓનો કલરવ (સાંભળવા ક્લિક કરો)'
                    : 'રાત્રિ: તમરાંનો અવાજ (સાંભળવા ક્લિક કરો)'
                  : state.timeOfDay >= 6 && state.timeOfDay <= 18
                  ? 'Daytime: Birds Chirping (Click to Test)'
                  : 'Nighttime: Crickets Chirping (Click to Test)'
              }
            >
              <span className="text-[11px] animate-pulse">
                {state.timeOfDay >= 6 && state.timeOfDay <= 18 ? '🕊️' : '🦗'}
              </span>
              <span className="text-[9px] font-medium text-emerald-300 hidden sm:inline">
                {isGu
                  ? state.timeOfDay >= 6 && state.timeOfDay <= 18
                    ? 'પક્ષીઓનો કલરવ'
                    : 'તમરાંનો અવાજ'
                  : state.timeOfDay >= 6 && state.timeOfDay <= 18
                  ? 'Birdsong'
                  : 'Crickets'}
              </span>
            </button>

            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">{isGu ? 'સોલાર:' : 'Solar:'}</span>
              <span className="font-mono font-bold text-emerald-300">
                {state.solar.generationKw.toFixed(1)} kW
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-slate-400">{isGu ? 'પાણી:' : 'Tank:'}</span>
              <span className="font-mono font-bold text-cyan-300">
                {Math.round(state.watertank.waterLevelPct)}%
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-slate-400">{isGu ? 'EV:' : 'EV:'}</span>
              <span className="font-mono font-bold text-green-300">
                {Math.round(state.evstation.batteryPct)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
