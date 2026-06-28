import { getAdminAuth } from "@/lib/firebase-admin";

function getBearerToken(authorization: string | null) {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

export async function requireUserToken(request: Request) {
  const token = getBearerToken(request.headers.get("authorization"));

  if (!token) {
    throw new Error("Missing bearer token.");
  }

  return getAdminAuth().verifyIdToken(token);
}
