
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA26vnJYE5MAiN1M37cSIlRw0s3F1rvUGs",
  authDomain: "campuscue-809d7.firebaseapp.com",
  projectId: "campuscue-809d7",
  storageBucket: "campuscue-809d7.firebasestorage.app",
  messagingSenderId: "412784635964",
  appId: "1:412784635964:web:a580ecc0b2c890c5781339",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
