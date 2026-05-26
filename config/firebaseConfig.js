// config/firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "jaliscorecicla.firebaseapp.com",
  projectId: "jaliscorecicla",
  storageBucket: "jaliscorecicla.firebasestorage.app",
  messagingSenderId: "284889588440",
  appId: "1:284889588440:web:395f16b97eada09a8bedad",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  if (error?.code === "auth/already-initialized") {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };