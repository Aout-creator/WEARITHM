import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCPPYlofrkUlSD10BF_vFi7q-yXYYHA5ck",
  authDomain: "wearithm.firebaseapp.com",
  projectId: "wearithm",
  storageBucket: "wearithm.appspot.com",
  messagingSenderId: "976898261573",
  appId: "1:976898261573:web:d750dfc1fe50603b1c192c",
  measurementId: "G-8Q3BY3RHN5"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 객체 생성
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Google 로그인용 Provider 객체
export const provider = new GoogleAuthProvider();
