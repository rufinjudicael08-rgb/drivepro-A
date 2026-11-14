import React, { useEffect, useState } from 'react';
import { Globe, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { getTranslations, WORLD_LANGUAGES } from '../data/i18n';

interface CourseAudioPlayerProps {
  lang: string;
  countryName?: string;
  speakerName: string;
  speakerRole: string;
  speakerAvatarUrl: string;
  title: string;
  script: string;
  customTriggerText?: string | null;
  customTriggerLabel?: string | null;
  onClearCustomTrigger?: () => void;
}

const BCP47_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ro: 'ro-RO',
  es: 'es-ES',
  de: 'de-DE',
  pt: 'pt-PT',
  it: 'it-IT',
  pl: 'pl-PL',
  bg: 'bg-BG',
  da: 'da-DK',
  nl: 'nl-NL',
  sv: 'sv-SE',
  nb: 'nb-NO',
  no: 'nb-NO',
  fi: 'fi-FI',
  el: 'el-GR',
  cs: 'cs-CZ',
  hu: 'hu-HU',
  sk: 'sk-SK',
  hr: 'hr-HR',
  sr: 'sr-RS',
  uk: 'uk-UA',
  tr: 'tr-TR',
  ru: 'ru-RU',
  ar: 'ar-SA',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  hi: 'hi-IN',
  vi: 'vi-VN',
  th: 'th-TH',
  id: 'id-ID',
  ms: 'ms-MY',
  he: 'he-IL',
  sw: 'sw-KE',
};

export function speakNarration(
  text: string,
  lang: string,
  rate = 1,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langTag = BCP47_MAP[lang.toLowerCase()] || lang;

  utterance.lang = langTag;
  utterance.rate = rate;
  utterance.pitch = 1.02;

  const voices = synth.getVoices();
  const matchedVoice =
    voices.find((v) => v.lang.toLowerCase() === langTag.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase())) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en'));

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  synth.speak(utterance);
  return true;
}

export const CourseAudioPlayer: React.FC<CourseAudioPlayerProps> = ({
  lang,
  countryName,
  speakerName,
  speakerRole,
  speakerAvatarUrl,
  title,
  script,
  customTriggerText,
  customTriggerLabel,
  onClearCustomTrigger,
}) => {
  const t = getTranslations(lang);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const langObj =
    WORLD_LANGUAGES.find((l) => l.code === lang) || WORLD_LANGUAGES[0];

  const localizedPrefix = countryName
    ? `${t.audioAdaptedPrefix} (${countryName} · ${langObj.nativeName}). `
    : '';

  const activeText = customTriggerText || `${localizedPrefix}${script}`;
  const activeLabel = customTriggerLabel || title;

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSupported(false);
      return;
    }
    return () => {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    };
  }, [script, lang, countryName]);

  useEffect(() => {
    if (!customTriggerText) return;
    const ok = speakNarration(
      customTriggerText,
      lang,
      rate,
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
    if (!ok) {
      setSpeechSupported(false);
    }
  }, [customTriggerText, lang, rate]);

  const handleTogglePlay = () => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      return;
    }
    const synth = window.speechSynthesis;
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    const ok = speakNarration(
      activeText,
      lang,
      rate,
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
    if (!ok) setSpeechSupported(false);
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    onClearCustomTrigger?.();
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            {!avatarFailed ? (
              <img
                src={speakerAvatarUrl}
                alt={speakerName}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className={`w-12 h-12 rounded-xl object-cover border transition-transform duration-300 ${
                  isPlaying ? 'border-blue-400 scale-105' : 'border-slate-700'
                }`}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="text-xs font-mono text-blue-300 flex items-center gap-1.5 flex-wrap">
              <span>
                {speakerName} · {speakerRole}
              </span>
              <span className="text-emerald-400 inline-flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                {langObj.nativeName}
                {countryName ? ` (${countryName})` : ''}
              </span>
            </div>
            <div className="text-base font-bold text-white truncate mt-0.5">
              {activeLabel}
            </div>
            <div className="flex items-end gap-1 h-4 mt-1.5" aria-hidden="true">
              {[0, 120, 240, 80, 200, 320, 140, 60].map((delay, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-sm bg-blue-400 transition-all ${
                    isPlaying ? 'animate-audio-bar h-3.5' : 'h-1 opacity-40'
                  }`}
                  style={isPlaying ? { animationDelay: `${delay}ms` } : undefined}
                />
              ))}
              <span className="ml-2 text-xs font-mono text-slate-300">
                {isPlaying
                  ? `${t.audioActiveIn} (${langObj.nativeName})…`
                  : `${t.audioReadyIn} ${langObj.nativeName}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{t.audioPause}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{t.audioPlay}</span>
              </>
            )}
          </button>

          {isPlaying && (
            <button
              type="button"
              onClick={handleStop}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
              title="Stop"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            {[0.9, 1, 1.15].map((speedOpt) => (
              <button
                key={speedOpt}
                type="button"
                onClick={() => setRate(speedOpt)}
                className={`px-2.5 py-1 text-xs font-mono rounded cursor-pointer ${
                  rate === speedOpt
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {speedOpt}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {!speechSupported && (
        <div className="flex items-center gap-2 text-sm text-amber-300 bg-slate-800/80 px-3.5 py-2.5 rounded-lg">
          <VolumeX className="w-4 h-4 shrink-0" />
          <span>{t.audioUnsupported}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={() => setShowTranscript((v) => !v)}
          className="text-sm font-semibold text-blue-300 hover:text-blue-200 cursor-pointer"
        >
          {showTranscript ? t.audioHideScript : t.audioShowScript}
        </button>
        {customTriggerText && (
          <button
            type="button"
            onClick={handleStop}
            className="text-xs text-slate-300 hover:text-white cursor-pointer"
          >
            {t.audioBackToModule}
          </button>
        )}
      </div>

      {showTranscript && (
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/70 border border-slate-800 rounded-lg p-4">
          {activeText}
        </p>
      )}
    </div>
  );
};
