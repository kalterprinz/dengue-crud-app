import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDGMc2gd2TmOYspyXDBwYq8vin7f-yueDs",
    authDomain: "lab3part3-8fc4e.firebaseapp.com",
    projectId: "lab3part3-8fc4e",
    storageBucket: "lab3part3-8fc4e.firebasestorage.app",
    messagingSenderId: "976760534486",
    appId: "1:976760534486:web:788acfe80899808f75e077",
    measurementId: "G-VV35DQDGR4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db };