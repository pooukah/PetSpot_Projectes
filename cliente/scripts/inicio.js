// PetSpot — Inicio del cliente
// Estado inicial vacío — las citas y mascotas vienen de localStorage/Firestore

PetSpot.init('cliente');
buildClienteLayout('inicio');

// Cargar datos desde Firestore al iniciar
PetSpot.loadUserFromFirestore(function() {
  renderInicio();
});

// ── Fecha actual ──
var dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
var meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var hoy   = new Date();
var chipFecha = document.getElementById('date-chip');
if (chipFecha) {
  chipFecha.textContent = dias[hoy.getDay()] + ', ' + hoy.getDate() + ' de ' + meses[hoy.getMonth()] + ' ' + hoy.getFullYear();
}

// ── Iconos de acciones rápidas ──
ponerIcono(document.getElementById('qi-citas'),  Icons.calendar);
ponerIcono(document.getElementById('qi-chat'),   Icons.chat);
ponerIcono(document.getElementById('qi-mapa'),   Icons.map);
ponerIcono(document.getElementById('qi-tienda'), Icons.shop);
ponerIcono(document.getElementById('icon-cal'),  Icons.calendar);
ponerIcono(document.getElementById('icon-paw'),  Icons.paw);

// ── Render principal (se llama tras cargar Firestore) ──
function renderInicio() {
  renderCitasInicio();
  renderMascotasInicio();
}

// ── Próximas citas (desde localStorage/Firestore) ──
function renderCitasInicio() {
  var citasList = document.getElementById('citas-list');
  while (citasList.firstChild) citasList.removeChild(citasList.firstChild);

  var todasLasCitas = Almacen.cargar('citas');
  var proximas = [];
  for (var i = 0; i < todasLasCitas.length; i++) {
    if (todasLasCitas[i].estado !== 'completada' && todasLasCitas[i].estado !== 'cancelada') {
      proximas.push(todasLasCitas[i]);
    }
  }
  proximas = proximas.slice(0, 3);

  if (proximas.length === 0) {
    citasList.appendChild(crearEl('p', {
      textContent: 'No tienes citas próximas',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '20px', fontSize: '13px' }
    }));
  } else {
    for (var i = 0; i < proximas.length; i++) {
      citasList.appendChild(crearTarjetaCita(proximas[i]));
    }
  }
}

// ── Función para crear una tarjeta de cita ──
function crearTarjetaCita(c) {
  var card = crearEl('div', { className: 'cita-card' });

  // Hora y fecha
  var timeDiv = crearEl('div', { className: 'cita-time' });
  var hourDiv = crearEl('div', { className: 'hour', textContent: c.hora });
  var dateDiv = crearEl('div', { className: 'date', textContent: c.fecha });
  timeDiv.appendChild(hourDiv);
  timeDiv.appendChild(dateDiv);

  // Separador vertical
  var divider = crearEl('div', { className: 'cita-divider' });

  // Información
  var infoDiv   = crearEl('div', { className: 'cita-info' });
  var titleDiv  = crearEl('div', { className: 'cita-title', textContent: c.motivo });
  var subDiv    = crearEl('div', { className: 'cita-sub' });
  var pawSpan   = document.createElement('span');
  ponerIcono(pawSpan, Icons.paw);
  subDiv.appendChild(pawSpan);
  subDiv.appendChild(document.createTextNode(' ' + c.mascota + ' · ' + c.veterinario));
  infoDiv.appendChild(titleDiv);
  infoDiv.appendChild(subDiv);

  // Badge de estado
  var badge = crearEl('span', {
    className: 'badge ' + (c.estado === 'confirmada' ? 'badge-green' : 'badge-orange'),
    textContent: c.estado
  });

  card.appendChild(timeDiv);
  card.appendChild(divider);
  card.appendChild(infoDiv);
  card.appendChild(badge);
  return card;
}

// ── Mascotas (desde localStorage/Firestore) ──
var petIcons = { dog: Icons.dog, cat: Icons.cat, rabbit: Icons.rabbit };

function renderMascotasInicio() {
  var mascotasList = document.getElementById('mascotas-list');
  while (mascotasList.firstChild) mascotasList.removeChild(mascotasList.firstChild);

  var misMascotas = Almacen.cargar('mascotas');

  if (misMascotas.length === 0) {
    mascotasList.appendChild(crearEl('p', {
      textContent: 'Aún no has añadido mascotas',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '16px', fontSize: '13px', gridColumn: '1 / -1' }
    }));
  } else {
    for (var i = 0; i < misMascotas.length; i++) {
      mascotasList.appendChild(crearTarjetaMascota(misMascotas[i]));
    }
  }
}

// Render inicial con datos locales (Firestore callback los actualizará)
renderInicio();

// ── Función para crear una tarjeta de mascota ──
function crearTarjetaMascota(m) {
  var card = crearEl('div', { className: 'pet-card' });

  var avatarDiv = crearEl('div', { className: 'pet-avatar' });
  ponerIcono(avatarDiv, petIcons[m.type] || Icons.paw);

  var infoDiv  = document.createElement('div');
  var nameDiv  = crearEl('div', { className: 'pet-name',   textContent: m.nombre });
  var razaDiv  = crearEl('div', { className: 'pet-detail', textContent: m.raza   });
  var fechaDiv = crearEl('div', { className: 'pet-detail', textContent: '🎂 ' + m.nacimiento });
  infoDiv.appendChild(nameDiv);
  infoDiv.appendChild(razaDiv);
  infoDiv.appendChild(fechaDiv);

  card.appendChild(avatarDiv);
  card.appendChild(infoDiv);
  return card;
}
