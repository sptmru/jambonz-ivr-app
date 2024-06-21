export type SpeechData = {
  synthesizer: {
    vendor: string;
    language: string;
    voice: string;
  };
  recognizer: {
    vendor: string;
    language: string;
  };
};
