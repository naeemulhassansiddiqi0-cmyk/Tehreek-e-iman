// Speech Synthesis & Voice Recognition Helper Service for Islamic AI Assistant

export function sanitizeTextForSpeech(rawText: string): string {
  return rawText
    // Remove markdown horizontal rules (---, ***, ___)
    .replace(/^[-*_]{3,}\s*$/gm, ' ')
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')
    // Remove bold, italics and underlines
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove markdown links [text](url) -> text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquote markers
    .replace(/^>\s*/gm, '')
    // Remove list markers and numbered prefixes at start of line (*, -, +, 1., ۱.)
    .replace(/^[\s*•\-–—]+\s+/gm, '')
    .replace(/^\s*[\d٠-٩]+[.)\-:]\s*/gm, '')
    .replace(/\(\s*[\d٠-٩]+\s*\)/g, '')
    // Strip all remaining hyphens, dashes, and underlines
    .replace(/[-–—_~^]/g, ' ')
    // Remove markdown table pipes
    .replace(/\|/g, ' ')
    // Remove all brackets, quotes, slashes, hash
    .replace(/[\[\](){}<>«»""''‘’“”/\\#]/g, ' ')
    // Remove all emojis and decorative symbols
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}📌📖📜⚖️💡🏛️⚡💬🎙️🔊🌹🤲🛡️🎓]/gu, ' ')
    .replace(/[❖✦۝۞✓✗★☆]/g, ' ')
    // Replace colons with natural pauses (Urdu comma)
    .replace(/[:]/g, '، ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Split text into natural chunks for smooth, timeout-free audio playback
export function splitIntoTTSChunks(text: string, maxLen: number = 130): string[] {
  const rawSegments = text.split(/([۔!؟\n.]+)/).filter(Boolean);
  const sentences: string[] = [];

  for (let i = 0; i < rawSegments.length; i += 2) {
    const sent = (rawSegments[i] || '') + (rawSegments[i + 1] || '');
    if (sent.trim()) sentences.push(sent.trim());
  }

  const chunks: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length <= maxLen) {
      chunks.push(sentence);
    } else {
      const words = sentence.split(' ');
      let current = '';
      for (const w of words) {
        if ((current + ' ' + w).length <= maxLen) {
          current = current ? current + ' ' + w : w;
        } else {
          if (current) chunks.push(current);
          current = w;
        }
      }
      if (current) chunks.push(current);
    }
  }
  return chunks;
}

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  _onError?: (err: unknown) => void
): () => void {
  const clean = sanitizeTextForSpeech(text);
  if (!clean) {
    if (onEnd) onEnd();
    return () => {};
  }

  let isCancelled = false;
  let currentAudio: HTMLAudioElement | null = null;

  // Stop any previous speech synthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  const chunks = splitIntoTTSChunks(clean, 130);
  let chunkIndex = 0;

  // Fallback to Web Speech Synthesis if audio stream fails or offline
  const fallbackToSpeechSynthesis = () => {
    if (isCancelled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    const urduVoice = voices.find(v => v.lang.toLowerCase().startsWith('ur'));
    const hindiVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
    const arabicVoice = voices.find(v => v.lang.toLowerCase().startsWith('ar'));
    const selectedVoice = urduVoice || hindiVoice || arabicVoice;

    let synthIndex = chunkIndex;

    const speakNextSynth = () => {
      if (isCancelled || synthIndex >= chunks.length) {
        if (onEnd) onEnd();
        return;
      }

      const chunk = chunks[synthIndex].trim();
      if (!chunk) {
        synthIndex++;
        speakNextSynth();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'ur-PK';
      }
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        synthIndex++;
        speakNextSynth();
      };

      utterance.onerror = () => {
        synthIndex++;
        speakNextSynth();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSynth();
  };

  // Primary: Google Urdu TTS Stream (Flawless native Urdu voice without Windows voice pack requirement)
  const playNextAudioChunk = () => {
    if (isCancelled || chunkIndex >= chunks.length) {
      if (onEnd) onEnd();
      return;
    }

    const chunk = chunks[chunkIndex].trim();
    if (!chunk) {
      chunkIndex++;
      playNextAudioChunk();
      return;
    }

    const encoded = encodeURIComponent(chunk);
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const audioUrl = isLocal
      ? `/api/tts?ie=UTF-8&q=${encoded}&tl=ur&client=tw-ob`
      : `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ur&client=tw-ob`;

    try {
      const audio = new Audio();
      try {
        (audio as any).referrerPolicy = 'no-referrer';
      } catch {}
      audio.src = audioUrl;
      currentAudio = audio;

      audio.onended = () => {
        if (!isCancelled) {
          chunkIndex++;
          playNextAudioChunk();
        }
      };

      audio.onerror = (e) => {
        console.warn('Audio stream fallback to speechSynthesis:', e);
        fallbackToSpeechSynthesis();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play catch, switching to speechSynthesis:', err);
          fallbackToSpeechSynthesis();
        });
      }
    } catch (err) {
      console.warn('Audio construction error:', err);
      fallbackToSpeechSynthesis();
    }
  };

  if (onStart) onStart();
  playNextAudioChunk();

  return () => {
    isCancelled = true;
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.src = '';
      } catch (e) {
        // ignore
      }
      currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (onEnd) onEnd();
  };
}
