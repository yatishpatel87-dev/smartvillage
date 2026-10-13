/**
 * Web Audio API synthesized sound generator
 * Zero external asset dependencies - works instantly in any browser
 *
 * Immersive 'Village Life' (ગ્રામીણ જીવન) ambient soundscapes:
 * - Daytime: Natural rural birds (Sparrows, Asian Koel "Kuhu-Kuhu", Bulbul warble, Morning Rooster)
 * - Nighttime: Serene rural nightscape (Field crickets chorus bed, foreground stridulation chirps, night owl)
 * - Gentle outdoor natural atmosphere (Rural warm breeze & soft water stream presence)
 * - Synchronized water tank gush & pump audio
 * - Relay clicks, irrigation sprinkler spray, EV charger hum, alert buzzers
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  // Water filling audio nodes
  private waterFillSource: AudioBufferSourceNode | null = null;
  private waterFillGain: GainNode | null = null;
  private waterLfo: OscillatorNode | null = null;
  private pumpOsc: OscillatorNode | null = null;
  private isWaterFillingActive: boolean = false;

  // Ambient soundscape state
  private isAmbientActive: boolean = false;
  private ambientTimeOfDay: number = 12.0; // Current village time (0-24h)
  private ambientTimer: NodeJS.Timeout | null = null;

  // Continuous subtle ambient beds (breeze & night cricket chorus)
  private breezeGain: GainNode | null = null;
  private breezeSource: AudioBufferSourceNode | null = null;
  private nightCricketBedGain: GainNode | null = null;
  private nightCricketOsc: OscillatorNode | null = null;
  private nightCricketLfo: OscillatorNode | null = null;

  public initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft UI click
  playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }

  // Relay switch click (for solar inverter / street light switch)
  playRelay() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  // Water Sprinkler whoosh / hiss pulse
  playSprinklerPulse() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2400;
      filter.Q.value = 2.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Water pump motor pulse
  playPumpPulse() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  // Continuous realistic water filling stream & pump audio
  startWaterFilling() {
    if (!this.enabled || this.isWaterFillingActive) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.isWaterFillingActive = true;
      const now = this.ctx.currentTime;

      // 1. Looping Water Gush & Pour Noise Buffer (3 seconds continuous loop)
      const bufferSize = this.ctx.sampleRate * 3.0;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.04 * white) / 1.04;
        data[i] = lastOut * 3.5;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      this.waterFillSource = noiseSource;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(2.2, now);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(1.8, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(220, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);
      this.waterLfo = lfo;

      const waterGain = this.ctx.createGain();
      waterGain.gain.setValueAtTime(0.001, now);
      waterGain.gain.linearRampToValueAtTime(0.12, now + 0.25);
      this.waterFillGain = waterGain;

      noiseSource.connect(filter);
      filter.connect(waterGain);
      waterGain.connect(this.ctx.destination);
      noiseSource.start(now);

      // 2. Submersible Water Pump Drone (Low Sawtooth Hum)
      const pump = this.ctx.createOscillator();
      pump.type = 'sawtooth';
      pump.frequency.setValueAtTime(88, now);

      const pumpFilter = this.ctx.createBiquadFilter();
      pumpFilter.type = 'lowpass';
      pumpFilter.frequency.setValueAtTime(240, now);

      const pumpGain = this.ctx.createGain();
      pumpGain.gain.setValueAtTime(0.001, now);
      pumpGain.gain.linearRampToValueAtTime(0.035, now + 0.2);

      pump.connect(pumpFilter);
      pumpFilter.connect(pumpGain);
      pumpGain.connect(this.ctx.destination);
      pump.start(now);
      this.pumpOsc = pump;
    } catch {}
  }

  // Stop the continuous water filling sound gracefully
  stopWaterFilling() {
    if (!this.isWaterFillingActive || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.isWaterFillingActive = false;

      if (this.waterFillGain) {
        this.waterFillGain.gain.setValueAtTime(this.waterFillGain.gain.value, now);
        this.waterFillGain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
      }

      setTimeout(() => {
        try {
          if (this.waterFillSource) {
            this.waterFillSource.stop();
            this.waterFillSource.disconnect();
            this.waterFillSource = null;
          }
          if (this.waterLfo) {
            this.waterLfo.stop();
            this.waterLfo.disconnect();
            this.waterLfo = null;
          }
          if (this.pumpOsc) {
            this.pumpOsc.stop();
            this.pumpOsc.disconnect();
            this.pumpOsc = null;
          }
          this.waterFillGain = null;
        } catch {}
      }, 300);
    } catch {}
  }

  // Quick single pulse fallback
  playWaterFillSound() {
    this.startWaterFilling();
    setTimeout(() => {
      this.stopWaterFilling();
    }, 2500);
  }

  // ===========================================================================
  // AMBIENT 'VILLAGE LIFE' SOUNDSCAPES (BIRDS BY DAY, CRICKETS BY NIGHT)
  // ===========================================================================

  // 1. Double Sparrow Trill: two rapid ascending-descending bright chirps
  playSparrowChirp() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      [0, 0.12].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';

        const baseFreq = 2700 + Math.random() * 500;
        osc.frequency.setValueAtTime(baseFreq, now + offset);
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 1300, now + offset + 0.04);
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 100, now + offset + 0.085);

        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.linearRampToValueAtTime(0.042, now + offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.095);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });
    } catch {}
  }

  // 2. Iconic Indian Asian Koel call (કૂહૂ-કૂહૂ / Kuhu-Kuhu): Two resonant ascending flutes
  playKoelCall() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      [0, 0.38].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';

        const startFreq = 1250 + idx * 120;
        const endFreq = 1680 + idx * 150;

        osc.frequency.setValueAtTime(startFreq, now + offset);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + offset + 0.22);

        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.linearRampToValueAtTime(0.045, now + offset + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.3);
      });
    } catch {}
  }

  // 3. High Songbird / Bulbul Warble: rapid FM flutter
  playSongbirdWarble() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const fm = this.ctx.createOscillator();
      const fmGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(3100 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(2300, now + 0.22);

      fm.type = 'sine';
      fm.frequency.setValueAtTime(34, now); // 34 Hz vibrato flutter
      fmGain.gain.setValueAtTime(420, now);
      fm.connect(fmGain);
      fmGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.038, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      fm.start(now);
      osc.start(now);
      fm.stop(now + 0.23);
      osc.stop(now + 0.23);
    } catch {}
  }

  // 4. Early Morning Rooster (કૂકડો કૂકડે કૂક): Distinct 4-part village dawn crow
  playRoosterCrow() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 4 notes: "cock-a-doodle-doooo"
      const notes = [
        { freq: 440, dur: 0.1, delay: 0.0 },
        { freq: 520, dur: 0.12, delay: 0.12 },
        { freq: 659, dur: 0.14, delay: 0.26 },
        { freq: 587, dur: 0.45, delay: 0.42 },
      ];

      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now + n.delay);

        osc.frequency.setValueAtTime(n.freq, now + n.delay);
        if (n.dur > 0.3) {
          osc.frequency.exponentialRampToValueAtTime(n.freq - 60, now + n.delay + n.dur);
        }

        gain.gain.setValueAtTime(0.001, now + n.delay);
        gain.gain.linearRampToValueAtTime(0.026, now + n.delay + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.delay + n.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + n.delay);
        osc.stop(now + n.delay + n.dur + 0.02);
      });
    } catch {}
  }

  // 5. Gentle Dove Coo (હોલો / પારેવું): soft soothing coo
  playDoveCoo() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      [0, 0.22, 0.46].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';

        const freq = idx === 1 ? 580 : 520;
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.linearRampToValueAtTime(0.03, now + offset + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.19);
      });
    } catch {}
  }

  // Master daytime bird dispatcher
  playDayBirdChirp() {
    const hour = this.ambientTimeOfDay;
    // Early morning rooster (5:00 - 8:00 AM)
    if (hour >= 5.0 && hour <= 8.0 && Math.random() < 0.35) {
      this.playRoosterCrow();
      return;
    }

    const rand = Math.random();
    if (rand < 0.35) {
      this.playKoelCall(); // Iconic Gujarat bird
    } else if (rand < 0.65) {
      this.playSparrowChirp();
    } else if (rand < 0.85) {
      this.playSongbirdWarble();
    } else {
      this.playDoveCoo();
    }
  }

  // Nighttime foreground cricket stridulation (crisp chirp clicks)
  playNightCricketChirp() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const clickCount = 3 + Math.floor(Math.random() * 3);
      const baseFreq = 4700 + Math.random() * 400; // Distinct high pitch of rural crickets

      for (let c = 0; c < clickCount; c++) {
        const offset = c * 0.024;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq + (c % 2) * 160, now + offset);

        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.linearRampToValueAtTime(0.034, now + offset + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.02);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.022);
      }
    } catch {}
  }

  // Night Owl double hoot (ઘુવડ)
  playOwlHoot() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      [0, 0.32].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';

        const f = idx === 0 ? 380 : 340;
        osc.frequency.setValueAtTime(f, now + offset);
        osc.frequency.exponentialRampToValueAtTime(f - 40, now + offset + 0.22);

        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.linearRampToValueAtTime(0.024, now + offset + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.24);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.25);
      });
    } catch {}
  }

  // Master nighttime ambient dispatcher
  playNightSound() {
    const hour = this.ambientTimeOfDay;
    // Deep night owl hoot (21:00 - 4:00 AM) occasionally
    if ((hour >= 21.0 || hour <= 4.0) && Math.random() < 0.25) {
      this.playOwlHoot();
    } else {
      this.playNightCricketChirp();
    }
  }

  // Start continuous subtle ambient background beds (Gentle rural breeze & night cricket chorus)
  private startBackgroundBeds() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Subtle gentle rural breeze (continuous loop)
    if (!this.breezeSource) {
      try {
        const bufferSize = this.ctx.sampleRate * 4.0;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99765 * b0 + white * 0.05;
          b1 = 0.963 * b1 + white * 0.08;
          b2 = 0.57 * b2 + white * 0.25;
          data[i] = (b0 + b1 + b2) * 0.12;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.008, now + 1.0); // Very subtle, calming background presence

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(now);

        this.breezeSource = source;
        this.breezeGain = gain;
      } catch {}
    }

    // 2. Night cricket chorus bed (serene background shimmer active at night)
    this.updateBackgroundAmbience(this.isDaytimeNow());
  }

  // Update background bed depending on day/night
  private updateBackgroundAmbience(isDay: boolean) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (!isDay && this.enabled) {
      // Night: Enable cricket chorus bed
      if (!this.nightCricketOsc) {
        try {
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(4650, now);

          const lfo = this.ctx.createOscillator();
          lfo.frequency.setValueAtTime(14, now); // 14 Hz cricket wing tremor
          const lfoGain = this.ctx.createGain();
          lfoGain.gain.setValueAtTime(0.012, now);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.012, now + 1.2);

          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          lfo.start(now);
          osc.start(now);

          this.nightCricketOsc = osc;
          this.nightCricketLfo = lfo;
          this.nightCricketBedGain = gain;
        } catch {}
      } else if (this.nightCricketBedGain) {
        this.nightCricketBedGain.gain.setValueAtTime(this.nightCricketBedGain.gain.value, now);
        this.nightCricketBedGain.gain.linearRampToValueAtTime(0.012, now + 0.8);
      }
    } else {
      // Day: Fade out night cricket chorus
      if (this.nightCricketBedGain) {
        this.nightCricketBedGain.gain.setValueAtTime(this.nightCricketBedGain.gain.value, now);
        this.nightCricketBedGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      }
    }
  }

  private isDaytimeNow(): boolean {
    return this.ambientTimeOfDay >= 6.0 && this.ambientTimeOfDay <= 18.5;
  }

  // Start the continuous ambient scheduler loop
  startAmbientSoundscape() {
    if (!this.enabled) return;
    this.initCtx();
    this.startBackgroundBeds();

    if (this.isAmbientActive) return;
    this.isAmbientActive = true;
    this.scheduleNextAmbientSound();
  }

  // Stop the ambient soundscape loop
  stopAmbientSoundscape() {
    this.isAmbientActive = false;
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }

    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.breezeGain) {
        this.breezeGain.gain.setValueAtTime(this.breezeGain.gain.value, now);
        this.breezeGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      }
      if (this.nightCricketBedGain) {
        this.nightCricketBedGain.gain.setValueAtTime(this.nightCricketBedGain.gain.value, now);
        this.nightCricketBedGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      }
    }
  }

  // Dynamically update the current time of day for the ambient soundscape
  updateAmbientTime(hour: number) {
    const wasDay = this.isDaytimeNow();
    this.ambientTimeOfDay = hour;
    const isDay = this.isDaytimeNow();

    if (wasDay !== isDay && this.isAmbientActive) {
      this.updateBackgroundAmbience(isDay);
    }
  }

  // Schedule next procedural ambient sound based on whether it is day or night in the village
  private scheduleNextAmbientSound() {
    if (!this.isAmbientActive || !this.enabled) return;

    const isDay = this.isDaytimeNow();
    let delayMs = 3000;

    if (isDay) {
      // Day: Birds chirp at random natural intervals (every 2.5 to 5.0 seconds)
      this.playDayBirdChirp();
      delayMs = 2500 + Math.random() * 2500;
    } else {
      // Night: Crickets chirp rhythmically (every 1.5 to 3.0 seconds)
      this.playNightSound();
      delayMs = 1500 + Math.random() * 1500;
    }

    this.ambientTimer = setTimeout(() => {
      this.scheduleNextAmbientSound();
    }, delayMs);
  }

  // Instant test of current ambient soundscape (called when user clicks the soundscape badge)
  testCurrentAmbient() {
    this.initCtx();
    if (this.isDaytimeNow()) {
      this.playDayBirdChirp();
    } else {
      this.playNightCricketChirp();
    }
  }

  // Sensor Alert (Dustbin full or Water Tank low)
  playAlert() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.12].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now + offset);
        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });
    } catch {}
  }

  // EV charging electric pulse
  playEVCharge() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Science Fair celebration fanfare
  playCelebration() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.14, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch {}
  }
}

export const sound = new SoundController();
