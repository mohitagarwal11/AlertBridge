import "@testing-library/jest-dom/vitest";

class TestSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.lang = "";
    this.onend = null;
    this.onerror = null;
  }
}

globalThis.SpeechSynthesisUtterance = TestSpeechSynthesisUtterance;
