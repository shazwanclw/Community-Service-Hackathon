type BuildHazardScoreRequestInput = {
  uploadedImageUrl?: string | null;
  imageBase64?: string;
  mimeType?: string;
};

const GENERIC_CAPTION_FALLBACK =
  "There is an issue visible in this area. Please check and fix it.";

export function buildHazardScoreRequest({
  uploadedImageUrl,
  imageBase64,
  mimeType,
}: BuildHazardScoreRequestInput) {
  const normalizedUrl = uploadedImageUrl?.trim();
  if (normalizedUrl) {
    return {
      imageUrl: normalizedUrl,
    };
  }

  return {
    imageBase64: imageBase64 ?? "",
    mimeType,
  };
}

export function normalizeCaptionErrorMessage(message?: string | null) {
  const normalized = message?.trim().toLowerCase();

  if (
    !normalized ||
    normalized === "image not clear." ||
    normalized === "image not clear" ||
    normalized === "ai caption generation failed." ||
    normalized === "failed to generate the report caption."
  ) {
    return "Image is not clear for AI to give caption.";
  }

  return message ?? "Image is not clear for AI to give caption.";
}

export function getCaptionFallbackText(caption?: string | null) {
  const normalized = caption?.trim();

  if (normalized && normalized.length > 0) {
    return normalized;
  }

  return GENERIC_CAPTION_FALLBACK;
}
