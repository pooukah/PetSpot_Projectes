PetSpot.init('cliente');
buildClienteLayout('perfil');

const btnCambiarPassword = document.getElementById('btn-cambiar-password');

ponerIcono(document.getElementById('icon-edit-av'),  Icons.edit);
ponerIcono(document.getElementById('icon-check-sm'), Icons.check);
ponerIcono(document.getElementById('icon-plus-pet'), Icons.plus);
ponerIcono(document.getElementById('icon-x-pet'),    Icons.x);
ponerIcono(document.getElementById('icon-paw-modal'), Icons.paw);

let user = PetSpot.getUser();
let listaMascotas = [];
let petIcons = { dog: Icons.dog, cat: Icons.cat, rabbit: Icons.rabbit };


const cargarPerfil = async function() {
  if (!user || !user.email) return;
  try {
    const resp = await fetch(`https://132.226.61.215:8081/auth/perfil/cliente/${user.email}`);
    const data = await resp.json();
    
    document.getElementById('input-nombre').value = data.nombre || '';
    document.getElementById('input-apellidos').value = data.apellidos || '';
    document.getElementById('input-tel').value = data.telefono || '';
    document.getElementById('input-cp').value = data.codigo_postal || '';
    document.getElementById('input-dir').value = data.direccion || '';

    const nombreCompleto = (data.nombre + ' ' + (data.apellidos || '')).trim();
    document.getElementById('profile-name').textContent = nombreCompleto || 'Sin nombre';
    document.getElementById('profile-av').textContent = (data.nombre || '?').charAt(0).toUpperCase();

    const select = document.getElementById('input-clinica');
    if (select && data.nombre_clinica) select.value = data.nombre_clinica;
  } catch (e) { console.error("Error perfil:", e); }
};

const cargarClinicas = async function() {
  const API_URL = "https://132.226.61.215:8081/clinicas/registro";
  try {
    const resp = await fetch(API_URL);
    const clinicas = await resp.json();
    const select = document.getElementById('input-clinica');
    if (!select) return;
    clinicas.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.nombre;
      opt.textContent = c.nombre;
      select.appendChild(opt);
    });
    cargarPerfil();
  } catch (e) { console.error("Error clinicas:", e); }
};
cargarClinicas();

const cargarMascotas = async function() {
  const email = sessionStorage.getItem('user_email');
  if (!email) return;
  
  try {
    const response = await fetch(`https://132.226.61.215:8081/api/mascotas/mis-mascotas`, {
      headers: { "x-user-email": email }
    });
    
    if (!response.ok) throw new Error('Error al cargar mascotas');
    
    listaMascotas = await response.json();
    renderMascotas();
  } catch (error) {
    console.error('Error:', error);
    listaMascotas = [];
    renderMascotas();
  }
};

if (user) {
  document.getElementById('profile-name').textContent  = user.nombre || '';
  document.getElementById('profile-email').textContent = user.email  || '';
}

document.getElementById('input-nombre').addEventListener('input', function() {
  document.getElementById('profile-name').textContent = this.value || 'Sin nombre';
});

const guardarDatos = async function() {
  let nombre = document.getElementById('input-nombre').value.trim();
  let apellidos = document.getElementById('input-apellidos').value.trim();
  let tel = document.getElementById('input-tel').value.trim();
  let dir = document.getElementById('input-dir').value.trim();
  let cp = document.getElementById('input-cp').value.trim();

  if (!nombre) {
    PetSpot.notify('El nombre no puede estar vacío');
    return;
  }

  const email = sessionStorage.getItem('user_email');
  
  try{
    const response = await fetch(`https://132.226.61.215:8081/auth/perfil/cliente/${email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombre,
        apellidos: apellidos,
        telefono: tel,
        direccion: dir,
        codigo_postal: cp
      })
    });

    if(!response.ok) throw new Error('ERROR');

    let u = PetSpot.getUser();
    u.nombre = nombre;
    u.apellidos = apellidos;
    u.telefono = tel;
    u.direccion = dir;
    u.cp = cp;
    PetSpot.setUser(u);

    PetSpot.setTopbar();
    
    const nombreCompleto = (nombre + ' ' + apellidos).trim();
    document.getElementById('profile-name').textContent = nombreCompleto || 'Sin nombre';
    document.getElementById('profile-av').textContent = (nombre || '?').charAt(0).toUpperCase();

    PetSpot.notify('Datos guardados correctamente');
    cargarPerfil();
  }catch(error){
    console.log(error);
  }
};

const showSection = function(sec, el) {
  document.getElementById('sec-datos').style.display    = sec === 'datos'    ? '' : 'none';
  document.getElementById('sec-mascotas').style.display = sec === 'mascotas' ? '' : 'none';
  document.getElementById('sec-config').style.display   = sec === 'config'   ? '' : 'none';
  let tabs = document.querySelectorAll('.tab');
  for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  el.classList.add('active');
};

const obtenerType = function(especie) {
  if (especie === 'Perro') return 'dog';
  if (especie === 'Gato')  return 'cat';
  return 'rabbit';
};

const renderMascotas = function() {
  let lista = document.getElementById('mascotas-list');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  let contador = document.getElementById('contador-mascotas');
  if (contador) contador.textContent = '(' + listaMascotas.length + ')';

  if (listaMascotas.length === 0) {
    lista.appendChild(crearEl('p', {
      textContent: 'Aún no has añadido ninguna mascota',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '24px', fontSize: '13px' }
    }));
    return;
  }

  for (let i = 0; i < listaMascotas.length; i++) {
    lista.appendChild(crearCardMascota(listaMascotas[i]));
  }
};

const crearCardMascota = function(m) {
  let card = crearEl('div', { className: 'mascota-card' });
  card.dataset.id = m.id;

  let top = crearEl('div', { className: 'mascota-card-top' });

  let iconDiv = crearEl('div', { className: 'mascota-icon' });
  ponerIcono(iconDiv, petIcons[m.type] || Icons.paw);

  let infoDiv = document.createElement('div');
  infoDiv.style.flex = '1';
  infoDiv.appendChild(crearEl('div', { className: 'mascota-name', textContent: m.nombre }));
  infoDiv.appendChild(crearEl('div', { className: 'mascota-breed', textContent: m.especie + ' · ' + m.raza }));

  let btnEliminar = crearEl('button', { className: 'btn btn-danger btn-sm', textContent: 'Eliminar' });
  btnEliminar.addEventListener('click', crearHandlerEliminar(m.id));

  top.appendChild(iconDiv);
  top.appendChild(infoDiv);
  top.appendChild(btnEliminar);

  let grid = crearEl('div', { className: 'grid-2', style: { gap: '12px' } });

  let nombreBloq = document.createElement('div');
  nombreBloq.className = 'form-group';
  let nombreLabel = crearEl('label', { className: 'form-label', textContent: 'Nombre' });
  let nombreInput = crearEl('input', { className: 'form-input', type: 'text' });
  nombreInput.value = m.nombre;
  nombreInput.id = `nombre-${m.id}`;
  nombreBloq.appendChild(nombreLabel);
  nombreBloq.appendChild(nombreInput);

  let especieBloq = document.createElement('div');
  especieBloq.className = 'form-group';
  let especieLabel = crearEl('label', { className: 'form-label', textContent: 'Especie' });
  let especieSelect = crearEl('select', { className: 'form-input', id: `especie-${m.id}` });
  let opciones = ['Perro', 'Gato', 'Conejo', 'Hámster', 'Otro'];
  for (let opt of opciones) {
    let option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    if (opt === m.especie) option.selected = true;
    especieSelect.appendChild(option);
  }
  especieBloq.appendChild(especieLabel);
  especieBloq.appendChild(especieSelect);

  let razaBloq = document.createElement('div');
  razaBloq.className = 'form-group';
  let razaLabel = crearEl('label', { className: 'form-label', textContent: 'Raza' });
  let razaInput = crearEl('input', { className: 'form-input', type: 'text' });
  razaInput.value = m.raza;
  razaInput.id = `raza-${m.id}`;
  razaBloq.appendChild(razaLabel);
  razaBloq.appendChild(razaInput);

  let pesoBloq = document.createElement('div');
  pesoBloq.className = 'form-group';
  let pesoLabel = crearEl('label', { className: 'form-label', textContent: 'Peso (kg)' });
  let pesoInput = crearEl('input', { className: 'form-input', type: 'text' });
  pesoInput.value = m.peso;
  pesoInput.id = `peso-${m.id}`;
  pesoBloq.appendChild(pesoLabel);
  pesoBloq.appendChild(pesoInput);

  let fechaBloq = document.createElement('div');
  fechaBloq.className = 'form-group';
  let fechaLabel = crearEl('label', { className: 'form-label', textContent: 'Fecha de nacimiento' });
  let fechaInput = crearEl('input', { className: 'form-input', type: 'date', id: `fecha-${m.id}` });
  if (m.nacimiento) {
    let partes = m.nacimiento.split('/');
    if (partes.length === 3) {
      fechaInput.value = `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
  }
  fechaBloq.appendChild(fechaLabel);
  fechaBloq.appendChild(fechaInput);

  let chipBloq = document.createElement('div');
  chipBloq.className = 'form-group';
  chipBloq.style.gridColumn = '1 / -1';
  let chipLabel = crearEl('label', { className: 'form-label', textContent: 'Nº Microchip' });
  let chipInput = crearEl('input', { className: 'form-input', type: 'text' });
  chipInput.value = m.microchip || '';
  chipInput.id = `microchip-${m.id}`;
  chipBloq.appendChild(chipLabel);
  chipBloq.appendChild(chipInput);

  grid.appendChild(nombreBloq);
  grid.appendChild(especieBloq);
  grid.appendChild(razaBloq);
  grid.appendChild(pesoBloq);
  grid.appendChild(fechaBloq);
  grid.appendChild(chipBloq);

  let btnGuardar = crearEl('button', { className: 'btn btn-primary btn-sm', textContent: 'Guardar cambios' });
  btnGuardar.style.marginTop = '8px';
  btnGuardar.addEventListener('click', crearHandlerGuardarMascota(m.id));

  card.appendChild(top);
  card.appendChild(grid);
  card.appendChild(btnGuardar);
  return card;
};

const crearHandlerEliminar = function(id) {
  return function() {
    if (!confirm('¿Seguro que quieres eliminar esta mascota? También se borrarán sus citas.')) return;
    eliminarMascota(id);
  };
};

const crearHandlerGuardarMascota = function(id) {
  return async function() {
    let nombre = document.getElementById(`nombre-${id}`)?.value;
    let especie = document.getElementById(`especie-${id}`)?.value;
    let raza = document.getElementById(`raza-${id}`)?.value;
    let peso = parseFloat(document.getElementById(`peso-${id}`)?.value);
    let fechaInput = document.getElementById(`fecha-${id}`)?.value;
    let microchip = document.getElementById(`microchip-${id}`)?.value;
    
    let fechaNacimiento = fechaInput || null;

    const email = sessionStorage.getItem('user_email');
    
    try {
      const response = await fetch(`https://132.226.61.215:8081/api/mascotas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email
        },
        body: JSON.stringify({ 
          nombre: nombre,
          especie: especie,
          raza: raza,
          peso: peso,
          fecha_nacimiento: fechaNacimiento,
          microchip: microchip
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al actualizar');
      }
      
      PetSpot.notify('Datos actualizados correctamente');
      cargarMascotas();
    } catch (error) {
      console.error('Error:', error);
      PetSpot.notify('Error al actualizar: ' + error.message);
    }
  };
};

const eliminarMascota = async function(id) {
  const email = sessionStorage.getItem('user_email');
  
  try {
    const response = await fetch(`https://132.226.61.215:8081/api/mascotas/${id}`, {
      method: "DELETE",
      headers: { "x-user-email": email }
    });

    if (!response.ok) throw new Error('Error al eliminar');

    PetSpot.notify('Mascota eliminada');
    cargarMascotas();
  } catch (error) {
    console.error('Error:', error);
    PetSpot.notify('Error al eliminar la mascota');
  }
};

document.getElementById('btn-add-pet').addEventListener('click', function() {
  document.getElementById('modal-pet').classList.add('open');
});

const addPet = async function() {
  let nombre = document.getElementById('nueva-nombre').value.trim();
  let especie = document.getElementById('nueva-especie').value;
  let raza = document.getElementById('nueva-raza').value.trim();
  let peso = parseFloat(document.getElementById('nueva-peso').value);
  let fecha = document.getElementById('nueva-fecha').value;
  let microchip = document.getElementById('nueva-microchip').value.trim();

  if (!nombre || !raza || !peso || !fecha) {
    PetSpot.notify('Rellena al menos nombre, raza, peso y fecha');
    return;
  }

  const email = sessionStorage.getItem('user_email');
  
  try {
    const response = await fetch(`https://132.226.61.215:8081/api/mascotas/crear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email
      },
      body: JSON.stringify({
        nombre: nombre,
        especie: especie,
        raza: raza,
        peso: peso,
        fecha_nacimiento: fecha,
        microchip: microchip
      })
    });

    if (!response.ok) throw new Error('Error al crear mascota');

    PetSpot.notify('Mascota añadida correctamente');
    closeModal();
    cargarMascotas();

    document.getElementById('nueva-nombre').value = '';
    document.getElementById('nueva-raza').value = '';
    document.getElementById('nueva-peso').value = '';
    document.getElementById('nueva-fecha').value = '';
    document.getElementById('nueva-microchip').value = '';

  } catch (error) {
    console.error('Error:', error);
    PetSpot.notify('Error al añadir la mascota');
  }
};

const closeModal = function() {
  let modales = document.querySelectorAll('.modal-overlay');
  for (let i = 0; i < modales.length; i++) modales[i].classList.remove('open');
};

let notifCfg = [
  ['Recordatorio de citas', '24h antes de cada cita', true],
  ['Mensajes nuevos',       'Cuando recibas un mensaje', true],
  ['Ofertas',               'Novedades y descuentos',    false],
  ['Email marketing',       'Boletín mensual',           false]
];
let notifLista = document.getElementById('notif-list');
for (let i = 0; i < notifCfg.length; i++) {
  let row = crearEl('div', { className: 'notif-row' });
  let textDiv = document.createElement('div');
  textDiv.appendChild(crearEl('div', { style: { fontSize: '14px', fontWeight: '600' }, textContent: notifCfg[i][0] }));
  textDiv.appendChild(crearEl('div', { style: { fontSize: '12px', color: 'var(--text2)' }, textContent: notifCfg[i][1] }));
  let toggle = crearEl('div', { className: 'toggle' + (notifCfg[i][2] ? ' on' : '') });
  toggle.addEventListener('click', function() { this.classList.toggle('on'); });
  row.appendChild(textDiv);
  row.appendChild(toggle);
  notifLista.appendChild(row);
}

const cambiarPassword = async function() {
  let passActual = document.getElementById('pass-actual')?.value;
  let passNueva = document.getElementById('pass-nueva')?.value;
  let passConfirmar = document.getElementById('pass-confirmar')?.value;

  if (!passActual || !passNueva || !passConfirmar) {
    PetSpot.notify('Rellena todos los campos de contraseña');
    return;
  }

  if (passNueva !== passConfirmar) {
    PetSpot.notify('Las contraseñas nuevas no coinciden');
    return;
  }

  if (passNueva.length < 6) {
    PetSpot.notify('La nueva contraseña debe tener al menos 6 caracteres');
    return;
  }

  const email = sessionStorage.getItem('user_email');
  
  try {
    const response = await fetch(`https://132.226.61.215:8081/auth/cambiar-password/${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email
      },
      body: JSON.stringify({
        password_actual: passActual,
        password_nueva: passNueva
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al cambiar contraseña');
    }

    PetSpot.notify('Contraseña actualizada correctamente');
    
    document.getElementById('pass-actual').value = '';
    document.getElementById('pass-nueva').value = '';
    document.getElementById('pass-confirmar').value = '';
    
  } catch (error) {
    console.error('Error:', error);
    PetSpot.notify(error.message);
  }
};

if (btnCambiarPassword) {
  btnCambiarPassword.addEventListener('click', cambiarPassword);
}

cargarMascotas();