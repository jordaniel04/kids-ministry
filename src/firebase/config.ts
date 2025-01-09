import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC7a-9OOE2-D8kXV2HwkG4Pq3DPNVkuyjc",
    authDomain: "kids-ministry-peru.firebaseapp.com",
    projectId: "kids-ministry-peru",
    storageBucket: "kids-ministry-peru.firebasestorage.app",
    messagingSenderId: "415063717848",
    appId: "1:415063717848:web:f2cced8b4d1b160647a4ad"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager({
            forceOwnership: true
        })
    })
}); 