import { auth } from "@/lib/firebase";

export async function postAuthedJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
) {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("You need to be signed in for this action.");
  }

  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

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
