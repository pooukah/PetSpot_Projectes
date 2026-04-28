// PetSpot — Registro de nuevo usuario

var perfilSeleccionado = null;

function seleccionarPerfil(tipo) {
  perfilSeleccionado = tipo;

  document.body.classList.remove('cliente', 'veterinario');
  document.body.classList.add(tipo);

  document.getElementById('opt-cliente').classList.toggle('active', tipo === 'cliente');
  document.getElementById('opt-vet').classList.toggle('active', tipo === 'veterinario');

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

async function registrarse() {
  if (!perfilSeleccionado) {
    PetSpot.notify('Por favor, selecciona un perfil');
    return;
  }

  var nombre    = document.getElementById('reg-nombre').value.trim();
  var apellidos = document.getElementById('reg-apellidos').value.trim();
  var email     = document.getElementById('reg-email').value.trim();
  var telefono  = document.getElementById('reg-telefono').value.trim();
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

  var datos = {
    nombre: nombre,
    apellidos: apellidos,
    email: email,
    telefono: telefono,
    password: pass,
    rol: perfilSeleccionado
  };

  if (perfilSeleccionado === 'veterinario') {
    var clinicaSelect = document.getElementById('reg-clinica');
    var clinicaId = clinicaSelect.value;
    
    if (!clinicaId || clinicaId === 'no-encuentro') {
      PetSpot.notify('Debes seleccionar una clínica registrada en PetSpot');
      return;
    }
    datos.id_clinica = parseInt(clinicaId);
  }

  var url = "https://localhost:443/auth/registro";

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
    
    PetSpot.notify('✅ Cuenta creada correctamente. Ahora puedes iniciar sesión.');

    setTimeout(function() {
      window.location.href = 'index.html';
    }, 1800);

  } catch (error) {
    console.log('ERROR:', error);
    PetSpot.notify('❌ Error: ' + error.message);
  }
}

// ── Al cargar la página ──
(function() {
  // Cargar clínicas en el desplegable
  async function cargarClinicas() {
    const API_URL = "https://localhost:443/clinicas/registro";
    try {
      const resposta = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!resposta.ok) {
        throw new Error("No se pudieron cargar las clínicas");
      }
      
      const clinicas = await resposta.json();
      const select = document.getElementById('reg-clinica');
      
      if (select) {
        while (select.options.length > 1) {
          select.remove(1);
        }
        
        for (let i = 0; i < clinicas.length; i++) {
          const option = document.createElement('option');
          option.value = clinicas[i].id_clinica;
          option.textContent = clinicas[i].nombre;
          select.appendChild(option);
        }
      }
    } catch (error) {
      console.log("Error cargando clínicas:", error);
    }
  }

  cargarClinicas();

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
  document.getElementById('icon-cliente').innerHTML = Icons.profileUser || Icons.user;
  document.getElementById('icon-vet').innerHTML = Icons.profileVet || Icons.stethoscope;
}