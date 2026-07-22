type BuildHazardScoreRequestInput = {
  uploadedImageUrl?: string | null;
  imageBase64?: string;
  mimeType?: string;
};

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
