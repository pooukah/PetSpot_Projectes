////////////////////////////////////////////////////////// DOM
const optCliente = document.getElementById('opt-cliente');
const optVet = document.getElementById('opt-vet');
const btnRegistro = document.getElementById('btn-registro');
const regNombre = document.getElementById('reg-nombre');
const regApellidos = document.getElementById('reg-apellidos');
const regEmail = document.getElementById('reg-email');
const regTelefono = document.getElementById('reg-telefono');
const regPass = document.getElementById('reg-pass');
const regPass2 = document.getElementById('reg-pass2');
const vetFields = document.getElementById('vet-fields');
const regClinica = document.getElementById('reg-clinica');
const msgNoClinica = document.getElementById('msg-no-clinica');
const loginThemeToggle = document.getElementById('login-theme-toggle');
const loginThemeIcon = document.getElementById('login-theme-icon');
const logoIcon = document.getElementById('logo-icon');
const iconCliente = document.getElementById('icon-cliente');
const iconVet = document.getElementById('icon-vet');

////////////////////////////////////////////////////////// VARIABLES
let perfilSeleccionado = null;

////////////////////////////////////////////////////////// FUNCIONES
const seleccionarPerfil = function(tipo) {
  perfilSeleccionado = tipo;

  document.body.classList.remove('cliente', 'veterinario');
  document.body.classList.add(tipo);

  optCliente.classList.toggle('active', tipo === 'cliente');
  optVet.classList.toggle('active', tipo === 'veterinario');

  if (tipo === 'veterinario') {
    vetFields.style.display = 'block';
  } else {
    vetFields.style.display = 'none';
    msgNoClinica.style.display = 'none';
  }
};

const comprobarClinica = function() {
  let clinica = regClinica.value;

  if (clinica === 'no-encuentro') {
    msgNoClinica.style.display = 'block';
  } else {
    msgNoClinica.style.display = 'none';
  }
};

const actualizarIconoTema = function() {
  let oscuro = localStorage.getItem('ps_dark') !== 'false';
  ponerIcono(loginThemeIcon, oscuro ? Icons.moon : Icons.sun);
  loginThemeToggle.classList.toggle('on', !oscuro);

  iconCliente.innerHTML = Icons.profileUser || Icons.user;
  iconVet.innerHTML = Icons.profileVet || Icons.stethoscope;
};

const cargarClinicas = async function() {
  const API_URL = "http://127.0.0.1:8000/clinicas/registro";
  try {
    const resposta = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!resposta.ok) {
      throw new Error("No se pudieron cargar las clínicas");
    }
    
    const clinicas = await resposta.json();
    
    if (regClinica) {
      while (regClinica.options.length > 1) {
        regClinica.remove(1);
      }
      
      for (let i = 0; i < clinicas.length; i++) {
        const option = document.createElement('option');
        option.value = clinicas[i].nombre;
        option.textContent = clinicas[i].nombre;
        regClinica.appendChild(option);
      }
    }
  } catch (error) {
    console.log("Error cargando clínicas:", error);
  }
};

const registrarse = async function() {
  if (!perfilSeleccionado) {
    PetSpot.notify('Por favor, selecciona un perfil');
    return;
  }

  let nombre = regNombre.value.trim();
  let apellidos = regApellidos.value.trim();
  let email = regEmail.value.trim();
  let telefono = regTelefono.value.trim();
  let pass = regPass.value;
  let pass2 = regPass2.value;

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

  let datos = {
    nombre: nombre,
    apellidos: apellidos,
    email: email,
    telefono: telefono,
    password: pass
  };

  let url = "";

  if (perfilSeleccionado === 'cliente') {
    url = "http://127.0.0.1:8000/auth/registro/cliente";
  } else {
    url = "http://127.0.0.1:8000/auth/registro/veterinario";
    
    let clinicaNombre = regClinica.options[regClinica.selectedIndex]?.text;
    
    if (!clinicaNombre || regClinica.value === 'no-encuentro' || regClinica.value === '') {
      PetSpot.notify('Debes seleccionar una clínica registrada en PetSpot');
      return;
    }
    datos.clinica = clinicaNombre;
  }

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (!resposta.ok) {
      const error = await resposta.json();
      throw new Error(error.detail || 'Error en el registro');
    }

    const data = await resposta.json();
    console.log(data);
    
    PetSpot.notify('Cuenta creada correctamente.');

    setTimeout(function() {
      window.location.href = 'index.html';
    }, 1800);

  } catch (error) {
    console.log('ERROR:', error);
    PetSpot.notify('Error: ' + error.message);
  }
};

const init = function() {
  let oscuro = localStorage.getItem('ps_dark') !== 'false';
  document.body.classList.toggle('modoclaro', !oscuro);

  ponerIcono(logoIcon, Icons.logoPaw);
  ponerIcono(iconCliente, Icons.user);
  ponerIcono(iconVet, Icons.stethoscope);

  actualizarIconoTema();
  cargarClinicas();

  loginThemeToggle.addEventListener('click', function() {
    PetSpot.toggleTheme();
    actualizarIconoTema();
  });
};
init();

////////////////////////////////////////////////////////// ADD EVENT LISTENERS
optCliente.addEventListener('click', function() {
  seleccionarPerfil('cliente');
});
optVet.addEventListener('click', function() {
  seleccionarPerfil('veterinario');
});
btnRegistro.addEventListener('click', function() {
  registrarse();
});
regClinica.addEventListener('change', function() {
  comprobarClinica();
});
