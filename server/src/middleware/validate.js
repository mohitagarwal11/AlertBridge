import { ApiError } from "./errorHandler.js";

export function validateAlertCreation(req, _res, next) {
  const {
    type,
    severity,
    affectedArea,
    officialMessage,
    languages,
    expiresAt,
  } = req.body || {};

  if (!type || typeof type !== "string" || !type.trim()) {
    return next(
      new ApiError(
        "INVALID_ALERT_DATA",
        "Alert 'type' is required and must be a string",
        400,
      ),
    );
  }

  if (!severity || typeof severity !== "string" || !severity.trim()) {
    return next(
      new ApiError(
        "INVALID_ALERT_DATA",
        "Alert 'severity' is required and must be a string",
        400,
      ),
    );
  }

  if (
    !affectedArea ||
    typeof affectedArea !== "string" ||
    !affectedArea.trim()
  ) {
    return next(
      new ApiError(
        "INVALID_ALERT_DATA",
        "Alert 'affectedArea' is required and must be a string",
        400,
      ),
    );
  }

  if (
    !officialMessage ||
    typeof officialMessage !== "string" ||
    !officialMessage.trim()
  ) {
    return next(
      new ApiError(
        "INVALID_ALERT_DATA",
        "Alert 'officialMessage' is required and must be a non-empty string",
        400,
      ),
    );
  }

  if (
    languages !== undefined &&
    (!Array.isArray(languages) ||
      languages.some(
        (language) => typeof language !== "string" || !language.trim(),
      ))
  ) {
    return next(
      new ApiError(
        "INVALID_ALERT_DATA",
        "Alert 'languages' must be an array of non-empty strings",
        400,
      ),
    );
  }

  if (
    expiresAt !== undefined &&
    (typeof expiresAt !== "string" || Number.isNaN(Date.parse(expiresAt)))
  ) {
    return next(
      new ApiError(
        "INVALID_ALERT_DATA",
        "Alert 'expiresAt' must be a valid date string",
        400,
      ),
    );
  }

  next();
}
