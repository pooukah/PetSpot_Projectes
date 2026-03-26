// PetSpot — Login

// Al principio no hay perfil seleccionado
var perfilSeleccionado = null;

// Datos de prueba para los dos perfiles
var datosPrueba = {
  cliente:     { nombre: 'María Fernández', email: 'maria@email.com',       direccion: 'Carrer de Balmes, 42, 3º Barcelona 08007' },
  veterinario: { nombre: 'Carmen García',   email: 'dr.garcia@vetpro.es',   clinica: 'Clínica VetPro', direccion: 'Carrer de Balmes, 120 Barcelona' }
};

function seleccionarPerfil(tipo) {
  perfilSeleccionado = tipo;

  // Cambiar clase del body para aplicar colores del perfil
  document.body.classList.remove('cliente', 'veterinario');
  document.body.classList.add(tipo);

  // Marcar el botón activo
  document.getElementById('opt-cliente').classList.toggle('active', tipo === 'cliente');
  document.getElementById('opt-vet').classList.toggle('active', tipo === 'veterinario');

  // Poner el email de prueba
  document.getElementById('email').value = datosPrueba[tipo].email;
}

function iniciarSesion() {
  // Comprobar que se ha seleccionado perfil
  if (!perfilSeleccionado) {
    PetSpot.notify('Por favor, selecciona un perfil primero');
    return;
  }

  var email = document.getElementById('email').value.trim();
  if (!email) {
    PetSpot.notify('Introduce tu correo electrónico');
    return;
  }

  // Guardar datos del usuario en la sesión
  var datos = datosPrueba[perfilSeleccionado];
  var usuario = {
    tipo:      perfilSeleccionado,
    nombre:    datos.nombre,
    email:     datos.email,
    clinica:   datos.clinica || '',
    direccion: datos.direccion || ''
  };
  PetSpot.setUser(usuario);

  // Redirigir a la página correspondiente
  if (perfilSeleccionado === 'cliente') {
    window.location.href = 'cliente/htmls/inicio.html';
  } else {
    window.location.href = 'veterinario/htmls/inicio.html';
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
}
