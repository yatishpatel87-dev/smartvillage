import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Header } from './components/Header';
import { VillageControls } from './components/VillageControls';
import { ModuleInspector } from './components/ModuleInspector';
import { AutomationTourBanner } from './components/AutomationTourBanner';
import { ScienceFairGuideModal } from './components/ScienceFairGuideModal';
import { VillageState, ModuleId, TOUR_STEPS } from './types/village';
import { sound } from './utils/audio';

const INITIAL_VILLAGE_STATE: VillageState = {
  timeOfDay: 12.0, // Noon (sunny)
  isDaytime: true,
  selectedModule: null,
  language: 'gu',
  soundEnabled: true,
  cleanLiveMode: false,

  solar: {
    generationKw: 8.6,
    dailyTotalKwh: 42.4,
    batteryStoragePct: 92,
    efficiencyPct: 98,
    inverterActive: true,
    panelsAngleDeg: 24,
  },

  agriculture: {
    soilMoisturePct: 58,
    sprinklersActive: true, // Continuously active for live exhibition!
    autoIrrigation: true,
    moistureThreshold: 35,
    waterPumpRpm: 1800,
    lastIrrigationTime: '10:30 AM',
  },

  streetlights: {
    mode: 'auto-ldr',
    lightsActive: false,
    motionDetected: false,
    brightnessPct: 0,
    polesCount: 4,
    energySavedPct: 62,
  },

  watertank: {
    waterLevelPct: 75,
    pumpActive: true, // Live pumping water pulses
    autoPumpControl: true,
    minLevelThreshold: 25,
    maxLevelThreshold: 90,
    inflowLitersPerMin: 45,
    overflowAlert: false,
  },

  dustbin: {
    fillLevelPct: 40,
    lidOpen: false,
    distanceCm: 32,
    alertTriggered: false,
    lastEmptied: 'Yesterday',
  },

  biogas: {
    pressurePsi: 54,
    methanePct: 64,
    temperatureC: 37,
    dailyProductionM3: 4.8,
    slurryFlowing: true,
  },

  evstation: {
    carConnected: true,
    chargingActive: true, // Live energy pulse flowing into car
    batteryPct: 68,
    chargePowerKw: 22,
    estimatedRangeKm: 218,
  },

  automation: {
    isRunning: false,
    currentStepIndex: 0,
    isPaused: false,
    stepProgress: 0,
  },
};

export default function App() {
  const [state, setState] = useState<VillageState>(INITIAL_VILLAGE_STATE);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAutoCycleActive, setIsAutoCycleActive] = useState<boolean>(false); // Auto cycle through Day/Night
  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Time-of-day dynamics updater
  const handleTimeChange = useCallback((hour: number) => {
    setState((prev) => {
      const isDay = hour >= 6.0 && hour <= 18.0;

      // Solar generation calculation based on sun elevation angle
      let genKw = 0;
      if (hour >= 6 && hour <= 18) {
        const sunAngle = ((hour - 6) / 12) * Math.PI;
        genKw = Math.max(0, Math.sin(sunAngle) * 9.2);
      }

      // Streetlights LDR auto-sensing
      let streetOn = prev.streetlights.lightsActive;
      let brightness = prev.streetlights.brightnessPct;
      if (prev.streetlights.mode === 'auto-ldr') {
        streetOn = !isDay;
        brightness = !isDay ? (prev.streetlights.motionDetected ? 100 : 25) : 0;
      }

      return {
        ...prev,
        timeOfDay: hour,
        isDaytime: isDay,
        solar: {
          ...prev.solar,
          generationKw: prev.solar.inverterActive ? genKw : 0,
        },
        streetlights: {
          ...prev.streetlights,
          lightsActive: streetOn,
          brightnessPct: brightness,
        },
      };
    });
  }, []);

  // Module selection
  const handleSelectModule = useCallback((id: ModuleId | null) => {
    setState((prev) => ({
      ...prev,
      selectedModule: id,
    }));
  }, []);

  // Reset village simulation
  const handleResetVillage = () => {
    if (tourTimerRef.current) {
      clearInterval(tourTimerRef.current);
      tourTimerRef.current = null;
    }
    setState(INITIAL_VILLAGE_STATE);
  };

  // Toggle language
  const handleToggleLanguage = () => {
    setState((prev) => ({
      ...prev,
      language: prev.language === 'gu' ? 'en' : 'gu',
    }));
  };

  // Toggle sound
  const handleToggleSound = () => {
    setState((prev) => {
      const nextSound = !prev.soundEnabled;
      sound.enabled = nextSound;
      if (nextSound) {
        sound.initCtx();
        sound.startAmbientSoundscape();
        sound.updateAmbientTime(prev.timeOfDay);
      } else {
        sound.stopAmbientSoundscape();
      }
      return { ...prev, soundEnabled: nextSound };
    });
  };

  // Toggle Clean Live Mode ("કંઈ પણ લખાણ વચ્ચે ના આવવું જોઈએ")
  const handleToggleCleanMode = () => {
    setState((prev) => ({
      ...prev,
      cleanLiveMode: !prev.cleanLiveMode,
      selectedModule: null, // Clear module drawer so screen is pristine
    }));
  };

  // Continuous water filling sound synchronization with tank pumpActive state
  useEffect(() => {
    if (state.watertank.pumpActive && state.soundEnabled) {
      sound.startWaterFilling();
    } else {
      sound.stopWaterFilling();
    }
    return () => {
      sound.stopWaterFilling();
    };
  }, [state.watertank.pumpActive, state.soundEnabled]);

  // Ambient 'Village Life' Soundscape Lifecycle (Starts/Stops with sound toggle)
  useEffect(() => {
    if (state.soundEnabled) {
      sound.startAmbientSoundscape();
    } else {
      sound.stopAmbientSoundscape();
    }
    return () => {
      sound.stopAmbientSoundscape();
    };
  }, [state.soundEnabled]);

  // Ambient Day/Night Time update (smoothly updates soundscape without cancelling timer)
  useEffect(() => {
    sound.updateAmbientTime(state.timeOfDay);
  }, [state.timeOfDay]);

  // Unlock Web Audio context on first user interaction in the viewport
  useEffect(() => {
    const unlockAudio = () => {
      sound.initCtx();
      if (state.soundEnabled) {
        sound.startAmbientSoundscape();
        sound.updateAmbientTime(state.timeOfDay);
      }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [state.soundEnabled, state.timeOfDay]);


  // Continuous Live Day/Night Cycle Loop
  useEffect(() => {
    if (!isAutoCycleActive || state.automation.isRunning) return;

    const cycleInterval = setInterval(() => {
      setState((prev) => {
        const nextTime = (prev.timeOfDay + 0.05) % 24;
        const isDay = nextTime >= 6.0 && nextTime <= 18.0;

        let genKw = 0;
        if (nextTime >= 6 && nextTime <= 18) {
          const sunAngle = ((nextTime - 6) / 12) * Math.PI;
          genKw = Math.max(0, Math.sin(sunAngle) * 9.2);
        }

        let streetOn = prev.streetlights.lightsActive;
        let brightness = prev.streetlights.brightnessPct;
        if (prev.streetlights.mode === 'auto-ldr') {
          streetOn = !isDay;
          brightness = !isDay ? 25 : 0;
        }

        return {
          ...prev,
          timeOfDay: nextTime,
          isDaytime: isDay,
          solar: {
            ...prev.solar,
            generationKw: prev.solar.inverterActive ? genKw : 0,
          },
          streetlights: {
            ...prev.streetlights,
            lightsActive: streetOn,
            brightnessPct: brightness,
          },
        };
      });
    }, 400);

    return () => clearInterval(cycleInterval);
  }, [isAutoCycleActive, state.automation.isRunning]);

  // ===========================================================================
  // MASTER AUTOMATION ENGINE ("એક જ બટન વડે સમગ્ર ગામનું ઓટોમેશન શરૂ કરો")
  // ===========================================================================
  const startMasterAutomation = () => {
    if (tourTimerRef.current) {
      clearInterval(tourTimerRef.current);
    }

    setState((prev) => ({
      ...prev,
      timeOfDay: 10.5,
      isDaytime: true,
      selectedModule: 'solar',
      solar: {
        ...prev.solar,
        generationKw: 8.8,
        inverterActive: true,
      },
      automation: {
        isRunning: true,
        currentStepIndex: 0,
        isPaused: false,
        stepProgress: 0,
      },
    }));
  };

  const advanceTourStep = useCallback((stepIdx: number) => {
    if (stepIdx >= TOUR_STEPS.length) {
      // Tour completed!
      setState((prev) => ({
        ...prev,
        selectedModule: null,
        automation: { ...prev.automation, isRunning: false, currentStepIndex: 0, stepProgress: 0 },
      }));

      sound.playCelebration();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6', '#ec4899'],
        });
      } catch {}
      return;
    }

    const step = TOUR_STEPS[stepIdx];
    const targetModule = step.moduleId;

    setState((prev) => {
      const nextState = { ...prev };
      nextState.selectedModule = targetModule;
      nextState.automation = {
        ...prev.automation,
        currentStepIndex: stepIdx,
        stepProgress: 0,
      };

      if (targetModule === 'solar') {
        nextState.timeOfDay = 11.5;
        nextState.solar.generationKw = 9.2;
      } else if (targetModule === 'agriculture') {
        nextState.agriculture.soilMoisturePct = 32;
        nextState.agriculture.sprinklersActive = true;
        sound.playSprinklerPulse();
      } else if (targetModule === 'watertank') {
        // Start water pump to auto-fill tank from 20% with live pouring stream and sound!
        nextState.watertank.waterLevelPct = 20;
        nextState.watertank.pumpActive = true;
        sound.playWaterFillSound();
        sound.playPumpPulse();
      } else if (targetModule === 'biogas') {
        nextState.biogas.pressurePsi = 58;
        nextState.biogas.slurryFlowing = true;
      } else if (targetModule === 'dustbin') {
        nextState.dustbin.lidOpen = true;
        nextState.dustbin.fillLevelPct = 88;
        nextState.dustbin.alertTriggered = true;
        sound.playAlert();
      } else if (targetModule === 'evstation') {
        nextState.evstation.chargingActive = true;
        sound.playEVCharge();
      } else if (targetModule === 'streetlights') {
        nextState.timeOfDay = 20.5;
        nextState.isDaytime = false;
        nextState.streetlights.lightsActive = true;
        nextState.streetlights.brightnessPct = 100;
        nextState.streetlights.motionDetected = true;
        sound.playRelay();
      }

      return nextState;
    });
  }, []);

  // Automation tour loop timer
  useEffect(() => {
    if (!state.automation.isRunning || state.automation.isPaused) {
      if (tourTimerRef.current) {
        clearInterval(tourTimerRef.current);
        tourTimerRef.current = null;
      }
      return;
    }

    const currentStepConfig = TOUR_STEPS[state.automation.currentStepIndex];
    if (!currentStepConfig) return;

    const intervalMs = 150;
    const progressInc = (intervalMs / currentStepConfig.durationMs) * 100;

    tourTimerRef.current = setInterval(() => {
      setState((prev) => {
        const nextProgress = prev.automation.stepProgress + progressInc;
        if (nextProgress >= 100) {
          advanceTourStep(prev.automation.currentStepIndex + 1);
          return prev;
        }
        return {
          ...prev,
          automation: {
            ...prev.automation,
            stepProgress: nextProgress,
          },
        };
      });
    }, intervalMs);

    return () => {
      if (tourTimerRef.current) {
        clearInterval(tourTimerRef.current);
      }
    };
  }, [state.automation.isRunning, state.automation.isPaused, state.automation.currentStepIndex, advanceTourStep]);

  // Continuous background physics simulation
  useEffect(() => {
    const simInterval = setInterval(() => {
      setState((prev) => {
        // Continuous soil moisture cycle
        let newMoisture = prev.agriculture.soilMoisturePct;
        if (prev.agriculture.sprinklersActive) {
          newMoisture = Math.min(85, newMoisture + 0.35);
        } else {
          newMoisture = Math.max(25, newMoisture - 0.08);
        }

        // Realistic live water tank filling & consumption dynamics
        let newWaterLevel = prev.watertank.waterLevelPct;
        let pumpActive = prev.watertank.pumpActive;

        if (pumpActive) {
          // Water visibly rises while pouring stream cascades down!
          newWaterLevel = Math.min(93, newWaterLevel + 1.2);
          if (newWaterLevel >= 92 && prev.watertank.autoPumpControl) {
            pumpActive = false; // Auto shutoff to prevent overflow!
            sound.playRelay();
          }
        } else {
          // Slow village consumption
          newWaterLevel = Math.max(18, newWaterLevel - 0.05);
          if (newWaterLevel <= 22 && prev.watertank.autoPumpControl) {
            pumpActive = true; // IoT sensor triggers refill!
            sound.playWaterFillSound();
          }
        }

        // EV Battery pulse
        let newBattery = prev.evstation.batteryPct;
        if (prev.evstation.chargingActive) {
          newBattery = newBattery >= 99 ? 45 : newBattery + 0.25;
        }

        return {
          ...prev,
          agriculture: {
            ...prev.agriculture,
            soilMoisturePct: newMoisture,
          },
          watertank: {
            ...prev.watertank,
            waterLevelPct: newWaterLevel,
            pumpActive,
          },
          evstation: {
            ...prev.evstation,
            batteryPct: newBattery,
          },
        };
      });
    }, 450);

    return () => clearInterval(simInterval);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D Three.js Interactive Canvas */}
      <ThreeCanvas
        state={state}
        onSelectModule={handleSelectModule}
        onTimeChange={handleTimeChange}
      />

      {/* Top Header & Clean Mode Toggle */}
      <Header
        state={state}
        onStartAutomation={startMasterAutomation}
        onResetVillage={handleResetVillage}
        onToggleLanguage={handleToggleLanguage}
        onToggleSound={handleToggleSound}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleCleanMode={handleToggleCleanMode}
      />

      {/* Cinematic Automation Tour Banner (Bottom docked so center is completely clear) */}
      <AutomationTourBanner
        state={state}
        onPauseToggle={() => {
          setState((prev) => ({
            ...prev,
            automation: { ...prev.automation, isPaused: !prev.automation.isPaused },
          }));
        }}
        onNextStep={() => advanceTourStep(state.automation.currentStepIndex + 1)}
        onPrevStep={() => advanceTourStep(Math.max(0, state.automation.currentStepIndex - 1))}
        onExitTour={() => {
          setState((prev) => ({
            ...prev,
            automation: { ...prev.automation, isRunning: false, currentStepIndex: 0, stepProgress: 0 },
          }));
        }}
      />

      {/* Sleek Collapsible Module Inspector (Side docked) */}
      <ModuleInspector
        state={state}
        onClose={() => handleSelectModule(null)}
        onUpdateState={setState}
      />

      {/* Bottom Village Controls Dock */}
      <VillageControls
        state={state}
        onTimeChange={handleTimeChange}
        onSelectModule={handleSelectModule}
        isAutoCycleActive={isAutoCycleActive}
        onToggleAutoCycle={() => setIsAutoCycleActive((prev) => !prev)}
      />

      {/* Student & Judge Science Fair Handbook Modal */}
      <ScienceFairGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        language={state.language}
      />
    </div>
  );
}
