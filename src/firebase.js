import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQpcyTT5zHOPTgAww0MwchNbVyZU19SEI",
  authDomain: "exepensetracker-f2a98.firebaseapp.com",
  projectId: "exepensetracker-f2a98",
  storageBucket: "exepensetracker-f2a98.appspot.com",
  messagingSenderId: "849633968905",
  appId: "1:849633968905:web:082ef882b2a26890e309d8",
  measurementId: "G-64WZBXXM5F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider, doc, setDoc };
