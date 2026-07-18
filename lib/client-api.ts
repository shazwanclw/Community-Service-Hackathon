import { auth } from "@/lib/firebase";

type PostAuthedJsonOptions = {
  timeoutMs?: number;
};

export async function postAuthedJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
  options: PostAuthedJsonOptions = {},
) {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("You need to be signed in for this action.");
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;

  try {
    response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | TResponse
    | null;

  if (!response.ok) {
    throw new Error(
      payload && typeof payload === "object" && "error" in payload
        ? payload.error ?? "Request failed."
        : "Request failed.",
    );
  }

  return payload as TResponse;
}
