// config/firebaseConfig.web.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "jaliscorecicla.firebaseapp.com",
  projectId: "jaliscorecicla",
  storageBucket: "jaliscorecicla.firebasestorage.app",
  messagingSenderId: "284889588440",
  appId: "1:284889588440:web:395f16b97eada09a8bedad",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };