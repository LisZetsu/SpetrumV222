// Конфиг Firebase + глобальные переменные
const OWNER_EMAIL = 'ggbrodyagu@gmail.com';

const firebaseConfig = {
  apiKey: "AIzaSyBiG2Smma314BAsPYa5e1v-bvKmpmzNXVY",
  authDomain: "spectrum-v2-66ad9.firebaseapp.com",
  projectId: "spectrum-v2-66ad9",
  storageBucket: "spectrum-v2-66ad9.firebasestorage.app",
  messagingSenderId: "852178093712",
  appId: "1:852178093712:web:4a987e330305d205473a15",
  measurementId: "G-0850XFP4DS"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = JSON.parse(localStorage.getItem('spectrum_cloud_user')) || null;
let isUserApproved = false;