import React from 'react';
import {
  X,
  Sun,
  Sprout,
  Lamp,
  Droplets,
  Trash2,
  Flame,
  Zap,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { VillageState, ModuleId, MODULE_DEFINITIONS } from '../types/village';
import { sound } from '../utils/audio';

interface ModuleInspectorProps {
  state: VillageState;
  onClose: () => void;
  onUpdateState: (updater: (prev: VillageState) => VillageState) => void;
}

export const ModuleInspector: React.FC<ModuleInspectorProps> = ({
  state,
  onClose,
  onUpdateState,
}) => {
  const [isMinimized, setIsMinimized] = React.useState(false);

  if (!state.selectedModule || state.cleanLiveMode) return null;

  const moduleId = state.selectedModule;
  const def = MODULE_DEFINITIONS[moduleId];
  const isGu = state.language === 'gu';

  // Specific content and interactive controls for each of the 7 modules
  const renderModuleContent = () => {
    switch (moduleId) {
      // =======================================================================
      // 1. SOLAR SCHOOL & ECO-HOUSE
      // =======================================================================
      case 'solar':
        return (
          <div className="space-y-4">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'હાલનું ઉત્પાદન' : 'Current Power'}
                </span>
                <span className="text-lg font-mono font-bold text-amber-300">
                  {state.solar.generationKw.toFixed(2)} kW
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'કુલ દૈનિક ઉર્જા' : 'Daily Generation'}
                </span>
                <span className="text-lg font-mono font-bold text-emerald-300">
                  {state.solar.dailyTotalKwh.toFixed(1)} kWh
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'બેટરી સ્ટોરેજ' : 'Battery SoC'}
                </span>
                <span className="text-lg font-mono font-bold text-cyan-300">
                  {Math.round(state.solar.batteryStoragePct)}%
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'ઈન્વર્ટર કાર્યક્ષમતા' : 'Efficiency'}
                </span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {state.solar.efficiencyPct}%
                </span>
              </div>
            </div>

            {/* Interactive Controls */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  {isGu ? 'ગ્રીડ ટાઈ ઈન્વર્ટર:' : 'Grid-Tie Inverter:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playRelay();
                    onUpdateState((prev) => ({
                      ...prev,
                      solar: { ...prev.solar, inverterActive: !prev.solar.inverterActive },
                    }));
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    state.solar.inverterActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {state.solar.inverterActive ? (isGu ? 'સક્રિય (Active)' : 'Active') : (isGu ? 'બંધ (Standby)' : 'Standby')}
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{isGu ? 'પેનલ એંગલ ટ્રેકિંગ:' : 'Solar Panel Angle:'}</span>
                  <span className="font-mono text-amber-300">{state.solar.panelsAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={state.solar.panelsAngleDeg}
                  onChange={(e) => {
                    const angle = parseInt(e.target.value);
                    onUpdateState((prev) => ({
                      ...prev,
                      solar: { ...prev.solar, panelsAngleDeg: angle },
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-amber-400"
                />
              </div>
            </div>

            {/* Scientific Principle for Science Fair */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-amber-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGu ? 'વૈજ્ઞાનિક સિદ્ધાંત (Science Fair Theory)' : 'Scientific Principle'}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isGu
                  ? 'ફોટોવોલ્ટેઇક અસર (Photovoltaic Effect): સિલિકોન p-n જંક્શન સેલ પર સૂર્યના ફોટોન આપાત થતાં મુક્ત ઇલેક્ટ્રોન વહે છે, જેનાથી DC કરંટ બને છે. MPPT ઇન્વર્ટર તેને AC માં ફેરવી શાળા અને ઘરોને પાવર આપે છે.'
                  : 'Photovoltaic Effect: Photons hit silicon p-n semiconductor cells to excite electrons, producing direct current (DC). MPPT inverter converts to AC power for village load.'}
              </p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-white/10 font-mono">
                {isGu ? 'સૂત્ર: P = V × I × cos(θ) | કાર્યક્ષમતા η = (P_out / P_in) × 100%' : 'Formula: P = V × I × cos(θ) | η = (P_out / P_in) × 100%'}
              </div>
            </div>
          </div>
        );

      // =======================================================================
      // 2. AI SMART AGRICULTURE
      // =======================================================================
      case 'agriculture':
        return (
          <div className="space-y-4">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'માટીમાં ભેજ (Moisture)' : 'Soil Moisture'}
                </span>
                <span className="text-lg font-mono font-bold text-emerald-300">
                  {Math.round(state.agriculture.soilMoisturePct)}%
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'સ્પ્રિંકલર્સ સ્ટેટસ' : 'Sprinklers'}
                </span>
                <span className={`text-base font-bold ${state.agriculture.sprinklersActive ? 'text-cyan-300 animate-pulse' : 'text-slate-400'}`}>
                  {state.agriculture.sprinklersActive ? (isGu ? 'ચાલુ (Spraying)' : 'Spraying') : (isGu ? 'બંધ (OFF)' : 'OFF')}
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'AI ઓટો પદ્ધતિ' : 'AI Auto Mode'}
                </span>
                <span className="text-base font-bold text-emerald-400">
                  {state.agriculture.autoIrrigation ? (isGu ? 'સક્રિય' : 'Enabled') : (isGu ? 'મેન્યુઅલ' : 'Manual')}
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'પાણીની બચત' : 'Water Saved'}
                </span>
                <span className="text-lg font-mono font-bold text-teal-300">
                  ~40%
                </span>
              </div>
            </div>

            {/* Interactive Controls */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  {isGu ? '૩D વોટર સ્પ્રિંકલર્સ:' : '3D Water Sprinklers:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playSprinklerPulse();
                    onUpdateState((prev) => ({
                      ...prev,
                      agriculture: {
                        ...prev.agriculture,
                        sprinklersActive: !prev.agriculture.sprinklersActive,
                        soilMoisturePct: !prev.agriculture.sprinklersActive
                          ? Math.min(100, prev.agriculture.soilMoisturePct + 15)
                          : prev.agriculture.soilMoisturePct,
                      },
                    }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
                    state.agriculture.sprinklersActive
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  {state.agriculture.sprinklersActive
                    ? (isGu ? 'સ્પ્રિંકલર બંધ કરો' : 'Stop Sprinklers')
                    : (isGu ? 'સ્પ્રિંકલર શરૂ કરો' : 'Start Sprinklers')}
                </button>
              </div>

              {/* Soil Moisture Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{isGu ? 'માટી ભેજ સિમ્યુલેશન:' : 'Simulate Moisture:'}</span>
                  <span className="font-mono text-emerald-300">
                    {Math.round(state.agriculture.soilMoisturePct)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={state.agriculture.soilMoisturePct}
                  onChange={(e) => {
                    const moist = parseInt(e.target.value);
                    onUpdateState((prev) => {
                      const autoTrigger = prev.agriculture.autoIrrigation && moist < prev.agriculture.moistureThreshold;
                      if (autoTrigger && !prev.agriculture.sprinklersActive) {
                        sound.playSprinklerPulse();
                      }
                      return {
                        ...prev,
                        agriculture: {
                          ...prev.agriculture,
                          soilMoisturePct: moist,
                          sprinklersActive: autoTrigger || (!prev.agriculture.autoIrrigation && prev.agriculture.sprinklersActive),
                        },
                      };
                    });
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-emerald-400"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isGu
                    ? '* ૩૫% કરતાં ઓછો થતાં જ AI આપોઆપ સ્પ્રિંકલર શરૂ કરશે!'
                    : '* Drops below 35% auto-triggers the 3D sprinklers!'}
                </span>
              </div>

              {/* Auto Mode Switch */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-xs text-slate-300">
                  {isGu ? 'સ્વયંસંચાલિત AI મોડ:' : 'AI Autonomous Mode:'}
                </span>
                <input
                  type="checkbox"
                  checked={state.agriculture.autoIrrigation}
                  onChange={(e) => {
                    sound.playRelay();
                    const checked = e.target.checked;
                    onUpdateState((prev) => ({
                      ...prev,
                      agriculture: {
                        ...prev.agriculture,
                        autoIrrigation: checked,
                        sprinklersActive: checked && prev.agriculture.soilMoisturePct < prev.agriculture.moistureThreshold,
                      },
                    }));
                  }}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Scientific Principle for Science Fair */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>{isGu ? 'હાર્ડવેર અને સિદ્ધાંત' : 'Hardware & Working Principle'}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isGu
                  ? 'સેન્સર્સ: કેપેસિટીવ સોઇલ મોઇશ્ચર સેન્સર v1.2 અને Arduino Uno. માટી સુકાતાં વોલ્ટેજ ડ્રોપ થાય છે. રિલે મોડ્યુલ દ્વારા 12V ડીસી પંપ અને સ્પ્રિંકલર્સ શરૂ થાય છે, જેથી વધારે પડતું પાણી વેડફાતું નથી.'
                  : 'Sensors: Capacitive Soil Moisture Sensor + Arduino + 5V Relay + DC Submersible Pump. Automated closed-loop threshold logic saves 40% irrigation water.'}
              </p>
            </div>
          </div>
        );

      // =======================================================================
      // 3. SMART STREET LIGHTS
      // =======================================================================
      case 'streetlights':
        return (
          <div className="space-y-4">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'લાઈટ સ્થિતિ' : 'Lights Status'}
                </span>
                <span className={`text-base font-bold ${state.streetlights.lightsActive ? 'text-yellow-300' : 'text-slate-400'}`}>
                  {state.streetlights.lightsActive ? (isGu ? 'ચાલુ (ON)' : 'ON') : (isGu ? 'બંધ (OFF)' : 'OFF')}
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'રોશની તીવ્રતા' : 'Brightness'}
                </span>
                <span className="text-lg font-mono font-bold text-amber-300">
                  {state.streetlights.brightnessPct}%
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'વાહન ડિટેક્શન' : 'Motion Detected'}
                </span>
                <span className={`text-sm font-semibold ${state.streetlights.motionDetected ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {state.streetlights.motionDetected ? (isGu ? 'હા (૧૦૦% પ્રકાશ)' : 'Active (100%)') : (isGu ? 'કોઈ વાહન નથી' : 'Idle')}
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'ઉર્જા બચત' : 'Energy Saved'}
                </span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {state.streetlights.energySavedPct}%
                </span>
              </div>
            </div>

            {/* Interactive Controls */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  {isGu ? 'LDR ઓટો / મેન્યુઅલ:' : 'LDR Control Mode:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playRelay();
                    onUpdateState((prev) => {
                      const nextMode = prev.streetlights.mode === 'auto-ldr' ? 'manual-on' : prev.streetlights.mode === 'manual-on' ? 'manual-off' : 'auto-ldr';
                      const isNight = prev.timeOfDay < 6 || prev.timeOfDay > 18;
                      const active = nextMode === 'auto-ldr' ? isNight : nextMode === 'manual-on';
                      return {
                        ...prev,
                        streetlights: {
                          ...prev.streetlights,
                          mode: nextMode,
                          lightsActive: active,
                        },
                      };
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-amber-300"
                >
                  {state.streetlights.mode === 'auto-ldr'
                    ? (isGu ? 'LDR ઓટો સેન્સર' : 'Auto LDR')
                    : state.streetlights.mode === 'manual-on'
                    ? (isGu ? 'ફોર્સ ચાલુ (Force ON)' : 'Force ON')
                    : (isGu ? 'ફોર્સ બંધ (Force OFF)' : 'Force OFF')}
                </button>
              </div>

              {/* Simulate Vehicle Passing */}
              <button
                type="button"
                onClick={() => {
                  sound.playRelay();
                  onUpdateState((prev) => ({
                    ...prev,
                    streetlights: {
                      ...prev.streetlights,
                      motionDetected: true,
                      brightnessPct: 100,
                      lightsActive: true,
                    },
                  }));
                  setTimeout(() => {
                    onUpdateState((prev) => ({
                      ...prev,
                      streetlights: {
                        ...prev.streetlights,
                        motionDetected: false,
                        brightnessPct: 25,
                      },
                    }));
                  }, 4000);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 shadow-md transition-all"
              >
                {isGu ? '🚗 વાહન પસાર કરો (મોશન સેન્સર ટેસ્ટ)' : '🚗 Simulate Vehicle Passing (PIR Test)'}
              </button>
            </div>

            {/* Scientific Principle for Science Fair */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-yellow-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-yellow-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGu ? 'વૈજ્ઞાનિક કાર્યપદ્ધતિ' : 'Working Principle'}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isGu
                  ? 'LDR (Light Dependent Resistor) પર અંધારું થતાં રેઝિસ્ટન્સ વધે છે અને સર્કિટ લાઈટ શરૂ કરે છે. PIR મોશન સેન્સર વડે વાહન ન હોય ત્યારે લાઈટ ૨૫% ઇકો-મોડમાં રહે છે અને વાહન આવતાં ૧૦૦% તેજસ્વી બની ૬૦% વીજળી બચાવે છે.'
                  : 'LDR photoresistor automatically turns on lighting at dusk. PIR motion sensor steps up LED PWM brightness from 25% eco-mode to 100% when vehicles pass, saving 60% energy.'}
              </p>
            </div>
          </div>
        );

      // =======================================================================
      // 4. SMART WATER TANK
      // =======================================================================
      case 'watertank':
        return (
          <div className="space-y-4">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'પાણીનું સ્તર (Level)' : 'Water Level'}
                </span>
                <span className="text-lg font-mono font-bold text-cyan-300">
                  {Math.round(state.watertank.waterLevelPct)}%
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'સબમર્સિબલ પંપ' : 'Pump Status'}
                </span>
                <span className={`text-base font-bold ${state.watertank.pumpActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}>
                  {state.watertank.pumpActive ? (isGu ? 'ચાલુ (Pumping)' : 'Pumping') : (isGu ? 'બંધ (Idle)' : 'Idle')}
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'ઓટો કંટ્રોલ' : 'Auto Control'}
                </span>
                <span className="text-base font-bold text-emerald-400">
                  {state.watertank.autoPumpControl ? (isGu ? 'સક્રિય' : 'Enabled') : (isGu ? 'મેન્યુઅલ' : 'Manual')}
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'ઓવરફ્લો રક્ષણ' : 'Overflow Alert'}
                </span>
                <span className="text-xs font-semibold text-emerald-300">
                  {isGu ? 'સુરક્ષિત (Safe)' : 'Safe (Protected)'}
                </span>
              </div>
            </div>

            {/* Interactive Controls */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/10 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (state.watertank.pumpActive) {
                      sound.playRelay();
                      onUpdateState((prev) => ({
                        ...prev,
                        watertank: { ...prev.watertank, pumpActive: false },
                      }));
                    } else {
                      sound.initCtx();
                      sound.playPumpPulse();
                      onUpdateState((prev) => ({
                        ...prev,
                        watertank: {
                          ...prev.watertank,
                          pumpActive: true,
                          // If already full, start from 20% so user sees full filling animation!
                          waterLevelPct: prev.watertank.waterLevelPct >= 80 ? 20 : prev.watertank.waterLevelPct,
                        },
                      }));
                    }
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer ${
                    state.watertank.pumpActive
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/30'
                  }`}
                >
                  {state.watertank.pumpActive
                    ? (isGu ? '🛑 પંપ બંધ કરો' : '🛑 Stop Pump')
                    : (isGu ? '🚰 ટાંકી ભરો (લાઈવ ડેમો)' : '🚰 Fill Tank (Live Demo)')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onUpdateState((prev) => ({
                      ...prev,
                      watertank: {
                        ...prev.watertank,
                        waterLevelPct: Math.max(15, prev.watertank.waterLevelPct - 25),
                      },
                    }));
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200"
                >
                  {isGu ? 'પાણી વાપરો (Consume)' : 'Drain / Consume'}
                </button>
              </div>

              {/* Water Level Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{isGu ? 'ટાંકી સ્તર એડજસ્ટ:' : 'Adjust Level:'}</span>
                  <span className="font-mono text-cyan-300">
                    {Math.round(state.watertank.waterLevelPct)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={state.watertank.waterLevelPct}
                  onChange={(e) => {
                    const level = parseInt(e.target.value);
                    onUpdateState((prev) => ({
                      ...prev,
                      watertank: { ...prev.watertank, waterLevelPct: level },
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-cyan-400"
                />
              </div>
            </div>

            {/* Scientific Principle for Science Fair */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-cyan-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <Droplets className="w-3.5 h-3.5" />
                <span>{isGu ? 'અલ્ટ્રાસોનિક લેવલ સેન્સર સિદ્ધાંત' : 'Ultrasonic Sensor Principle'}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isGu
                  ? 'HC-SR04 સેન્સર 40kHz સાઉન્ડ વેવ મોકલે છે. પાણીની સપાટીથી અથડાઈને પાછા ફરવાના સમય (Echo time t) પરથી અંતર d = (v × t) / 2 ગણાય છે. ૨૫% થી ઓછું થતાં પંપ આપોઆપ શરૂ થાય છે અને ૯૦% પર બંધ થાય છે.'
                  : 'HC-SR04 ultrasonic pulses reflect from water surface. Distance d = (v * t) / 2. Automatic dual threshold stops pump before overflow and fires pump when reservoir is depleted.'}
              </p>
            </div>
          </div>
        );

      // =======================================================================
      // 5. SMART DUSTBIN
      // =======================================================================
      case 'dustbin':
        return (
          <div className="space-y-4">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'કચરાનું સ્તર' : 'Fill Level'}
                </span>
                <span className={`text-lg font-mono font-bold ${state.dustbin.alertTriggered ? 'text-rose-400 animate-pulse' : 'text-emerald-300'}`}>
                  {state.dustbin.fillLevelPct}%
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'ઢાંકણ (Lid)' : 'Lid Status'}
                </span>
                <span className={`text-base font-bold ${state.dustbin.lidOpen ? 'text-amber-300' : 'text-slate-400'}`}>
                  {state.dustbin.lidOpen ? (isGu ? 'ખુલ્લું (Open)' : 'Open') : (isGu ? 'બંધ (Closed)' : 'Closed')}
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'સેન્સર અંતર' : 'Distance'}
                </span>
                <span className="text-base font-mono font-bold text-cyan-300">
                  {state.dustbin.distanceCm} cm
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? '૮૫% એલર્ટ બત્તી' : '85% Alert'}
                </span>
                <span className={`text-xs font-bold ${state.dustbin.alertTriggered ? 'text-rose-400' : 'text-slate-400'}`}>
                  {state.dustbin.alertTriggered ? (isGu ? '🚨 ભરાઈ ગયું!' : '🚨 Full Alert!') : (isGu ? 'સામાન્ય (OK)' : 'Normal')}
                </span>
              </div>
            </div>

            {/* Interactive Controls */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/10 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playRelay();
                    onUpdateState((prev) => ({
                      ...prev,
                      dustbin: { ...prev.dustbin, lidOpen: !prev.dustbin.lidOpen },
                    }));
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {state.dustbin.lidOpen ? (isGu ? 'ઢાંકણ બંધ કરો' : 'Close Lid') : (isGu ? 'ઢાંકણ ખોલો' : 'Open Lid')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onUpdateState((prev) => ({
                      ...prev,
                      dustbin: {
                        ...prev.dustbin,
                        fillLevelPct: 15,
                        alertTriggered: false,
                        distanceCm: 45,
                      },
                    }));
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200"
                >
                  {isGu ? 'કચરો ખાલી કરો' : 'Empty Dustbin'}
                </button>
              </div>

              {/* Fill Level Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{isGu ? 'કચરા સ્તર ટેસ્ટ:' : 'Test Fill Level:'}</span>
                  <span className="font-mono text-amber-300">{state.dustbin.fillLevelPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.dustbin.fillLevelPct}
                  onChange={(e) => {
                    const fill = parseInt(e.target.value);
                    const alert = fill >= 85;
                    if (alert && !state.dustbin.alertTriggered) {
                      sound.playAlert();
                    }
                    onUpdateState((prev) => ({
                      ...prev,
                      dustbin: {
                        ...prev.dustbin,
                        fillLevelPct: fill,
                        alertTriggered: alert,
                        distanceCm: Math.max(3, Math.round(50 - fill * 0.45)),
                      },
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-rose-400"
                />
              </div>
            </div>

            {/* Scientific Principle for Science Fair */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-teal-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isGu ? 'સ્વચ્છ ભારત IoT ઇનોવેશન' : 'Smart Sanitation IoT Principle'}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isGu
                  ? 'હાથ કે કચરો નજીક લાવતાં અલ્ટ્રાસોનિક સેન્સર સર્વો મોટર (SG90) ને ૯૦ ડિગ્રી ફેરવી ટચલેસ ઢાંકણ ખોલે છે. કચરો ૮૫% ભરાતાં લાલ બઝર વાગે છે અને GSM મોડ્યુલ દ્વારા મ્યુનિસિપાલિટીને SMS એલર્ટ પહોંચે છે.'
                  : 'Touchless lid opens via SG90 servo motor when ultrasonic proximity detects hand. When depth exceeds 85%, siren sounds and telemetry triggers municipal collection.'}
              </p>
            </div>
          </div>
        );

      // =======================================================================
      // 6. BIOGAS PLANT
      // =======================================================================
      case 'biogas':
        return (
          <div className="space-y-4">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'પ્રેશર ગેજ (PSI)' : 'Pressure PSI'}
                </span>
                <span className="text-lg font-mono font-bold text-orange-300">
                  {state.biogas.pressurePsi} PSI
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'મિથેન ટકાવારી' : 'Methane CH4'}
                </span>
                <span className="text-lg font-mono font-bold text-emerald-300">
                  {state.biogas.methanePct}%
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'તાપમાન (Digestion)' : 'Temperature'}
                </span>
                <span className="text-base font-mono font-bold text-amber-300">
                  {state.biogas.temperatureC}°C
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'દૈનિક ગેસ ઉત્પાદન' : 'Daily Output'}
                </span>
                <span className="text-base font-mono font-bold text-cyan-300">
                  {state.biogas.dailyProductionM3} m³
                </span>
              </div>
            </div>

            {/* Interactive Controls */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/10 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{isGu ? 'પ્રેશર ગેજ સોય (Needle Adjust):' : 'Rotate Pressure Needle:'}</span>
                  <span className="font-mono text-orange-300">{state.biogas.pressurePsi} PSI</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={state.biogas.pressurePsi}
                  onChange={(e) => {
                    const psi = parseInt(e.target.value);
                    onUpdateState((prev) => ({
                      ...prev,
                      biogas: { ...prev.biogas, pressurePsi: psi },
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-orange-400"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isGu ? '* ૩D મોડેલ પર રહેલી લાલ સોય પણ આપોઆપ રોટેટ થશે!' : '* 3D model red needle dynamically rotates with this slider!'}
                </span>
              </div>

              {/* Slurry Fertilizer Valve */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-xs text-slate-300">
                  {isGu ? 'ઓર્ગેનિક ખાતર (Slurry Flow):' : 'Organic Slurry Valve:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playRelay();
                    onUpdateState((prev) => ({
                      ...prev,
                      biogas: { ...prev.biogas, slurryFlowing: !prev.biogas.slurryFlowing },
                    }));
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    state.biogas.slurryFlowing ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {state.biogas.slurryFlowing ? (isGu ? 'ખેતરમાં ચાલુ' : 'Flowing to Farm') : (isGu ? 'વાલ્વ બંધ' : 'Closed')}
                </button>
              </div>
            </div>

            {/* Scientific Principle for Science Fair */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-orange-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-orange-300 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>{isGu ? 'મિથેનોજેનેસિસ પ્રક્રિયા' : 'Methanogenesis Chemistry'}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isGu
                  ? 'અનએરોબિક (હવા વગરનું) વિઘટન: ગાયના છાણ અને કચરામાંથી મિથેનોજેનિક બેક્ટેરિયા CH4 (મિથેન ~65%) અને CO2 ઉત્પન્ન કરે છે. બચેલી સ્લરી નાઇટ્રોજનથી ભરપૂર હોવાથી AI ખેતી માટે ૧૦૦% સેન્દ્રીય ખાતર બને છે.'
                  : 'Anaerobic Digestion: Methanogenic bacteria digest bio-waste to yield methane gas (65% CH4) for cooking, plus nutrient-rich nitrogen slurry for crop fertilization.'}
              </p>
            </div>
          </div>
        );

      // =======================================================================
      // 7. EV CHARGING STATION
      // =======================================================================
      case 'evstation':
        return (
          <div className="space-y-4">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'બેટરી ચાર્જ (SoC)' : 'Battery Level'}
                </span>
                <span className="text-lg font-mono font-bold text-green-300">
                  {Math.round(state.evstation.batteryPct)}%
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'ચાર્જિંગ પાવર' : 'Charging Rate'}
                </span>
                <span className="text-lg font-mono font-bold text-cyan-300">
                  {state.evstation.chargingActive ? `${state.evstation.chargePowerKw} kW` : '0 kW'}
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'અંદાજિત રેન્જ' : 'Range'}
                </span>
                <span className="text-base font-mono font-bold text-emerald-300">
                  {Math.round(state.evstation.batteryPct * 3.2)} km
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">
                  {isGu ? 'પ્રદૂષણ ઉત્સર્જન' : 'Emissions'}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  0% Carbon (Green)
                </span>
              </div>
            </div>

            {/* Interactive Controls */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  {isGu ? 'ચાર્જિંગ કેબલ પ્લગ:' : 'Charging Cable:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playEVCharge();
                    onUpdateState((prev) => ({
                      ...prev,
                      evstation: {
                        ...prev.evstation,
                        chargingActive: !prev.evstation.chargingActive,
                      },
                    }));
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all ${
                    state.evstation.chargingActive
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/30'
                  }`}
                >
                  {state.evstation.chargingActive
                    ? (isGu ? 'ચાર્જિંગ બંધ કરો' : 'Stop Charging')
                    : (isGu ? 'ગ્રીન ચાર્જિંગ શરૂ કરો' : 'Start EV Charging')}
                </button>
              </div>

              {/* Battery SoC Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{isGu ? 'બેટરી ટકાવારી એડજસ્ટ:' : 'Adjust Battery %:'}</span>
                  <span className="font-mono text-green-300">
                    {Math.round(state.evstation.batteryPct)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={state.evstation.batteryPct}
                  onChange={(e) => {
                    const b = parseInt(e.target.value);
                    onUpdateState((prev) => ({
                      ...prev,
                      evstation: { ...prev.evstation, batteryPct: b },
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-green-400"
                />
              </div>
            </div>

            {/* Scientific Principle for Science Fair */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-green-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-green-300 font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>{isGu ? 'સોલાર-ટુ-વ્હીકલ (V2G / EV) ઇકોસિસ્ટમ' : 'Solar EV Ecosystem'}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isGu
                  ? 'ગામની છત પરની સોલાર પેનલમાંથી બનેલી વીજળી સીધી EV બેટરી (Lithium-ion NMC/LFP) માં DC ફાસ્ટ ચાર્જર દ્વારા સંગ્રહાય છે. ગ્રામીણ વાહનવ્યવહારમાં ડીઝલનો ખર્ચ શૂન્ય બને છે.'
                  : 'Rooftop solar generates clean power transferred directly into EV lithium-ion battery via high-efficiency DC-DC buck converter, creating net-zero rural transport.'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isMinimized) {
    return (
      <div className="absolute top-20 right-3 z-25 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white shadow-xl hover:bg-slate-800 text-xs font-semibold backdrop-blur-md"
        >
          <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
            {def.number}
          </span>
          <span>{isGu ? def.titleGu : def.titleEn}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-3 sm:right-5 z-25 w-[92%] sm:w-96 max-h-[calc(100vh-170px)] overflow-y-auto pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-black/60 transition-all">
      {/* Drawer Header */}
      <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
            {def.number}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              {isGu ? def.titleGu : def.titleEn}
            </h2>
            <p className="text-[10px] text-slate-300 leading-tight">
              {isGu ? def.taglineGu : def.taglineEn}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 text-[10px] font-medium"
            title="નાનું કરો / Minimize"
          >
            —
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
            title="બંધ કરો / Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Module Inspector Body */}
      {renderModuleContent()}
    </div>
  );
};

