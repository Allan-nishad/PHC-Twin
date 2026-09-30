'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Globe, Sparkles } from 'lucide-react';

interface VoiceAlertBroadcasterProps {
  alertTextEnglish: string;
  facilityName: string;
  district: string;
}

export const VoiceAlertBroadcaster: React.FC<VoiceAlertBroadcasterProps> = ({
  alertTextEnglish,
  facilityName,
  district,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'hi-IN' | 'en-IN' | 'ta-IN' | 'mr-IN' | 'bn-IN'>('hi-IN');

  const languageTranslations: Record<string, { label: string; text: string }> = {
    'hi-IN': {
      label: 'हिंदी (Hindi)',
      text: `ध्यान दें! ${district} जिले के ${facilityName} में आपातकालीन अलर्ट। लैब तकनीशियन अनुपस्थित होने के कारण रक्त परीक्षण बाधित हैं। सीतापुर अर्बन से तकनीशियन को राष्ट्रीय राजमार्ग 30 के माध्यम से भेजा जा रहा है।`,
    },
    'en-IN': {
      label: 'English (India)',
      text: `Attention! Emergency capability alert at ${facilityName}, district ${district}. Diagnostic testing is offline due to technician absence. Rotational dispatch initiated from Sitapur Urban via National Highway 30.`,
    },
    'mr-IN': {
      label: 'मराठी (Marathi)',
      text: `लक्ष द्या! ${district} जिल्ह्यातील ${facilityName} येथे तातडीचा इशारा। लॅब तंत्रज्ञ गैरहजर असल्यामुळे चाचण्या थांबल्या आहेत। महामार्ग 30 द्वारे तातडीने मदत पाठवली जात आहे।`,
    },
    'ta-IN': {
      label: 'தமிழ் (Tamil)',
      text: `கவனம்! ${facilityName} சுகாதார மையத்தில் அவசர எச்சரிக்கை। ஆய்வக தொழில்நுட்ப வல்லுநர் இல்லாததால் ரத்த பரிசோதனைகள் நிறுத்தப்பட்டுள்ளன।`,
    },
    'bn-IN': {
      label: 'বাংলা (Bengali)',
      text: `মনোযোগ দিন! ${district} জেলার ${facilityName}-এ জরুরি স্বাস্থ্য সতর্কতা। ল্যাব টেকনিশিয়ান অনুপস্থিত থাকায় ডায়াগনস্টিক পরীক্ষা বন্ধ রয়েছে।`,
    },
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const currentTranslation = languageTranslations[selectedLanguage] || languageTranslations['hi-IN'];
    const utterance = new SpeechSynthesisUtterance(currentTranslation.text);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
          <Globe className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-bold text-slate-200 block text-[11px]">
            Multilingual Voice Dispatch (Google Cloud TTS Ready)
          </span>
          <span className="text-[10px] text-slate-400">
            Audio broadcast across India&apos;s regional languages
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value as any)}
          className="bg-slate-900 border border-slate-700 text-slate-200 py-1 px-2.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {Object.entries(languageTranslations).map(([code, item]) => (
            <option key={code} value={code}>
              {item.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleSpeak}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
            isPlaying
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Stop Broadcast</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>🔊 Listen Broadcast</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
