import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

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

