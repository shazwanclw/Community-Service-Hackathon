import { analyzeHazardImage } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      imageBase64?: string;
      imageUrl?: string;
      mimeType?: string;
    };

    if (!body.imageBase64 && !body.imageUrl) {
      return Response.json(
        { error: "imageBase64 or imageUrl is required." },
        { status: 400 },
      );
    }

    const score = await analyzeHazardImage(body);
    return Response.json(score);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze hazard image.";

    return Response.json({ error: message }, { status: 500 });
  }
}
