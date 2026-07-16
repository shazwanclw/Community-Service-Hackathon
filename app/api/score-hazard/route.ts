import { analyzeHazardImage } from "@/lib/gemini";
import { getFallbackHazardScore } from "@/lib/hazard-score";

export async function POST(request: Request) {
  let body:
    | {
        imageBase64?: string;
        imageUrl?: string;
        mimeType?: string;
      }
    | undefined;

  try {
    body = (await request.json()) as {
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
    if (body?.imageBase64 || body?.imageUrl) {
      return Response.json(getFallbackHazardScore());
    }

    const message =
      error instanceof Error ? error.message : "Failed to analyze hazard image.";

    return Response.json({ error: message }, { status: 500 });
  }
}
