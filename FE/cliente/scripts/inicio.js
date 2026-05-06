// 1. FUNCIONES (definidas al principio para que no den error)
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

const crearTarjetaMascota = function(m) {
  let card = crearEl('div', { className: 'pet-card' });

  let avatarDiv = crearEl('div', { className: 'pet-avatar' });
  let petIcons     = { dog: Icons.dog, cat: Icons.cat, rabbit: Icons.rabbit };
  ponerIcono(avatarDiv, petIcons[m.type] || Icons.paw);

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

// 2. INICIALIZACIÓN
PetSpot.init('cliente');
buildClienteLayout('inicio');

// Fecha
let dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
let meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
let hoy   = new Date();
let chipFecha = document.getElementById('date-chip');
if (chipFecha) {
  chipFecha.textContent = dias[hoy.getDay()] + ', ' + hoy.getDate() + ' de ' + meses[hoy.getMonth()] + ' ' + hoy.getFullYear();
}

// Iconos rápidos
ponerIcono(document.getElementById('qi-citas'),  Icons.calendar);
ponerIcono(document.getElementById('qi-chat'),   Icons.chat);
ponerIcono(document.getElementById('qi-mapa'),   Icons.map);
ponerIcono(document.getElementById('qi-tienda'), Icons.shop);
ponerIcono(document.getElementById('icon-cal'),  Icons.calendar);
ponerIcono(document.getElementById('icon-paw'),  Icons.paw);

// 3. CARGAR CITAS
let citasList = document.getElementById('citas-list');
let todasLasCitas = Almacen.cargar('citas');
let proximas = [];
for (let i = 0; i < todasLasCitas.length; i++) {
  if (todasLasCitas[i].estado !== 'completada' && todasLasCitas[i].estado !== 'cancelada') {
    proximas.push(todasLasCitas[i]);
  }
}
proximas = proximas.slice(0, 3); 

if (proximas.length === 0) {
  let msgVacio = crearEl('p', {
    textContent: 'No tienes citas próximas',
    style: { textAlign: 'center', color: 'var(--text3)', padding: '20px', fontSize: '13px' }
  });
  citasList.appendChild(msgVacio);
} else {
  for (let i = 0; i < proximas.length; i++) {
    citasList.appendChild(crearTarjetaCita(proximas[i]));
  }
}

// 4. CARGAR MASCOTAS
let mascotasList = document.getElementById('mascotas-list');
let misMascotas  = Almacen.cargar('mascotas');

if (misMascotas.length === 0) {
  let msgVacioM = crearEl('p', {
    textContent: 'Aún no has añadido mascotas',
    style: { textAlign: 'center', color: 'var(--text3)', padding: '16px', fontSize: '13px', gridColumn: '1 / -1' }
  });
  mascotasList.appendChild(msgVacioM);
} else {
  for (let i = 0; i < misMascotas.length; i++) {
    mascotasList.appendChild(crearTarjetaMascota(misMascotas[i]));
  }
}
