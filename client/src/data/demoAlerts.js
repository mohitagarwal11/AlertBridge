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
  translations: { en: {}, hi: {}, or: {} },
  visualInstructions: [
    { icon: "evacuate", text: "Leave low-lying areas" },
    { icon: "shelter", text: "Go to a safe shelter" },
  ],
  status: "active",
  createdAt: "2026-01-01T12:00:00.000Z",
  expiresAt: "2026-01-02T12:00:00.000Z",
};

export const demoAlerts = [demoAlert];
