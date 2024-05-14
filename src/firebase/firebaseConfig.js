// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAYiOUyyVXxAl6jnZvsBQEAV3PClHIcYoM",
    authDomain: "veryinteresting-f00a0.firebaseapp.com",
    projectId: "veryinteresting-f00a0",
    storageBucket: "veryinteresting-f00a0.appspot.com",
    messagingSenderId: "332303687534",
    appId: "1:332303687534:web:d551b03616297fc930ab7f",
    measurementId: "G-F3XW9D0P0X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);