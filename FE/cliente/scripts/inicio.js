let mascotasList = document.getElementById('mascotas-list');
let citasList = document.getElementById('citas-list');
let chipFecha = document.getElementById('date-chip');

let email = sessionStorage.getItem('user_email');
let misMascotas =[];
let todasLasCitas = [];
let dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
let meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
let hoy   = new Date();
if (chipFecha) {
  chipFecha.textContent = dias[hoy.getDay()] + ', ' + hoy.getDate() + ' de ' + meses[hoy.getMonth()] + ' ' + hoy.getFullYear();
}

PetSpot.init('cliente');
buildClienteLayout('inicio');

ponerIcono(document.getElementById('qi-citas'),  Icons.calendar);
ponerIcono(document.getElementById('qi-chat'),   Icons.chat);
ponerIcono(document.getElementById('qi-mapa'),   Icons.map);
ponerIcono(document.getElementById('qi-tienda'), Icons.shop);
ponerIcono(document.getElementById('icon-cal'),  Icons.calendar);
ponerIcono(document.getElementById('icon-paw'),  Icons.paw);

// FUNCIONES 
const crearTarjetaCita = function(c) {
  let card = crearEl('div', { className: 'cita-card' });

  let timeDiv = crearEl('div', { className: 'cita-time' });
  let hourDiv = crearEl('div', { className: 'hour', textContent: c.hora });
  let dateDiv = crearEl('div', { className: 'date', textContent: c.fecha });
  timeDiv.appendChild(hourDiv);
  timeDiv.appendChild(dateDiv);

  let divider = crearEl('div', { className: 'cita-divider' });

  let infoDiv   = crearEl('div', { className: 'cita-info' });
  let titleDiv  = crearEl('div', { className: 'cita-title', textContent: c.motivo });
  let subDiv    = crearEl('div', { className: 'cita-sub' });
  let pawSpan   = document.createElement('span');
  ponerIcono(pawSpan, Icons.paw);
  subDiv.appendChild(pawSpan);
  subDiv.appendChild(document.createTextNode(' ' + c.mascota + ' · ' + c.veterinario));
  infoDiv.appendChild(titleDiv);
  infoDiv.appendChild(subDiv);

  let badge = crearEl('span', {
    className: 'badge ' + (c.estado === 'confirmada' ? 'badge-green' : 'badge-orange'),
    textContent: c.estado
  });

  card.appendChild(timeDiv);
  card.appendChild(divider);
  card.appendChild(infoDiv);
  card.appendChild(badge);
  return card;
};

async function cargarMascotasInicio() {
  try {
    let email = sessionStorage.getItem('user_email');

    let response = await fetch(`https://132.226.61.215:8081/api/mascotas/mis-mascotas`, {
      headers: { 'x-user-email': email }
    });

    if (!response.ok) throw new Error('Error cargando mascotas');
    misMascotas = await response.json();
    renderMascotasInicio();
  } catch (err) {
    console.error(err);
  }
}

async function cargarCitasInicio() {
  try {
    let response = await fetch(`https://132.226.61.215:8081/api/citas/mis-citas`, {
      headers: { 'x-user-email': email }
    });
    if (!response.ok) throw new Error('Error cargando citas');

    todasLasCitas = await response.json();
    renderCitasInicio();
  } catch (err) {
    console.error(err);
  }
}

function renderCitasInicio() {
  citasList.innerHTML = '';

  let proximas = todasLasCitas
    .filter(c => c.estado !== 'completada' && c.estado !== 'cancelada')
    .slice(0, 3);

  if (proximas.length === 0) {
    citasList.innerHTML = `<p style="text-align:center;color:var(--text3)">No tienes citas próximas</p>`;
    return;
  }

  proximas.forEach(c => {
    citasList.appendChild(crearTarjetaCita(c));
  });
}

function renderMascotasInicio() {
  mascotasList.innerHTML = '';

  if (misMascotas.length === 0) {
    mascotasList.innerHTML = `<p style="text-align:center;color:var(--text3)">Aún no has añadido mascotas</p>`;
    return;
  }

  misMascotas.forEach(m => {
    mascotasList.appendChild(crearTarjetaMascota(m));
  });
}

const crearTarjetaMascota = function(m) {
  let card = crearEl('div', { className: 'pet-card' });

  let avatarDiv = crearEl('div', { className: 'pet-avatar' });
  let petIcons     = { dog: Icons.dog, cat: Icons.cat, rabbit: Icons.rabbit };
  ponerIcono(avatarDiv, petIcons[m.type] ?? Icons.paw);

  let infoDiv  = document.createElement('div');
  let nameDiv  = crearEl('div', { className: 'pet-name',   textContent: m.nombre });
  let razaDiv  = crearEl('div', { className: 'pet-detail', textContent: m.raza   });
  let fechaDiv = crearEl('div', { className: 'pet-detail', textContent: m.nacimiento });
  infoDiv.appendChild(nameDiv);
  infoDiv.appendChild(razaDiv);
  infoDiv.appendChild(fechaDiv);

  card.appendChild(avatarDiv);
  card.appendChild(infoDiv);
  return card;
};

cargarCitasInicio();
cargarMascotasInicio();
