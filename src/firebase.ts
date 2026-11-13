import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const ADMIN_EMAIL = 'lokossoujudicael00@gmail.com';
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIREBASE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;
export const FIRESTORE_CONSOLE_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`;
export const FIREBASE_AUTH_PROVIDERS_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;

export function translateAuthErrorFr(error: unknown): string {
  const errObj = error as { code?: string; message?: string } | null;
  const code = errObj?.code || '';
  const msg = errObj?.message || String(error);

  if (code === 'auth/email-already-in-use') {
    return 'Un compte existe déjà avec cette adresse e-mail. Cliquez sur « Se connecter » pour accéder à votre espace.';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'Adresse e-mail ou mot de passe incorrect. Vérifiez vos identifiants ou cliquez sur « Mot de passe oublié ? ».';
  }
  if (code === 'auth/weak-password') {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }
  if (code === 'auth/invalid-email') {
    return 'Adresse e-mail invalide. Veuillez vérifier le format (ex: nom@domaine.com).';
  }
  if (code === 'auth/too-many-requests') {
    return 'Trop de tentatives consécutives. Patientez quelques instants avant de réessayer.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'L’authentification E-mail / Mot de passe doit être activée une fois dans Firebase Console → Authentication → Sign-in method → Email/Password.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Erreur réseau lors de la connexion. Vérifiez votre Wi-Fi ou connexion Internet et réessayer.';
  }
  return msg;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
