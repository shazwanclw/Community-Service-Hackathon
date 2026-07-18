import { generateHazardCaption } from "@/lib/gemini";

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
    return Response.json({ caption });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate the report caption.";

    return Response.json({ error: message }, { status: 500 });
  }
}
