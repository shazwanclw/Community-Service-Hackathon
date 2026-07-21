import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuthResult = { kind: "auth" };
const mockDbResult = { kind: "db" };
const mockApp = { name: "snapfix-app" };

const getApps = vi.fn(() => []);
const getApp = vi.fn(() => mockApp);
const initializeApp = vi.fn(() => {
  getApps.mockReturnValue([mockApp]);
  return mockApp;
});
const cert = vi.fn((value) => value);
const getAuth = vi.fn(() => mockAuthResult);
const getFirestore = vi.fn(() => mockDbResult);

vi.mock("firebase-admin/app", () => ({
  cert,
  getApp,
  getApps,
  initializeApp,
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth,
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore,
}));

describe("firebase-admin helper", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.FIREBASE_PROJECT_ID = "snapfix-dev";
    process.env.FIREBASE_CLIENT_EMAIL = "firebase-adminsdk@test.iam.gserviceaccount.com";
    process.env.FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----";
    getApps.mockReturnValue([]);
  });

  it("uses the imported auth and firestore modules without runtime requires", async () => {
    const firebaseAdmin = await import("@/lib/firebase-admin");

    expect(firebaseAdmin.getAdminAuth()).toBe(mockAuthResult);
    expect(firebaseAdmin.getAdminDb()).toBe(mockDbResult);
    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(getAuth).toHaveBeenCalledWith(mockApp);
    expect(getFirestore).toHaveBeenCalledWith(mockApp);
  });
});
