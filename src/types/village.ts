export type ModuleId =
  | 'solar'
  | 'agriculture'
  | 'streetlights'
  | 'watertank'
  | 'dustbin'
  | 'biogas'
  | 'evstation';

export interface ModuleInfo {
  id: ModuleId;
  number: number;
  titleGu: string;
  titleEn: string;
  taglineGu: string;
  taglineEn: string;
  icon: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface VillageState {
  timeOfDay: number; // 0 to 24 (hours)
  isDaytime: boolean;
  selectedModule: ModuleId | null;
  language: 'gu' | 'en';
  soundEnabled: boolean;
  cleanLiveMode: boolean; // When true, all text/overlays are hidden for pure live 3D visualization
  
  // 1. Solar School & Eco-House
  solar: {
    generationKw: number;
    dailyTotalKwh: number;
    batteryStoragePct: number;
    efficiencyPct: number;
    inverterActive: boolean;
    panelsAngleDeg: number;
  };

  // 2. AI Smart Agriculture
  agriculture: {
    soilMoisturePct: number;
    sprinklersActive: boolean;
    autoIrrigation: boolean;
    moistureThreshold: number; // default 35%
    waterPumpRpm: number;
    lastIrrigationTime: string;
  };

  // 3. Smart Street Lights
  streetlights: {
    mode: 'auto-ldr' | 'manual-on' | 'manual-off';
    lightsActive: boolean;
    motionDetected: boolean;
    brightnessPct: number; // 0, 25, 100
    polesCount: number;
    energySavedPct: number;
  };

  // 4. Smart Water System
  watertank: {
    waterLevelPct: number;
    pumpActive: boolean;
    autoPumpControl: boolean;
    minLevelThreshold: number; // 25%
    maxLevelThreshold: number; // 90%
    inflowLitersPerMin: number;
    overflowAlert: boolean;
  };

  // 5. Smart Dustbin
  dustbin: {
    fillLevelPct: number;
    lidOpen: boolean;
    distanceCm: number;
    alertTriggered: boolean; // >= 85%
    lastEmptied: string;
  };

  // 6. Biogas Plant
  biogas: {
    pressurePsi: number; // 0 to 100 PSI (normal 45-60)
    methanePct: number;
    temperatureC: number;
    dailyProductionM3: number;
    slurryFlowing: boolean;
  };

  // 7. EV Charging Station
  evstation: {
    carConnected: boolean;
    chargingActive: boolean;
    batteryPct: number;
    chargePowerKw: number;
    estimatedRangeKm: number;
  };

  // Master Automation Tour
  automation: {
    isRunning: boolean;
    currentStepIndex: number;
    isPaused: boolean;
    stepProgress: number; // 0 to 100
  };
}

export const MODULE_DEFINITIONS: Record<ModuleId, ModuleInfo> = {
  solar: {
    id: 'solar',
    number: 1,
    titleGu: 'સોલાર શાળા અને ઘર',
    titleEn: 'Solar School & Eco-Home',
    taglineGu: 'રૂફટોપ સોલાર પેનલ્સ અને રિયલ-ટાઇમ ગ્રીન એનર્જી જનરેશન',
    taglineEn: 'Rooftop solar panels & real-time clean power generation',
    icon: 'Sun',
    cameraPos: [14, 12, 12],
    cameraTarget: [10, 2, 8],
  },
  agriculture: {
    id: 'agriculture',
    number: 2,
    titleGu: 'AI સ્માર્ટ ખેતી',
    titleEn: 'AI Smart Agriculture',
    taglineGu: 'માટીમાં સેન્સર પ્રોબ અને આપોઆપ શરૂ થતા ૩D વોટર સ્પ્રિંકલર્સ',
    taglineEn: 'IoT soil moisture probes & automated rotating 3D water sprinklers',
    icon: 'Sprout',
    cameraPos: [-10, 9, 14],
    cameraTarget: [-10, 0, 8],
  },
  streetlights: {
    id: 'streetlights',
    number: 3,
    titleGu: 'સ્માર્ટ સ્ટ્રીટ લાઈટ્સ',
    titleEn: 'Smart Street Lights',
    taglineGu: 'LDR ડે/નાઈટ સેન્સર અને વાહન આવતાં બમણી રોશની આપતા મોશન સેન્સર',
    taglineEn: 'LDR day/night sensor & PIR motion-activated adaptive lighting',
    icon: 'Lamp',
    cameraPos: [0, 8, 16],
    cameraTarget: [0, 1.5, 3],
  },
  watertank: {
    id: 'watertank',
    number: 4,
    titleGu: 'સ્માર્ટ પાણી વ્યવસ્થા',
    titleEn: 'Smart Water Management',
    taglineGu: 'પારદર્શક ૩D ટાંકી, લાઈવ પાણીનું સ્તર અને સ્વયંસંચાલિત પંપ નિયંત્રણ',
    taglineEn: 'Transparent overhead tank, live 3D water levels & IoT pump automation',
    icon: 'Droplets',
    cameraPos: [-6.5, 9.5, 1.8],
    cameraTarget: [-10, 6.8, -4],
  },
  dustbin: {
    id: 'dustbin',
    number: 5,
    titleGu: 'સ્માર્ટ કચરાપેટી',
    titleEn: 'Smart IoT Dustbin',
    taglineGu: 'અલ્ટ્રાસોનિક સેન્સર, ઓટો-લિડ ઓપનિંગ અને ૮૫% ભરાતાં એલર્ટ સિરેન',
    taglineEn: 'Ultrasonic distance sensor, automated lid & 85% overflow siren alert',
    icon: 'Trash2',
    cameraPos: [4, 6, 8],
    cameraTarget: [3, 1, 4],
  },
  biogas: {
    id: 'biogas',
    number: 6,
    titleGu: 'બાયોગેસ પ્લાન્ટ',
    titleEn: 'Biogas Digester Plant',
    taglineGu: 'જૈવિક કચરામાંથી મિથેન ગેસ અને રોટેટ થતી પ્રેશર ગેજ સોય (Needle)',
    taglineEn: 'Bio-waste anaerobic digester with dynamic rotating pressure needle',
    icon: 'Flame',
    cameraPos: [13, 8, -8],
    cameraTarget: [9, 1.5, -6],
  },
  evstation: {
    id: 'evstation',
    number: 7,
    titleGu: 'ગાડી - EV ચાર્જિંગ',
    titleEn: 'Electric Vehicle & Solar Charging',
    taglineGu: '૩D ઇલેક્ટ્રિક કાર, ગ્લોઇંગ ચાર્જિંગ કેબલ અને લાઈવ બેટરી ચાર્જિંગ',
    taglineEn: '3D electric vehicle, glowing animated cable & real-time battery SoC',
    icon: 'Zap',
    cameraPos: [-6, 7, -12],
    cameraTarget: [-4, 1.5, -9],
  },
};

export const TOUR_STEPS: {
  moduleId: ModuleId;
  durationMs: number;
  narrationGu: string;
  narrationEn: string;
}[] = [
  {
    moduleId: 'solar',
    durationMs: 6500,
    narrationGu: 'પગલું ૧: સૂર્યોદય થતાં જ સોલાર પેનલ સૂર્યકિરણો શોષીને શાળા અને ઘરો માટે સ્વચ્છ વીજળી ઉત્પન્ન કરે છે!',
    narrationEn: 'Step 1: Rooftop solar photovoltaic panels capture sunlight to power school and village homes with clean energy!',
  },
  {
    moduleId: 'agriculture',
    durationMs: 7000,
    narrationGu: 'પગલું ૨: ખેતરમાં ભેજ ઓછો થતાં જ AI સોઇલ સેન્સર ડિટેક્ટ કરે છે અને ૩D વોટર સ્પ્રિંકલર્સ આપોઆપ શરૂ થાય છે!',
    narrationEn: 'Step 2: AI soil probe detects low moisture and automatically fires 3D water sprinklers, conserving 40% water!',
  },
  {
    moduleId: 'watertank',
    durationMs: 6500,
    narrationGu: 'પગલું ૩: સ્માર્ટ વોટર ટાંકીમાં પાણી ઘટતાં જ IoT સબમર્સિબલ પંપ શરૂ થાય છે અને ૯૦% પર આપોઆપ બંધ થઈ જાય છે!',
    narrationEn: 'Step 3: Smart overhead tank detects low levels via ultrasonic pulses and auto-fills without any water overflow!',
  },
  {
    moduleId: 'biogas',
    durationMs: 6500,
    narrationGu: 'પગલું ૪: ગોબર અને કચરામાંથી મિથેન બાયોગેસ બને છે - પ્રેશર ગેજ સોય યોગ્ય દબાણ દર્શાવે છે અને ખેતી માટે ખાતર મળે છે!',
    narrationEn: 'Step 4: Anaerobic digestion generates methane fuel with live pressure gauge, producing organic slurry for crops!',
  },
  {
    moduleId: 'dustbin',
    durationMs: 6000,
    narrationGu: 'પગલું ૫: સ્માર્ટ ડસ્ટબિન પાસે જતાં જ ઢાંકણ ખૂલે છે અને કચરો ૮૫% ભરાતાં લાલ એલર્ટ બત્તી સળગે છે!',
    narrationEn: 'Step 5: Ultrasonic dustbin automatically opens lid upon approach and transmits buzzer alert when reaching 85% capacity!',
  },
  {
    moduleId: 'evstation',
    durationMs: 6500,
    narrationGu: 'પગલું ૬: સોલાર પાવર્ડ EV સ્ટેશન પર ઇલેક્ટ્રિક કાર ગ્રીન એનર્જીથી ફાસ્ટ ચાર્જ થાય છે - ૦% પ્રદૂષણ!',
    narrationEn: 'Step 6: Electric Vehicle charges rapidly using solar canopy power with glowing pulsed cable and zero emissions!',
  },
  {
    moduleId: 'streetlights',
    durationMs: 7500,
    narrationGu: 'પગલું ૭: સાંજ પડતાં જ LDR સેન્સરથી સ્ટ્રીટ લાઈટ્સ શરૂ થાય છે અને વાહન આવતાં તેજસ્વી રોશની આપે છે!',
    narrationEn: 'Step 7: Dusk activates streetlights automatically via LDR photoresistor, flaring to full brightness on motion detection!',
  },
];
