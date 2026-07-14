import "server-only";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";

import { parseGeminiHazardScore } from "@/lib/score-parser";

const HAZARD_PROMPT =
  "Analyze this image of a community hazard. Evaluate it on a scale of 1 to 10 for three criteria: 1) Size of the area. 2) Hazard level. 3) Physical effort needed. Return ONLY a raw JSON object with these three scores and a 'total_points' integer (which is the sum of the three). Do not return markdown.";

const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest";

const HAZARD_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    size_score: { type: SchemaType.INTEGER },
    hazard_score: { type: SchemaType.INTEGER },
    effort_score: { type: SchemaType.INTEGER },
    total_points: { type: SchemaType.INTEGER },
  },
  required: ["size_score", "hazard_score", "effort_score", "total_points"],
};

type HazardImageInput = {
  imageBase64?: string;
  imageUrl?: string;
  mimeType?: string;
};

async function toInlineData(input: HazardImageInput) {
  if (input.imageBase64) {
    return {
      inlineData: {
        data: input.imageBase64,
        mimeType: input.mimeType ?? "image/jpeg",
      },
    };
  }

  if (!input.imageUrl) {
    throw new Error("No image content was provided to Gemini.");
  }

  const response = await fetch(input.imageUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch hazard image for Gemini analysis.");
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType: response.headers.get("content-type") ?? "image/jpeg",
    },
  };
}

export async function analyzeHazardImage(input: HazardImageInput) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: HAZARD_RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  });

  const result = await model.generateContent([
    HAZARD_PROMPT,
    await toInlineData(input),
  ]);

  return parseGeminiHazardScore(result.response.text());
}
