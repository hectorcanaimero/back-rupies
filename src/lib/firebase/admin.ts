// src/lib/firebase/admin.ts
import * as admin from "firebase-admin";

// Singleton — safe to call from multiple Route Handlers (module is cached)
function getFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel stores private keys with literal \n — replace with actual newlines
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    // Return a stub — routes will use mock data fallback
    return admin.initializeApp({ projectId: "rupies-brasil-mock" });
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

export const firebaseAdmin = getFirebaseAdmin();
export const messaging = firebaseAdmin.messaging();
