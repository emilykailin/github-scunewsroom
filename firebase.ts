// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Import Firestore
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDy8RKHXSo0rL8DoVk9usc4yIVL6imfnrM",
  authDomain: "scu-newsroom.firebaseapp.com",
  projectId: "scu-newsroom",
  storageBucket: "scu-newsroom.firebasestorage.app",
  messagingSenderId: "10115350784",
  appId: "1:10115350784:web:1c8350b5039aebffae73e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Firebase Storage

const savePreferences = async (userId: string, preferences: object) => {
  try {
    await setDoc(doc(db, "users", userId), preferences);
    console.log("Preferences saved successfully!");
  } catch (error) {
    console.error("Error saving preferences:", error);
  }
};

export { auth, provider, db, storage, savePreferences, firebaseConfig }; // Export Firebase Storage