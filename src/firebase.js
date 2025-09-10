import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAKjqMrHh0xth7EKEDOwzBK0-WCyU2PxmQ",
  authDomain: "assignment-1313c.firebaseapp.com",
  projectId: "assignment-1313c",
  storageBucket: "assignment-1313c.firebasestorage.app",
  messagingSenderId: "1050704384238",
  appId: "1:1050704384238:web:f8181a59fa7be55d79e3ff"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Connect to emulators when in development
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9098')
  connectFirestoreEmulator(db, '127.0.0.1', 8081)
}
