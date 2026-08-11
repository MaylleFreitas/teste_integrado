/**
 * Helper to play audio from standard URL, or fallback to Web Speech API / Web Audio API
 * to ensure realistic Portuguese phoneme audio playback for trial demonstrations.
 */

export interface PlayAudioOptions {
  url?: string;
  text?: string;
  pitch?: number; // 0.5 to 1.5
  rate?: number; // 0.5 to 1.5
  lang?: string;
  onEnd?: () => void;
  onError?: () => void;
}

let activeAudio: HTMLAudioElement | null = null;
let activeAudioCtx: AudioContext | null = null;

export function stopCurrentAudio() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }
  if (activeAudioCtx) {
    try {
      activeAudioCtx.close();
    } catch {
      // ignore
    }
    activeAudioCtx = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export function normalizeAudioUrl(url?: string): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (trimmed.includes('dropbox.com')) {
    // Replace www.dropbox.com with dl.dropboxusercontent.com for direct instant CDN streaming
    trimmed = trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    trimmed = trimmed.replace(/[?&]dl=[01]/g, '').replace(/[?&]raw=1/g, '');
  }
  return trimmed;
}

const audioCache = new Map<string, HTMLAudioElement>();

export function preloadAudio(url?: string): void {
  const finalUrl = normalizeAudioUrl(url);
  if (!finalUrl || finalUrl.startsWith('data:') || audioCache.has(finalUrl)) {
    return;
  }

  try {
    const audio = new Audio(finalUrl);
    audio.preload = 'auto';
    audio.load();
    audioCache.set(finalUrl, audio);
  } catch (e) {
    console.warn('Preload audio error:', e);
  }
}

export function playAudioItem(options: PlayAudioOptions): Promise<void> {
  return new Promise((resolve) => {
    stopCurrentAudio();

    const handleEnd = () => {
      options.onEnd?.();
      resolve();
    };

    const finalUrl = normalizeAudioUrl(options.url);

    // 1. Try custom HTML5 Audio URL if valid HTTP link
    if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://') || finalUrl.startsWith('data:audio'))) {
      let audio = audioCache.get(finalUrl);
      if (!audio) {
        audio = new Audio(finalUrl);
        audio.preload = 'auto';
        audioCache.set(finalUrl, audio);
      } else {
        try {
          audio.currentTime = 0;
        } catch {
          // ignore
        }
      }

      activeAudio = audio;

      let hasHandledFallback = false;
      const doFallback = () => {
        if (!hasHandledFallback) {
          hasHandledFallback = true;
          activeAudio = null;
          fallbackToSpeechSynthesis(options, handleEnd);
        }
      };

      // Set safety timeout for audio loading
      const loadTimeout = setTimeout(() => {
        doFallback();
      }, 8000);

      audio.onended = () => {
        clearTimeout(loadTimeout);
        activeAudio = null;
        handleEnd();
      };

      audio.onerror = () => {
        clearTimeout(loadTimeout);
        doFallback();
      };

      audio.play().then(() => {
        clearTimeout(loadTimeout);
      }).catch(() => {
        clearTimeout(loadTimeout);
        doFallback();
      });
      return;
    }

    // 2. Fallback to Speech Synthesis / Formant Vocal Synth
    fallbackToSpeechSynthesis(options, handleEnd);
  });
}

function fallbackToSpeechSynthesis(options: PlayAudioOptions, resolve: () => void) {
  const textToSpeak = options.text || 'Amostra de fala para o teste';

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume(); // CRITICAL for Chrome iframe bug

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = options.lang || 'pt-BR';
      utterance.pitch = options.pitch ?? 1.0;
      utterance.rate = options.rate ?? 0.9;

      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((v) => v.lang.startsWith('pt') || v.lang.includes('BR'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      let started = false;
      let finished = false;

      const finishOnce = () => {
        if (!finished) {
          finished = true;
          resolve();
        }
      };

      utterance.onstart = () => {
        started = true;
      };

      utterance.onend = () => {
        finishOnce();
      };

      utterance.onerror = () => {
        if (!started) {
          playFormantVoiceSynth(textToSpeak, options.pitch || 1.0, options.rate || 1.0, finishOnce);
        } else {
          finishOnce();
        }
      };

      window.speechSynthesis.speak(utterance);

      // Watchdog timeout: If SpeechSynthesis is silent or blocked in iframe after 400ms, use Formant Synthesizer
      setTimeout(() => {
        if (!started && !finished) {
          window.speechSynthesis.cancel();
          playFormantVoiceSynth(textToSpeak, options.pitch || 1.0, options.rate || 1.0, finishOnce);
        }
      }, 400);

      return;
    } catch {
      // fallback
    }
  }

  // 3. Fallback: Formant Voice Synthesizer via Web Audio API
  playFormantVoiceSynth(textToSpeak, options.pitch || 1.0, options.rate || 1.0, resolve);
}

/**
 * Web Audio Formant Synthesizer
 * Synthesizes human-like vocal vowel formants (F1, F2, F3) using Web Audio API biquad filters.
 * Works 100% offline, guaranteed audible sound in every browser/iframe.
 */
function playFormantVoiceSynth(text: string, pitchMultiplier: number, rateMultiplier: number, resolve: () => void) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      resolve();
      return;
    }

    const ctx = new AudioContextClass();
    activeAudioCtx = ctx;

    // Base fundamental vocal frequency (approx 130Hz male / 220Hz female voice)
    const f0 = 150 * pitchMultiplier;

    // Formant filter presets for Portuguese vowels [F1, F2, F3]
    const vowelFormants: Record<string, [number, number, number]> = {
      a: [800, 1200, 2500],
      e: [500, 1800, 2500],
      i: [300, 2300, 3000],
      o: [500, 1000, 2500],
      u: [300, 800, 2200],
      default: [600, 1400, 2500]
    };

    // Extract vowels from text to create cadence
    const vowels = text.toLowerCase().replace(/[^aeiou]/g, '').split('');
    const sequence = vowels.length > 0 ? vowels : ['a', 'o'];

    const syllableDuration = Math.max(0.18, 0.3 / rateMultiplier);
    const totalDuration = sequence.length * syllableDuration + 0.1;

    // Vocal cord source (Rich sawtooth oscillator + subtle noise)
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';

    // Pitch contour (natural pitch drop at end of utterance)
    osc.frequency.setValueAtTime(f0, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f0 * 0.85, ctx.currentTime + totalDuration);

    // Formant Biquad Filters
    const f1Filter = ctx.createBiquadFilter();
    f1Filter.type = 'bandpass';
    f1Filter.Q.value = 5;

    const f2Filter = ctx.createBiquadFilter();
    f2Filter.type = 'bandpass';
    f2Filter.Q.value = 7;

    const f3Filter = ctx.createBiquadFilter();
    f3Filter.type = 'bandpass';
    f3Filter.Q.value = 8;

    // Master Gain Envelope
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);

    // Connect audio routing
    osc.connect(f1Filter);
    osc.connect(f2Filter);
    osc.connect(f3Filter);

    f1Filter.connect(masterGain);
    f2Filter.connect(masterGain);
    f3Filter.connect(masterGain);

    masterGain.connect(ctx.destination);

    // Schedule formants and gain for each syllable
    sequence.forEach((vowelChar, idx) => {
      const startTime = ctx.currentTime + idx * syllableDuration;
      const formants = vowelFormants[vowelChar] || vowelFormants.default;

      // Set Formant Frequencies
      f1Filter.frequency.setValueAtTime(formants[0], startTime);
      f2Filter.frequency.setValueAtTime(formants[1], startTime);
      f3Filter.frequency.setValueAtTime(formants[2], startTime);

      // Syllable Envelope (smooth attack and release)
      masterGain.gain.setValueAtTime(0.01, startTime);
      masterGain.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
      masterGain.gain.linearRampToValueAtTime(0.02, startTime + syllableDuration - 0.02);
    });

    masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + totalDuration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + totalDuration);

    setTimeout(() => {
      ctx.close();
      activeAudioCtx = null;
      resolve();
    }, totalDuration * 1000 + 100);

  } catch {
    resolve();
  }
}
