// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVDHEmRFf8N_ZV58RJ2Hw4379Z1cieVAQ",
  authDomain: "cs-392-raid.firebaseapp.com",
  databaseURL: "https://cs-392-raid-default-rtdb.firebaseio.com",
  projectId: "cs-392-raid",
  storageBucket: "cs-392-raid.firebasestorage.app",
  messagingSenderId: "381763564571",
  appId: "1:381763564571:web:dc9bf1eb725ac01c22f4be",
  measurementId: "G-5SM99GFGK2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getDatabase(app);