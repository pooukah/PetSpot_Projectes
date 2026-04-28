import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "petscop-651b5.firebaseapp.com",
    projectId: "petscop-651b5",
    storageBucket: "petscop-651b5.firebasestorage.app",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// al principio no hay perfil seleccionado
var perfilSeleccionado = null;

function seleccionarPerfil(tipo) {
  perfilSeleccionado = tipo;
  document.body.classList.remove('cliente', 'veterinario');
  document.body.classList.add(tipo);
  document.getElementById('opt-cliente').classList.toggle('active', tipo === 'cliente');
  document.getElementById('opt-vet').classList.toggle('active', tipo === 'veterinario');
}

function iniciarSesion() {
  if (!perfilSeleccionado) {
    PetSpot.notify('Por favor, selecciona un perfil primero');
    return;
  }

  var email = document.getElementById('email').value.trim();
  var password = document.getElementById('pass').value;
  
  if (!email || !password) {
    PetSpot.notify('Introduce tu correo y contraseña');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const firebaseUid = user.uid;
    
    localStorage.setItem('firebase_uid', firebaseUid);
    localStorage.setItem('user_email', email);
    
    var usuario = {
      tipo: perfilSeleccionado,
      email: email,
      firebase_uid: firebaseUid
    };
    if (perfilSeleccionado === 'cliente') {
      window.location.href = 'cliente/htmls/inicio.html';
    } else {
      window.location.href = 'veterinario/htmls/inicio.html';
    }
    
  }catch(error){
    let mensaje = "Error al iniciar sesión";
    if (error.code === 'auth/user-not-found') {
      mensaje = "Usuario no encontrado. ¿Estás registrado?";
    } else if (error.code === 'auth/wrong-password') {
      mensaje = "Contraseña incorrecta";
    } else if (error.code === 'auth/invalid-email') {
      mensaje = "Email inválido";
    }
    PetSpot.notify(mensaje);
  }
}

// ── Al cargar la página ──
(function() {
  // Aplicar tema guardado
  var oscuro = localStorage.getItem('ps_dark') !== 'false';
  document.body.classList.toggle('modoclaro', !oscuro);

  // Poner iconos
  ponerIcono(document.getElementById('logo-icon'), Icons.logoPaw);
  ponerIcono(document.getElementById('icon-cliente'), Icons.user);
  ponerIcono(document.getElementById('icon-vet'), Icons.stethoscope);

  // Icono del toggle de tema
  actualizarIconoTema();

  // Evento del toggle de tema
  document.getElementById('login-theme-toggle').addEventListener('click', function() {
    PetSpot.toggleTheme();
    actualizarIconoTema();
  });
})();

function actualizarIconoTema() {
  var oscuro = localStorage.getItem('ps_dark') !== 'false';
  ponerIcono(document.getElementById('login-theme-icon'), oscuro ? Icons.moon : Icons.sun);
  document.getElementById('login-theme-toggle').classList.toggle('on', !oscuro);
  document.getElementById('icon-cliente').innerHTML = Icons.profileUser || Icons.user;
  document.getElementById('icon-vet').innerHTML = Icons.profileVet || Icons.stethoscope;
}
