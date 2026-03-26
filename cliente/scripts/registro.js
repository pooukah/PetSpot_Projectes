// PetSpot — Registro de nuevo usuario

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
    // Mostrar info de contacto
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
  if (perfilSeleccionado === 'veterinario') {
    var clinica = document.getElementById('reg-clinica').value;
    if (!clinica || clinica === 'no-encuentro') {
      PetSpot.notify('Debes seleccionar una clínica registrada en PetSpot');
      return;
    }
  }

  // Todo correcto — simular registro y redirigir al login
  // (En una versión real, aquí se haría una llamada al servidor)
  PetSpot.notify('✅ Cuenta creada correctamente. Ahora puedes iniciar sesión.');

  // Esperar un momento y redirigir al login
  setTimeout(function() {
    window.location.href = 'index.html';
  }, 1800);
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
