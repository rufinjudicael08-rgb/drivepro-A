import React, { useEffect, useState } from 'react';
import { Globe, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { WORLD_LANGUAGES } from '../data/i18n';

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
  es: 'es-ES',
  de: 'de-DE',
  pt: 'pt-PT',
  it: 'it-IT',
  pl: 'pl-PL',
  bg: 'bg-BG',
  da: 'da-DK',
  nl: 'nl-NL',
  tr: 'tr-TR',
  ru: 'ru-RU',
  ar: 'ar-SA',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  hi: 'hi-IN',
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
  const isFr = lang === 'fr';
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const langObj =
    WORLD_LANGUAGES.find((l) => l.code === lang) || WORLD_LANGUAGES[0];

  const localizedPrefix = countryName
    ? isFr
      ? `Formation adaptée (${countryName} · ${langObj.nativeName}). `
      : `Adapted training (${countryName} · ${langObj.nativeName}). `
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
                <Globe className="w-3 h-3" />
                {langObj.nativeName}
                {countryName ? ` (${countryName})` : ''}
              </span>
            </div>
            <div className="text-sm font-semibold text-white truncate mt-0.5">
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
              <span className="ml-2 text-[11px] font-mono text-slate-300">
                {isPlaying
                  ? isFr
                    ? `Audio actif (${langObj.nativeName})…`
                    : `Audio active (${langObj.nativeName})…`
                  : isFr
                  ? `Prêt en ${langObj.nativeName}`
                  : `Ready in ${langObj.nativeName}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{isFr ? 'Mettre en pause' : 'Pause Audio'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{isFr ? 'Écouter l’audio' : 'Play Audio'}</span>
              </>
            )}
          </button>

          {isPlaying && (
            <button
              type="button"
              onClick={handleStop}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
              title={isFr ? 'Arrêter' : 'Stop'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            {[0.9, 1, 1.15].map((speedOpt) => (
              <button
                key={speedOpt}
                type="button"
                onClick={() => setRate(speedOpt)}
                className={`px-2 py-1 text-[11px] font-mono rounded cursor-pointer ${
                  rate === speedOpt
                    ? 'bg-blue-600 text-white'
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
        <div className="flex items-center gap-2 text-xs text-amber-300 bg-slate-800/80 px-3 py-2 rounded-lg">
          <VolumeX className="w-4 h-4 shrink-0" />
          <span>
            {isFr
              ? 'La synthèse vocale n’est pas activée sur ce navigateur. Lisez la transcription complète ci-dessous.'
              : 'Speech synthesis is unavailable in this browser. Read the full transcript below.'}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={() => setShowTranscript((v) => !v)}
          className="text-xs font-medium text-blue-300 hover:text-blue-200 cursor-pointer"
        >
          {showTranscript
            ? isFr
              ? 'Masquer le texte parlé'
              : 'Hide Spoken Transcript'
            : isFr
            ? 'Lire le texte parlé par le moniteur'
            : 'Read Instructor Spoken Script'}
        </button>
        {customTriggerText && (
          <button
            type="button"
            onClick={handleStop}
            className="text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            {isFr ? 'Revenir au cours complet' : 'Return to Full Module Audio'}
          </button>
        )}
      </div>

      {showTranscript && (
        <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 border border-slate-800 rounded-lg p-3.5">
          {activeText}
        </p>
      )}
    </div>
  );
};
