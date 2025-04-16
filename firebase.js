import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { collection, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD58UHOpVhhLT2GgHcWwqnEm7ILpMO6VoA",
  authDomain: "hike-app-4e213.firebaseapp.com",
  projectId: "hike-app-4e213",
  storageBucket: "hike-app-4e213.firebasestorage.app",
  messagingSenderId: "1061329699766",
  appId: "1:1061329699766:web:07c86b688c8ad7b0517717",
  measurementId: "G-M4DJWKK7Q0"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence (modern approach)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(), // required if you want multi-tab sync
  }),
});

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth, db };
