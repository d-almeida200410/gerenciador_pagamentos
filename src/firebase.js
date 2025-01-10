// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAuxURShTHNb3Fa6dLtffQsilUqHo8-1u8",
    authDomain: "controlepagamento-74549.firebaseapp.com",
    projectId: "controlepagamento-74549",
    storageBucket: "controlepagamento-74549.firebasestorage.app",
    messagingSenderId: "631445058365",
    appId: "1:631445058365:web:bb73ffe0ab58bbbbcfcb54"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, addDoc, deleteDoc, doc };
