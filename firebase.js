import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBlQ39cuXq3DOIB8exf_bqf6gJa4ddr19Q",
  authDomain: "the-recipe-box-e5d34.firebaseapp.com",
  projectId: "the-recipe-box-e5d34",
  storageBucket: "the-recipe-box-e5d34.firebasestorage.app",
  messagingSenderId: "5865702110",
  appId: "1:5865702110:web:fee11922236953591cf84f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
