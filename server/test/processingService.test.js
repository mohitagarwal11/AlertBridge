import test from "node:test";
import assert from "node:assert/strict";
import {
  ProcessingService,
  DemoAlertProcessor,
  AlertProcessor,
  processingService,
} from "../src/services/processingService.js";
import { AlertModel } from "../src/models/alertModel.js";

test("ProcessingService preserves officialMessage byte-for-byte", async () => {
  const rawOfficialMessage =
    "UNAUTHORISED ENTRY PROHIBITED. Severe storm approaching sector 4. Evacuate immediately!";

  const result = await processingService.processAlert(
    rawOfficialMessage,
    "cyclone",
    "critical",
    "Sector 4"
  );

  // Assert byte-for-byte exact equality
  assert.equal(result.preservedOfficialMessage, rawOfficialMessage);
  assert.equal(
    Buffer.from(result.preservedOfficialMessage).equals(Buffer.from(rawOfficialMessage)),
    true
  );
});

test("ProcessingService stores generated representations separately from official message", async () => {
  const model = new AlertModel();
  const rawOfficialMessage = "Official government warning text.";

  const alert = model.create({
    type: "tsunami",
    severity: "critical",
    affectedArea: "Coastal Bay",
    officialMessage: rawOfficialMessage,
  });

  const processed = await processingService.processAlert(
    alert.officialMessage,
    alert.type,
    alert.severity,
    alert.affectedArea
  );

  const updated = model.updateGeneratedContent(alert.id, {
    simplified: processed.simplified,
    translations: processed.translations,
    visualInstructions: processed.visualInstructions,
  });

  // Verify generated content exists separately
  assert.ok(updated.simplified.title);
  assert.ok(updated.translations.en);
  assert.ok(updated.translations.hi);
  assert.ok(updated.translations.or);
  assert.ok(updated.visualInstructions.length > 0);

  // Verify officialMessage remains byte-for-byte identical to the original raw official message
  assert.equal(updated.officialMessage, rawOfficialMessage);
});

test("ProcessingService supports pluggable AlertProcessor implementations", async () => {
  class CustomAIProcessor extends AlertProcessor {
    async process(officialMessage) {
      return {
        simplified: {
          title: "CUSTOM AI TITLE",
          summary: `AI Summary of: ${officialMessage}`,
          actions: ["Custom Action"],
        },
        translations: { en: { title: "CUSTOM AI TITLE" } },
        visualInstructions: [{ icon: "custom", text: "Custom instruction" }],
      };
    }
  }

  const customService = new ProcessingService(new CustomAIProcessor());
  const officialMessage = "Emergency alert payload";

  const result = await customService.processAlert(
    officialMessage,
    "hazard",
    "high",
    "Zone A"
  );

  assert.equal(result.simplified.title, "CUSTOM AI TITLE");
  assert.equal(result.preservedOfficialMessage, officialMessage);
});
