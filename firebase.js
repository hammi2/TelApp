import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWNQn4Ly6l9gf9uI9w9hkP3dn99NYglig",
  authDomain: "bamboo-reason-410015.firebaseapp.com",
  databaseURL: "https://bamboo-reason-410015-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bamboo-reason-410015",
  storageBucket: "bamboo-reason-410015.appspot.com",
  messagingSenderId: "1029644196564",
  appId: "1:1029644196564:web:d990a84c0e2f18cee4f941"
};

// Initialize the app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
let auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };