/**
 * Base Alert Processor Interface
 */
export class AlertProcessor {
  async process(_officialMessage, _type, _severity, _affectedArea) {
    throw new Error("process() must be implemented by concrete subclass");
  }
}

/**
 * Deterministic Demo Alert Processor Implementation
 */
export class DemoAlertProcessor extends AlertProcessor {
  async process(officialMessage, type, severity, affectedArea) {
    const upperType = (type || "EMERGENCY").toUpperCase();
    const area = affectedArea || "affected region";

    return {
      simplified: {
        title: `${upperType} WARNING`,
        summary: `If you are in ${area}, move to a safe location immediately.`,
        actions: [
          `Evacuate low-lying areas in ${area}`,
          "Go to a designated safe shelter",
          "Stay away from hazard zones",
          "Keep mobile phones and emergency devices charged",
        ],
      },
      translations: {
        en: {
          title: `${upperType} WARNING`,
          summary: `If you are in ${area}, move to a safe location immediately.`,
          actions: [
            `Evacuate low-lying areas in ${area}`,
            "Go to a designated safe shelter",
            "Stay away from hazard zones",
            "Keep mobile phones and emergency devices charged",
          ],
        },
        hi: {
          title: `${upperType} चेतावनी`,
          summary: `यदि आप ${area} में हैं, तो तुरंत सुरक्षित स्थान पर जाएं।`,
          actions: [
            "निचले क्षेत्रों को खाली करें",
            "सुरक्षित आश्रय स्थल पर जाएं",
            "खतरे वाले क्षेत्रों से दूर रहें",
            "अपने फोन को चार्ज रखें",
          ],
        },
        or: {
          title: `${upperType} ସତର୍କତା`,
          summary: `ଯଦି ଆପଣ ${area} ରେ ଅଛନ୍ତି, ତୁରନ୍ତ ନିରାପଦ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ।`,
          actions: [
            "ତଳି ଅଞ୍ଚଳ ଖାଲି କରନ୍ତୁ",
            "ନିରାପଦ ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ",
            "ବିପଦପୂର୍ଣ୍ଣ ସ୍ଥାନରୁ ଦୂରେଇ ରୁହନ୍ତୁ",
            "ଫୋନ୍ ଚାର୍ଜ ରଖନ୍ତୁ",
          ],
        },
      },
      visualInstructions: [
        { icon: "evacuate", text: "Move to a safe location" },
        { icon: "shelter", text: "Go to a designated shelter" },
        { icon: "warning", text: "Stay away from hazard zone" },
        { icon: "phone", text: "Keep phone charged" },
      ],
    };
  }
}

/**
 * Processing Service wrapping processor behind a pluggable service interface
 */
export class ProcessingService {
  constructor(processor = new DemoAlertProcessor()) {
    this.processor = processor;
  }

  setProcessor(processor) {
    if (!(processor instanceof AlertProcessor)) {
      throw new Error("Invalid processor: must extend AlertProcessor");
    }
    this.processor = processor;
  }

  async processAlert(officialMessage, type, severity, affectedArea) {
    const originalOfficialMessage = String(officialMessage);
    const result = await this.processor.process(originalOfficialMessage, type, severity, affectedArea);

    return {
      simplified: result.simplified,
      translations: result.translations,
      visualInstructions: result.visualInstructions,
      preservedOfficialMessage: originalOfficialMessage,
    };
  }
}

export const processingService = new ProcessingService();
