////////////////////////////////////////////////////////// DOM
const optCliente = document.getElementById('opt-cliente');
const optVet = document.getElementById('opt-vet');
const btnLogin = document.getElementById('btn-login');
const inputPass = document.getElementById('pass');
const loginThemeToggle = document.getElementById('login-theme-toggle');
const logoIcon = document.getElementById('logo-icon');
const iconCliente = document.getElementById('icon-cliente');
const iconVet = document.getElementById('icon-vet');
const loginThemeIcon = document.getElementById('login-theme-icon');

////////////////////////////////////////////////////////// VARIABLES
// al principio no hay perfil seleccionado
let perfilSeleccionado = null;

////////////////////////////////////////////////////////// FUNCIONES
const seleccionarPerfil = function(tipo){
  perfilSeleccionado = tipo;

  document.body.classList.remove('cliente', 'veterinario');
  document.body.classList.add(tipo);

  optCliente.classList.toggle('active', tipo === 'cliente');
  optVet.classList.toggle('active', tipo === 'veterinario');
};

// USO INNERHTML EN VARIOS JS PARA LOS SVG, PERDONAME ORIOL
const actualizarIconoTema = await function(){
  let oscuro = localStorage.getItem('ps_dark') !== 'false';
  ponerIcono(loginThemeIcon, oscuro ? Icons.moon : Icons.sun);
  loginThemeToggle.classList.toggle('on', !oscuro);

  iconCliente.innerHTML = Icons.profileUser || Icons.user;
  iconVet.innerHTML = Icons.profileVet || Icons.stethoscope;
};

const iniciarSesion = async function() {
  console.log('perfil:', perfilSeleccionado);
  if (!perfilSeleccionado) {
    PetSpot.notify('Por favor, selecciona un perfil primero');
    return;
  }

  let email = document.getElementById('email').value.trim();
  let password = document.getElementById('pass').value;
  if (!email || !password) {
    PetSpot.notify('Introduce tu correo y contraseña');
    return;
  }

  try {
    const response = await fetch("https://132.226.61.215/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rol: perfilSeleccionado })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('error:', err);
      throw new Error(err.detail || "Error en el login");
    }

    const data = await response.json();
    sessionStorage.setItem('user_id', String(data.id));
    sessionStorage.setItem('user_email', data.email);
    sessionStorage.setItem('user_rol', data.rol);

    PetSpot.setUser({
      tipo: data.rol,
      nombre: data.nombre || data.email,
      email: data.email,
      id: data.id
    });

    const destino = data.rol === 'cliente' 
      ? 'cliente/htmls/inicio.html' 
      : 'veterinario/htmls/inicio.html';
    window.location.href = destino;
    
    PetSpot.notify('Sesión iniciada correctamente');

    // Redirigir según el rol
    // if (data.rol === 'cliente') {
    //   window.location.href = 'cliente/htmls/inicio.html';
    // } else {
    //   window.location.href = 'veterinario/htmls/inicio.html';
    // }

  } catch (error) {
    console.error('Error:', error);
    PetSpot.notify(error.message);
  }
};

const init = function(){
  // aplicar tema guardado
  let oscuro = localStorage.getItem('ps_dark') !== 'false';
  document.body.classList.toggle('modoclaro', !oscuro);

  // poner iconos
  ponerIcono(logoIcon, Icons.logoPaw);
  iconCliente.innerHTML = Icons.user;
  iconVet.innerHTML = Icons.stethoscope;

  actualizarIconoTema();
  loginThemeToggle.addEventListener('click', function() {
    PetSpot.toggleTheme();
    actualizarIconoTema();
  });
};

////////////////////////////////////////////////////////// ADD EVENT LISTENERS
optCliente.addEventListener('click', function() {
  seleccionarPerfil('cliente');
});
optVet.addEventListener('click', function() {
  seleccionarPerfil('veterinario');
});
btnLogin.addEventListener('click', function() {
  iniciarSesion();
});
inputPass.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    iniciarSesion();
  }
});

init();