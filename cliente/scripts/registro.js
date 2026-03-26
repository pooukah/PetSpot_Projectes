// PetSpot — Registro con Firebase Auth

var perfilSeleccionado = null;

function seleccionarPerfil(tipo) {
  perfilSeleccionado = tipo;

  // Colores según perfil
  document.body.classList.remove('cliente', 'veterinario');
  document.body.classList.add(tipo);

  // Botón activo
  document.getElementById('opt-cliente').classList.toggle('active', tipo === 'cliente');
  document.getElementById('opt-vet').classList.toggle('active', tipo === 'veterinario');

  // Mostrar campos extra de veterinario
  if (tipo === 'veterinario') {
    document.getElementById('vet-fields').style.display = 'block';
  } else {
    document.getElementById('vet-fields').style.display = 'none';
    document.getElementById('msg-no-clinica').style.display = 'none';
  }
}

function comprobarClinica() {
  var clinica = document.getElementById('reg-clinica').value;
  var msgNoClinica = document.getElementById('msg-no-clinica');

  if (clinica === 'no-encuentro') {
    msgNoClinica.style.display = 'block';
  } else {
    msgNoClinica.style.display = 'none';
  }
}

function registrarse() {
  // Comprobar perfil
  if (!perfilSeleccionado) {
    PetSpot.notify('Por favor, selecciona un perfil');
    return;
  }

  // Comprobar campos básicos
  var nombre    = document.getElementById('reg-nombre').value.trim();
  var apellidos = document.getElementById('reg-apellidos').value.trim();
  var email     = document.getElementById('reg-email').value.trim();
  var pass      = document.getElementById('reg-pass').value;
  var pass2     = document.getElementById('reg-pass2').value;

  if (!nombre || !apellidos || !email || !pass) {
    PetSpot.notify('Por favor, rellena todos los campos');
    return;
  }

  if (pass !== pass2) {
    PetSpot.notify('Las contraseñas no coinciden');
    return;
  }

  if (pass.length < 6) {
    PetSpot.notify('La contraseña debe tener al menos 6 caracteres');
    return;
  }

  // Si es veterinario, comprobar clínica
  var clinicaNombre = '';
  if (perfilSeleccionado === 'veterinario') {
    var clinica = document.getElementById('reg-clinica').value;
    if (!clinica || clinica === 'no-encuentro') {
      PetSpot.notify('Debes seleccionar una clínica registrada en PetSpot');
      return;
    }
    // Obtener el texto visible del select
    var selectEl = document.getElementById('reg-clinica');
    clinicaNombre = selectEl.options[selectEl.selectedIndex].text;
  }

  // Deshabilitar botón mientras se procesa
  var btnReg = document.getElementById('btn-registro');
  if (btnReg) {
    btnReg.disabled = true;
    btnReg.textContent = 'Creando cuenta...';
  }

  var nombreCompleto = nombre + ' ' + apellidos;

  // Firebase Auth — crear cuenta con email y contraseña
  auth.createUserWithEmailAndPassword(email, pass)
    .then(function(userCredential) {
      var firebaseUser = userCredential.user;

      // Actualizar el displayName en Firebase Auth
      return firebaseUser.updateProfile({
        displayName: nombreCompleto
      }).then(function() {
        // Guardar datos del usuario en Firestore
        var userData = {
          uid:       firebaseUser.uid,
          tipo:      perfilSeleccionado,
          nombre:    nombreCompleto,
          email:     firebaseUser.email,
          clinica:   clinicaNombre,
          direccion: '',
          telefono:  '',
          mascotas:  [],
          citas:     [],
          citas_vet: [],
          pedidos:   [],
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        return db.collection('users').doc(firebaseUser.uid).set(userData);
      }).then(function() {
        // Cerrar sesión de Firebase (el usuario debe iniciar sesión manualmente)
        return auth.signOut();
      }).then(function() {
        PetSpot.notify('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
        // Esperar un momento y redirigir al login
        setTimeout(function() {
          window.location.href = 'index.html';
        }, 1800);
      });
    })
    .catch(function(error) {
      if (btnReg) {
        btnReg.disabled = false;
        btnReg.textContent = 'Crear cuenta';
      }
      var msg = 'Error al crear la cuenta';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Ya existe una cuenta con este correo electrónico';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'El correo electrónico no es válido';
      } else if (error.code === 'auth/weak-password') {
        msg = 'La contraseña es demasiado débil (mínimo 6 caracteres)';
      }
      PetSpot.notify(msg);
      console.warn('Registro error:', error.code, error.message);
    });
}

// ── Al cargar la página ──
(function() {
  // Tema
  var oscuro = localStorage.getItem('ps_dark') !== 'false';
  document.body.classList.toggle('modoclaro', !oscuro);

  // Iconos
  ponerIcono(document.getElementById('logo-icon'), Icons.logoPaw);
  ponerIcono(document.getElementById('icon-cliente'), Icons.user);
  ponerIcono(document.getElementById('icon-vet'), Icons.stethoscope);

  actualizarIconoTema();

  document.getElementById('login-theme-toggle').addEventListener('click', function() {
    PetSpot.toggleTheme();
    actualizarIconoTema();
  });
})();

function actualizarIconoTema() {
  var oscuro = localStorage.getItem('ps_dark') !== 'false';
  ponerIcono(document.getElementById('login-theme-icon'), oscuro ? Icons.moon : Icons.sun);
  document.getElementById('login-theme-toggle').classList.toggle('on', !oscuro);
}
