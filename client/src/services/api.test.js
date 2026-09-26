import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, normalizeAlertList, normalizeStatistics } from "./api";

describe("frontend API service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes list and statistics response shapes", () => {
    const alerts = [{ id: "ALR-001" }];

    expect(normalizeAlertList({ data: alerts })).toEqual(alerts);
    expect(normalizeAlertList(alerts)).toEqual(alerts);
    expect(
      normalizeStatistics({ totalRecipients: 10, acknowledged: 6 }),
    ).toEqual({
      totalRecipients: 10,
      acknowledged: 6,
      recipients: 10,
    });
  });

  it("uses the documented view and acknowledgement endpoints", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ status: "VIEWED" }), { status: 200 }),
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await api.viewAlert("ALR-001", "USR-001");
    await api.acknowledgeAlert("ALR-001", "USR-001");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:3000/api/alerts/ALR-001/view",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ userId: "USR-001" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/api/alerts/ALR-001/acknowledge",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ userId: "USR-001" }),
      }),
    );
  });

  it("adapts list and statistics responses returned by the backend", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ id: "ALR-001" }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ totalRecipients: 10, viewed: 8 }), {
          status: 200,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.listAlerts()).resolves.toEqual([{ id: "ALR-001" }]);
    await expect(api.getStatistics("ALR-001")).resolves.toEqual({
      totalRecipients: 10,
      viewed: 8,
      recipients: 10,
    });
  });

  it("supports filtering alerts by status", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ data: [] }), { status: 200 }),
        ),
    );

    await api.listAlerts("active");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/alerts?status=active",
      expect.any(Object),
    );
  });

  it("normalizes shared API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: "ALERT_NOT_FOUND", message: "Alert was not found" },
          }),
          { status: 404 },
        ),
      ),
    );

    await expect(api.getAlert("missing")).rejects.toMatchObject({
      code: "ALERT_NOT_FOUND",
      message: "Alert was not found",
    });
  });
});
