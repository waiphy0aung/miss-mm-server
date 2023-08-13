// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXRHPn3Y7M_F0RF8PUi2II8HPQD1ag4Yc",
  authDomain: "miss-mm-53464.firebaseapp.com",
  projectId: "miss-mm-53464",
  storageBucket: "miss-mm-53464.appspot.com",
  messagingSenderId: "423280106059",
  appId: "1:423280106059:web:000b8da3b284981c6c4bce",
  measurementId: "G-K98D3W3D0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
