import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBqRa059vX8abyuNftycnfgqf1I2aeoYI4",
  authDomain: "nutrition-8e780.firebaseapp.com",
  projectId: "nutrition-8e780",
  storageBucket: "nutrition-8e780.firebasestorage.app",
  messagingSenderId: "522126948827",
  appId: "1:522126948827:web:8e3f6552f1b31a187f8ffe",
  measurementId: "G-CL7CB3MMGX"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
