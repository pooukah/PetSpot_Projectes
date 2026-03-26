// PetSpot — Configuración de Firebase
// ============================================================
// INSTRUCCIONES PARA CONFIGURAR FIREBASE:
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un nuevo proyecto (o usa uno existente)
// 3. En "Configuración del proyecto" > "Tus apps" > Añade una app web
// 4. Copia los valores de firebaseConfig y pégalos aquí abajo
// 5. En la consola de Firebase:
//    - Activa Authentication > Email/Password
//    - Activa Cloud Firestore (empieza en modo de prueba)
// ============================================================

var firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROYECTO.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Servicios de Firebase disponibles globalmente
var auth = firebase.auth();
var db   = firebase.firestore();

// Configurar idioma de Firebase Auth en español
auth.languageCode = 'es';
