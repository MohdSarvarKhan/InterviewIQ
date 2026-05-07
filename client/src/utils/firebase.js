
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interview-ff293.firebaseapp.com",
  projectId: "interview-ff293",
  storageBucket: "interview-ff293.firebasestorage.app",
  messagingSenderId: "456774556380",
  appId: "1:456774556380:web:d5805f9d414cafbd1f3219"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}