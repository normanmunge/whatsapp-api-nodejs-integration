// import { initializeApp } from 'firebase/app';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { getFirestore, collection, getDocs, getDoc } from 'firebase/firestore';
const {
  initializeApp,
  applicationDefault,
  cert,
} = require('firebase-admin/app');
const {
  getFirestore,
  collection,
  Timestamp,
  Fieldvalue,
  Filter,
} = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./wekeza-400900-da2ba1ac236f.json');

//FIREBASE
// const firebaseApp = initializeApp({
//   // apiKey: 'AIzaSyBM_NlorUBFSS6v3KABt7KqQrXQr06J51E',
//   // authDomain: 'wekeza-chama.firebaseapp.com',
//   // projectId: 'wekeza-chama',
//   // storageBucket: 'wekeza-chama.appspot.com',
//   // messagingSenderId: '992820576827',
//   // appId: '1:992820576827:web:50f0a695fd046c2e6d521e',
//   // measurementId: 'G-QRWBWFQ7QE',
//   apiKey: process.env.FIREBASE_APIKEY,
//   authDomain: process.env.FIREBASE_AUTHDOMAIN,
//   projectId: process.env.FIREBASE_PROJECTID,
//   storageBucket: process.env.FIREBASE_STORAGEBUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGESENDERID,
//   appId: process.env.FIREBASE_APPID,
//   measurementId: process.env.FIREBASE_MEASUREMENTID,
// });
initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

// const todosCol = collection(db, 'todos'); //to create a collection
// const snapshot = await getDocs(todosCol); //to get collections

// onAuthStateChanged(auth, (user) => {
//   if (user !== null) {
//     console.log('Logged In');
//   } else {
//     console.log('No user!');
//   }
// });
module.exports = { auth, db, collection };
