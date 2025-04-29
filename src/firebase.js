import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDTl_x_9QWEKG4z0iWN9GfD37KlWuFLdAk",
  authDomain: "menu-f22ad.firebaseapp.com",
  projectId: "menu-f22ad",
  storageBucket: "menu-f22ad.appspot.com",
  messagingSenderId: "784436190787",
  appId: "1:784436190787:web:359140788fe659334cfef6"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, ref, uploadBytes, getDownloadURL };
