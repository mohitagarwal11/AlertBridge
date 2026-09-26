export const seedAlerts = [
  {
    id: "ALR-001",
    type: "cyclone",
    severity: "critical",
    affectedArea: "Coastal Odisha",
    officialMessage:
      "Due to the severe cyclonic storm expected to make landfall, residents in low-lying coastal areas are advised to evacuate to designated shelters.",
    simplified: {
      title: "CYCLONE APPROACHING",
      summary:
        "If you live in a low-lying coastal area, evacuate now and move to a safe shelter.",
      actions: [
        "Evacuate low-lying areas",
        "Go to a safe shelter",
        "Stay away from the sea",
        "Keep your phone charged",
      ],
    },
    translations: {
      en: {
        title: "CYCLONE APPROACHING",
        summary:
          "If you live in a low-lying coastal area, evacuate now and move to a safe shelter.",
        actions: [
          "Evacuate low-lying areas",
          "Go to a safe shelter",
          "Stay away from the sea",
          "Keep your phone charged",
        ],
      },
      hi: {
        title: "चक्रवात आ रहा है",
        summary:
          "यदि आप निचले तटीय क्षेत्रों में रहते हैं, तो तुरंत सुरक्षित आश्रय में जाएं।",
        actions: [
          "निचले क्षेत्रों को खाली करें",
          "सुरक्षित आश्रय स्थल पर जाएं",
          "समुद्र से दूर रहें",
          "अपना फोन चार्ज रखें",
        ],
      },
      or: {
        title: "ବାତ୍ୟା ଆସୁଛି",
        summary:
          "ଯଦି ଆପଣ ଉପକୂଳବର୍ତ୍ତୀ ତଳି ଅଞ୍ଚଳରେ ରହୁଛନ୍ତି, ତୁରନ୍ତ ନିରାପଦ ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ।",
        actions: [
          "ତଳି ଅଞ୍ଚଳ ଖାଲି କରନ୍ତୁ",
          "ନିରାପଦ ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ",
          "ସମୁଦ୍ରଠାରୁ ଦୂରେଇ ରୁହନ୍ତୁ",
          "ଫୋନ୍ ଚାର୍ଜ ରଖନ୍ତୁ",
        ],
      },
    },
    visualInstructions: [
      { icon: "evacuate", text: "Move to a safe location" },
      { icon: "shelter", text: "Go to a designated shelter" },
      { icon: "tsunami", text: "Stay away from the sea" },
      { icon: "phone", text: "Keep phone charged" },
    ],
    status: "active",
    createdAt: "2026-01-01T12:00:00.000Z",
    expiresAt: "2026-12-31T12:00:00.000Z",
  },
];
