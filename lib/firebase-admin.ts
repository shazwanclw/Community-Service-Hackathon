type FirebaseAdminAppModule = typeof import("firebase-admin/app");
type FirebaseAdminAuthModule = typeof import("firebase-admin/auth");
type FirebaseAdminFirestoreModule = typeof import("firebase-admin/firestore");

function requireModule<TModule>(moduleId: string) {
  return eval("require")(moduleId) as TModule;
}

function getFirebaseAdminAppModule() {
  return requireModule<FirebaseAdminAppModule>("firebase-admin/app");
}

function getFirebaseAdminAuthModule() {
  return requireModule<FirebaseAdminAuthModule>("firebase-admin/auth");
}

function getFirebaseAdminFirestoreModule() {
  return requireModule<FirebaseAdminFirestoreModule>("firebase-admin/firestore");
}

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function getFirebaseAdminApp() {
  const { cert, getApp, getApps, initializeApp } = getFirebaseAdminAppModule();

  if (getApps().length) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not fully configured.");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getAdminAuth() {
  return getFirebaseAdminAuthModule().getAuth(getFirebaseAdminApp());
}

export function getAdminDb() {
  return getFirebaseAdminFirestoreModule().getFirestore(getFirebaseAdminApp());
}
