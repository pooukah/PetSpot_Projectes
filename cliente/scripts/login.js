// PetSpot — Login con Firebase Auth

// Al principio no hay perfil seleccionado
var perfilSeleccionado = null;

function seleccionarPerfil(tipo) {
  perfilSeleccionado = tipo;

  // Cambiar clase del body para aplicar colores del perfil
  document.body.classList.remove('cliente', 'veterinario');
  document.body.classList.add(tipo);

  // Marcar el botón activo
  document.getElementById('opt-cliente').classList.toggle('active', tipo === 'cliente');
  document.getElementById('opt-vet').classList.toggle('active', tipo === 'veterinario');
}

function iniciarSesion() {
  // Comprobar que se ha seleccionado perfil
  if (!perfilSeleccionado) {
    PetSpot.notify('Por favor, selecciona un perfil primero');
    return;
  }

  var email = document.getElementById('email').value.trim();
  var pass  = document.getElementById('pass').value;

  if (!email) {
    PetSpot.notify('Introduce tu correo electrónico');
    return;
  }
  if (!pass) {
    PetSpot.notify('Introduce tu contraseña');
    return;
  }

  // Deshabilitar el botón mientras se procesa
  var btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.disabled = true;
    btnLogin.textContent = 'Iniciando sesión...';
  }

  // Firebase Auth — iniciar sesión con email y contraseña
  auth.signInWithEmailAndPassword(email, pass)
    .then(function(userCredential) {
      var firebaseUser = userCredential.user;

      // Cargar datos del usuario desde Firestore
      return db.collection('users').doc(firebaseUser.uid).get().then(function(doc) {
        var userData = doc.exists ? doc.data() : {};

        // Verificar que el tipo de perfil coincide
        if (userData.tipo && userData.tipo !== perfilSeleccionado) {
          PetSpot.notify('Esta cuenta está registrada como ' + userData.tipo);
          auth.signOut();
          if (btnLogin) {
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar sesión';
          }
          return;
        }

        // Guardar datos del usuario en la sesión
        var usuario = {
          uid:       firebaseUser.uid,
          tipo:      userData.tipo || perfilSeleccionado,
          nombre:    userData.nombre || firebaseUser.displayName || email.split('@')[0],
          email:     firebaseUser.email,
          clinica:   userData.clinica || '',
          direccion: userData.direccion || '',
          telefono:  userData.telefono || ''
        };
        PetSpot.setUser(usuario);

        // Redirigir a la página correspondiente
        if (usuario.tipo === 'cliente') {
          window.location.href = 'cliente/htmls/inicio.html';
        } else {
          window.location.href = 'veterinario/htmls/inicio.html';
        }
      });
    })
    .catch(function(error) {
      if (btnLogin) {
        btnLogin.disabled = false;
        btnLogin.textContent = 'Iniciar sesión';
      }
      var msg = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found') {
        msg = 'No existe una cuenta con este correo';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msg = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'El correo electrónico no es válido';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Demasiados intentos. Espera unos minutos';
      }
      PetSpot.notify(msg);
      console.warn('Login error:', error.code, error.message);
    });
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

  // Si el usuario ya tiene sesión de Firebase activa, redirigir
  auth.onAuthStateChanged(function(firebaseUser) {
    if (firebaseUser) {
      var sessionUser = PetSpot.getUser();
      if (sessionUser && sessionUser.uid === firebaseUser.uid) {
        if (sessionUser.tipo === 'cliente') {
          window.location.href = 'cliente/htmls/inicio.html';
        } else {
          window.location.href = 'veterinario/htmls/inicio.html';
        }
      }
    }
  });
})();

function actualizarIconoTema() {
  var oscuro = localStorage.getItem('ps_dark') !== 'false';
  ponerIcono(document.getElementById('login-theme-icon'), oscuro ? Icons.moon : Icons.sun);
  document.getElementById('login-theme-toggle').classList.toggle('on', !oscuro);
}
