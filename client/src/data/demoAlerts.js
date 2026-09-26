export const demoAlert = {
  id: "ALR-001",
  type: "cyclone",
  severity: "critical",
  affectedArea: "Coastal Odisha",
  officialMessage:
    "Due to the severe cyclonic storm expected to make landfall, residents in low-lying coastal areas are advised to evacuate to designated shelters.",
  simplified: {
    title: "CYCLONE APPROACHING",
    summary: "Move to a safe location immediately.",
    actions: [
      "Leave low-lying areas",
      "Go to a safe shelter",
      "Stay away from the sea",
    ],
  },
  translations: {
    en: {
      title: "CYCLONE APPROACHING",
      summary: "Move to a safe location immediately.",
      actions: [
        "Leave low-lying areas",
        "Go to a safe shelter",
        "Stay away from the sea",
      ],
      officialLabel: "Official message",
      listenLabel: "Listen to alert",
    },
    hi: {
      title: "चक्रवात आ रहा है",
      summary: "तुरंत सुरक्षित स्थान पर जाएं।",
      actions: [
        "निचले इलाकों को छोड़ें",
        "सुरक्षित आश्रय में जाएं",
        "समुद्र से दूर रहें",
      ],
      officialLabel: "आधिकारिक संदेश",
      listenLabel: "अलर्ट सुनें",
    },
    or: {
      title: "ବାତ୍ୟା ଆସୁଛି",
      summary: "ତୁରନ୍ତ ଏକ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ।",
      actions: [
        "ନିମ୍ନ ଅଞ୍ଚଳ ଛାଡନ୍ତୁ",
        "ସୁରକ୍ଷିତ ଆଶ୍ରୟକୁ ଯାଆନ୍ତୁ",
        "ସମୁଦ୍ରଠାରୁ ଦୂରେ ରୁହନ୍ତୁ",
      ],
      officialLabel: "ସରକାରୀ ବାର୍ତ୍ତା",
      listenLabel: "ଆଲର୍ଟ ଶୁଣନ୍ତୁ",
      speechFallback:
        "Baatyaa aasuchhi. Turanta eka surakshita sthaanaku yaaantu. Nimna anchala chhadantu. Surakshita aashrayaku yaaantu. Samudra thaaru dure ruhantu.",
    },
  },
  visualInstructions: [
    { icon: "evacuate", text: "Leave low-lying areas" },
    { icon: "shelter", text: "Go to a safe shelter" },
  ],
  status: "active",
  createdAt: "2026-01-01T12:00:00.000Z",
  expiresAt: "2026-12-31T12:00:00.000Z",
};

export const demoAlerts = [demoAlert];
