import { generateHazardCaption } from "@/lib/gemini";

function isImageNotClear(caption: string) {
  const normalized = caption.trim().toLowerCase();
  return (
    normalized === "image not clear." ||
    normalized === "image not clear" ||
    normalized.includes("too unclear") ||
    normalized.includes("image is unclear") ||
    normalized.includes("cannot describe") ||
    normalized.includes("can't describe")
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        imageBase64?: string;
        imageUrl?: string;
        location?: string;
        mimeType?: string;
      }
    | null;

  if (!body || (!body.imageBase64 && !body.imageUrl)) {
    return Response.json(
      { error: "imageBase64 or imageUrl is required." },
      { status: 400 },
    );
  }

  try {
    const caption = await generateHazardCaption(body);
    if (!caption || isImageNotClear(caption)) {
      return Response.json({ error: "Image not clear." }, { status: 422 });
    }

    return Response.json({ caption });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message || isImageNotClear(message)) {
      return Response.json({ error: "Image not clear." }, { status: 422 });
    }

    return Response.json({ error: "Image not clear." }, { status: 422 });
  }
}
