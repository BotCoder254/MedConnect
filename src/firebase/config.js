import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBMjKssyRSZJ16EhSdVOFd2XjIkj8_BT-E",

    authDomain: "twitterclone-47ebf.firebaseapp.com",
  
    databaseURL: "https://twitterclone-47ebf-default-rtdb.firebaseio.com",
  
    projectId: "twitterclone-47ebf",
  
    storageBucket: "twitterclone-47ebf.appspot.com",
  
    messagingSenderId: "700556014223",
  
    appId: "1:700556014223:web:a0646158ade0b1e55ab6fa",
  
    measurementId: "G-0WGJF9H0EL"
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
