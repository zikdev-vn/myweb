// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyClw-HGWZ_HuqUhUJwRmZc1i6pXB62gRxY",
  authDomain: "zikdevblock.firebaseapp.com",
  projectId: "zikdevblock",
  storageBucket: "zikdevblock.firebasestorage.app",
  messagingSenderId: "523185490930",
  appId: "1:523185490930:web:ce6472faf749ca401a796b",
  measurementId: "G-97R0Q16W3N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
