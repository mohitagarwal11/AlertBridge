import { ApiError } from "./errorHandler.js";

export function validateAlertCreation(req, _res, next) {
  const { type, severity, affectedArea, officialMessage } = req.body || {};

  if (!type || typeof type !== "string" || !type.trim()) {
    return next(new ApiError("INVALID_ALERT_DATA", "Alert 'type' is required and must be a string", 400));
  }

  if (!severity || typeof severity !== "string" || !severity.trim()) {
    return next(new ApiError("INVALID_ALERT_DATA", "Alert 'severity' is required and must be a string", 400));
  }

  if (!affectedArea || typeof affectedArea !== "string" || !affectedArea.trim()) {
    return next(new ApiError("INVALID_ALERT_DATA", "Alert 'affectedArea' is required and must be a string", 400));
  }

  if (!officialMessage || typeof officialMessage !== "string" || !officialMessage.trim()) {
    return next(new ApiError("INVALID_ALERT_DATA", "Alert 'officialMessage' is required and must be a non-empty string", 400));
  }

  next();
}
