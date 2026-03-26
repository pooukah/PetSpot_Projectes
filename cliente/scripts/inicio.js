// PetSpot — Inicio del cliente
// Estado inicial vacío — las citas y mascotas vienen de localStorage

PetSpot.init('cliente');
buildClienteLayout('inicio');

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

// ── Próximas citas (desde localStorage) ──
var citasList = document.getElementById('citas-list');

// Cargar citas guardadas del usuario
var todasLasCitas = Almacen.cargar('citas');
// Filtrar solo las que no están completadas o canceladas
var proximas = [];
for (var i = 0; i < todasLasCitas.length; i++) {
  if (todasLasCitas[i].estado !== 'completada' && todasLasCitas[i].estado !== 'cancelada') {
    proximas.push(todasLasCitas[i]);
  }
}
proximas = proximas.slice(0, 3); // Mostrar solo las 3 primeras

if (proximas.length === 0) {
  // Mensaje vacío
  var msgVacio = crearEl('p', {
    className: '',
    textContent: 'No tienes citas próximas',
    style: { textAlign: 'center', color: 'var(--text3)', padding: '20px', fontSize: '13px' }
  });
  citasList.appendChild(msgVacio);
} else {
  // Crear una tarjeta por cada cita
  for (var i = 0; i < proximas.length; i++) {
    var c = proximas[i];
    citasList.appendChild(crearTarjetaCita(c));
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

// ── Mascotas (desde localStorage) ──
var mascotasList = document.getElementById('mascotas-list');
var misMascotas  = Almacen.cargar('mascotas');
var petIcons     = { dog: Icons.dog, cat: Icons.cat, rabbit: Icons.rabbit };

if (misMascotas.length === 0) {
  var msgVacioM = crearEl('p', {
    textContent: 'Aún no has añadido mascotas',
    style: { textAlign: 'center', color: 'var(--text3)', padding: '16px', fontSize: '13px', gridColumn: '1 / -1' }
  });
  mascotasList.appendChild(msgVacioM);
} else {
  for (var i = 0; i < misMascotas.length; i++) {
    var m = misMascotas[i];
    mascotasList.appendChild(crearTarjetaMascota(m));
  }
}

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
