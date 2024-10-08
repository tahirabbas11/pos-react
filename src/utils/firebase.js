// firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
    apiKey: "AIzaSyBX9Ae2wo_Q-6VSiWZZBxDbtH7a0Q4J9IA",
    authDomain: "bachatxpress-68547.firebaseapp.com",
    projectId: "bachatxpress-68547",
    storageBucket: "bachatxpress-68547.appspot.com",
    messagingSenderId: "699805592960",
    appId: "1:699805592960:web:f3d1ba9880564bd0fde565",
    measurementId: "G-1B1BQRSZ08"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);
const db = getDatabase(app);


export { storage, db };
