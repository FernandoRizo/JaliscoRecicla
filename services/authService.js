// ============================================================
//  authService.js
//  JaliscoRecicla – Firebase Authentication service
//  Handles: register, login, Google OAuth, logout, session
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { createUser, getUser } from "./firestoreService";

// ─────────────────────────────────────────────────────────────
// REGISTER with email & password
// ─────────────────────────────────────────────────────────────
/**
 * Creates a Firebase Auth account and a Firestore user document.
 * @param {string} email
 * @param {string} password
 * @param {string} fullName
 * @returns {object} Firebase User
 */
export const registerWithEmail = async (email, password, fullName) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Update display name in Auth
  await updateProfile(user, { displayName: fullName });

  // Create Firestore document
  await createUser(user.uid, {
    email,
    fullName,
    role: "citizen",  // all new registrations are citizens
  });

  return user;
};

// ─────────────────────────────────────────────────────────────
// LOGIN with email & password
// ─────────────────────────────────────────────────────────────
/**
 * @returns {object} Firebase User
 */
export const loginWithEmail = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

// ─────────────────────────────────────────────────────────────
// GOOGLE SIGN-IN (Expo)
// ─────────────────────────────────────────────────────────────
/**
 * Call this after getting an idToken from expo-auth-session.
 * Example usage with expo-auth-session/providers/google:
 *
 *   const [request, response, promptAsync] = Google.useAuthRequest({...});
 *   if (response?.type === "success") {
 *     await loginWithGoogle(response.params.id_token);
 *   }
 *
 * @param {string} idToken - from Google OAuth response
 * @returns {object} Firebase User
 */
export const loginWithGoogle = async (idToken) => {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, googleCredential);
  const user = result.user;

  // Create Firestore document if first-time login
  const existingUser = await getUser(user.uid);
  if (!existingUser) {
    await createUser(user.uid, {
      email:    user.email,
      fullName: user.displayName ?? "Usuario",
      role:     "citizen",
      photoURL: user.photoURL,
    });
  }

  return user;
};

// ─────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────
export const logout = async () => {
  await signOut(auth);
};

// ─────────────────────────────────────────────────────────────
// PASSWORD RESET
// ─────────────────────────────────────────────────────────────
/**
 * Sends a password reset email to the given address.
 */
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

// ─────────────────────────────────────────────────────────────
// AUTH STATE LISTENER
// ─────────────────────────────────────────────────────────────
/**
 * Subscribe to Firebase Auth state changes.
 * Use this in your root App component or AuthContext.
 *
 * Example:
 *   useEffect(() => {
 *     const unsub = onAuthChange((user) => setCurrentUser(user));
 *     return unsub;
 *   }, []);
 *
 * @param {function} callback - called with (user | null)
 * @returns unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ─────────────────────────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────────────────────────
export const getCurrentUser = () => auth.currentUser;
