// al principio no hay perfil seleccionado
var perfilSeleccionado = null;

function seleccionarPerfil(tipo) {
  perfilSeleccionado = tipo;

  // aplicar los colores segun el tipo de perfil seleccionado
  document.body.classList.remove('cliente', 'veterinario');
  document.body.classList.add(tipo);

  // Marcar el botón activo
  document.getElementById('opt-cliente').classList.toggle('active', tipo === 'cliente');
  document.getElementById('opt-vet').classList.toggle('active', tipo === 'veterinario');

}

async function iniciarSesion() {
   console.log('iniciarSesion llamado, perfil:', perfilSeleccionado);
  if (!perfilSeleccionado) {
    PetSpot.notify('Por favor, selecciona un perfil primero');
    return;
  }

  var email = document.getElementById('email').value.trim();
  var password = document.getElementById('pass').value;
  if (!email || !password) {
    PetSpot.notify('Introduce tu correo electrónico');
    return;
  }

  try {
    const response = await fetch("https://localhost:443/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rol: perfilSeleccionado })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Login fallido:', err);
      throw new Error(err.detail || "Error en el login");
    }

    const data = await response.json();

    PetSpot.setUser({
      tipo: data.rol,
      nombre: data.nombre || data.email,
      email: data.email,
      id: data.id
    });

    localStorage.setItem('user_id', data.id);
    localStorage.setItem('user_email', data.email);
    localStorage.setItem('user_rol', data.rol);

    // Redirección con log
    const destino = data.rol === 'cliente' 
      ? 'cliente/htmls/inicio.html' 
      : 'veterinario/htmls/inicio.html';
    window.location.href = destino;
    
    PetSpot.notify('✅ Sesión iniciada correctamente');

    // Redirigir según el rol
    // if (data.rol === 'cliente') {
    //   window.location.href = 'cliente/htmls/inicio.html';
    // } else {
    //   window.location.href = 'veterinario/htmls/inicio.html';
    // }

  } catch (error) {
    console.error('Error catch:', error);
    PetSpot.notify('❌ ' + error.message);
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
