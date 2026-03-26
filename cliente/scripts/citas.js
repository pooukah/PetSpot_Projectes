// PetSpot — Citas del cliente
// Las citas se guardan en localStorage — persisten entre recargas

PetSpot.init('cliente');
buildClienteLayout('citas');

// ── Poner iconos ──
ponerIcono(document.getElementById('btn-nueva-icon'), Icons.plus);
ponerIcono(document.getElementById('icon-x'),         Icons.x);
ponerIcono(document.getElementById('icon-cal2'),      Icons.calendar);

// ── Cargar las citas guardadas ──
var listaCitas = Almacen.cargar('citas');

// ── Botón de nueva cita ──
document.getElementById('btn-nueva').addEventListener('click', function() {
  document.getElementById('modal-cita').classList.add('open');
});

// ============================================================
// TABS — cambiar entre Próximas, Historial y Calendario
// ============================================================
function switchTab(tab, el) {
  // Ocultar todos los paneles
  document.getElementById('tab-proximas').style.display   = 'none';
  document.getElementById('tab-historial').style.display  = 'none';
  document.getElementById('tab-calendario').style.display = 'none';
  // Mostrar el panel clicado
  document.getElementById('tab-' + tab).style.display = '';
  // Resaltar el tab activo
  var botones = document.querySelectorAll('.tab');
  for (var i = 0; i < botones.length; i++) {
    botones[i].classList.remove('active');
  }
  el.classList.add('active');
  // El calendario necesita renderizarse al abrirse
  if (tab === 'calendario') renderCalendario();
}

// ============================================================
// PRÓXIMAS CITAS
// ============================================================
function renderProximas() {
  var lista = document.getElementById('list-proximas');
  // Vaciar la lista antes de rellenarla
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  // Filtrar solo las que NO están completadas ni canceladas
  var proximas = [];
  for (var i = 0; i < listaCitas.length; i++) {
    if (listaCitas[i].estado !== 'completada' && listaCitas[i].estado !== 'cancelada') {
      proximas.push(listaCitas[i]);
    }
  }

  if (proximas.length === 0) {
    lista.appendChild(crearEl('p', {
      textContent: 'No tienes citas próximas',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '24px', fontSize: '13px' }
    }));
    return;
  }

  for (var i = 0; i < proximas.length; i++) {
    lista.appendChild(crearCardProxima(proximas[i]));
  }
}

// Crea el div de una cita próxima con su botón de cancelar
function crearCardProxima(c) {
  var card = crearEl('div', { className: 'cita-card' });
  card.dataset.id = c.id;

  // Hora y fecha
  var timeDiv = crearEl('div', { className: 'cita-time' });
  timeDiv.appendChild(crearEl('div', { className: 'hour', textContent: c.hora }));
  timeDiv.appendChild(crearEl('div', { className: 'date', textContent: c.fecha }));

  var divider = crearEl('div', { className: 'cita-divider' });

  // Info
  var infoDiv = crearEl('div', { className: 'cita-info' });
  infoDiv.appendChild(crearEl('div', { className: 'cita-title', textContent: c.motivo }));
  var sub = crearEl('div', { className: 'cita-sub' });
  var pawSpan = document.createElement('span');
  ponerIcono(pawSpan, Icons.paw);
  sub.appendChild(pawSpan);
  sub.appendChild(document.createTextNode(' ' + c.mascota + ' · ' + c.veterinario));
  infoDiv.appendChild(sub);

  // Acciones
  var acciones = crearEl('div', { className: 'cita-actions' });
  var badge = crearEl('span', {
    className: 'badge ' + (c.estado === 'confirmada' ? 'badge-green' : 'badge-orange'),
    textContent: c.estado
  });

  // Botón cancelar — al clicar quita el div y guarda el cambio
  var btnCancelar = crearEl('button', { className: 'btn btn-danger btn-sm', textContent: 'Cancelar' });
  btnCancelar.addEventListener('click', function() {
    cancelarCita(c.id, card);
  });

  acciones.appendChild(badge);
  acciones.appendChild(btnCancelar);

  card.appendChild(timeDiv);
  card.appendChild(divider);
  card.appendChild(infoDiv);
  card.appendChild(acciones);
  return card;
}

// Cancela una cita: la quita del DOM y del localStorage
function cancelarCita(id, cardEl) {
  // Quitar el div visualmente con animación suave
  cardEl.style.transition = 'opacity 0.3s, transform 0.3s';
  cardEl.style.opacity = '0';
  cardEl.style.transform = 'translateX(20px)';

  // Esperar a que termine la animación y luego quitar del DOM
  setTimeout(function() {
    if (cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
  }, 300);

  // Marcar como cancelada en el array
  for (var i = 0; i < listaCitas.length; i++) {
    if (listaCitas[i].id === id) {
      listaCitas[i].estado = 'cancelada';
      break;
    }
  }
  // Guardar en localStorage para que persista
  Almacen.guardar('citas', listaCitas);
  PetSpot.notify('Cita cancelada');
}

// ============================================================
// HISTORIAL
// ============================================================
function renderHistorial() {
  var lista = document.getElementById('list-historial');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  var completadas = [];
  for (var i = 0; i < listaCitas.length; i++) {
    if (listaCitas[i].estado === 'completada') {
      completadas.push(listaCitas[i]);
    }
  }

  if (completadas.length === 0) {
    lista.appendChild(crearEl('p', {
      textContent: 'No hay citas en el historial aún',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '24px', fontSize: '13px' }
    }));
    return;
  }

  for (var i = 0; i < completadas.length; i++) {
    var c = completadas[i];
    var card = crearEl('div', { className: 'cita-card' });

    var timeDiv = crearEl('div', { className: 'cita-time' });
    timeDiv.appendChild(crearEl('div', { className: 'hour', textContent: c.hora }));
    timeDiv.appendChild(crearEl('div', { className: 'date', textContent: c.fecha }));

    var divider = crearEl('div', { className: 'cita-divider' });

    var infoDiv = crearEl('div', { className: 'cita-info' });
    infoDiv.appendChild(crearEl('div', { className: 'cita-title', textContent: c.motivo }));
    var sub = crearEl('div', { className: 'cita-sub', textContent: c.mascota + ' · ' + c.veterinario + ' · ' + (c.clinica || '') });
    infoDiv.appendChild(sub);

    var badge = crearEl('span', { className: 'badge badge-blue', textContent: 'completada' });

    card.appendChild(timeDiv);
    card.appendChild(divider);
    card.appendChild(infoDiv);
    card.appendChild(badge);
    lista.appendChild(card);
  }
}

renderHistorial();

// ============================================================
// CALENDARIO
// ============================================================
var mesActual  = new Date().getMonth();
var anioActual = new Date().getFullYear();
var diaSeleccionado = null;
var nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function renderCalendario() {
  var tituloEl = document.getElementById('cal-title');
  tituloEl.textContent = nombresMeses[mesActual] + ' ' + anioActual;

  var grid = document.getElementById('cal-grid');
  while (grid.firstChild) grid.removeChild(grid.firstChild);

  var primerDia  = new Date(anioActual, mesActual, 1).getDay();
  var offset     = (primerDia + 6) % 7; // Ajuste para empezar en lunes
  var totalDias  = new Date(anioActual, mesActual + 1, 0).getDate();
  var hoyDia     = new Date().getDate();
  var hoyMes     = new Date().getMonth();
  var hoyAnio    = new Date().getFullYear();

  // Celdas vacías al inicio
  for (var i = 0; i < offset; i++) {
    grid.appendChild(document.createElement('div'));
  }

  // Días del mes
  for (var d = 1; d <= totalDias; d++) {
    var esHoy    = d === hoyDia && mesActual === hoyMes && anioActual === hoyAnio;
    var tienesCita = tieneCitaEnDia(d, mesActual, anioActual);
    var estaSeleccionado = d === diaSeleccionado;

    var diaEl = document.createElement('div');
    diaEl.className = 'cal-day';
    if (esHoy) diaEl.classList.add('today');
    if (tienesCita) diaEl.classList.add('has-cita');
    if (estaSeleccionado) diaEl.classList.add('selected');
    diaEl.textContent = d;

    // Al clicar el día, mostramos sus citas
    diaEl.addEventListener('click', crearHandlerDia(d));
    grid.appendChild(diaEl);
  }

  // Si hay un día seleccionado, mostrar sus citas
  if (diaSeleccionado) {
    mostrarCitasDelDia(diaSeleccionado);
  } else {
    var msgEl = document.getElementById('cal-citas-list');
    while (msgEl.firstChild) msgEl.removeChild(msgEl.firstChild);
    msgEl.appendChild(crearEl('p', {
      textContent: 'Clica un día para ver sus citas',
      style: { color: 'var(--text3)', fontSize: '13px', padding: '12px 0' }
    }));
  }
}

// Función auxiliar para evitar problema de closure en el bucle de días
function crearHandlerDia(dia) {
  return function() {
    diaSeleccionado = dia;
    renderCalendario();
  };
}

// Comprueba si hay alguna cita en ese día del calendario
function tieneCitaEnDia(dia, mes, anio) {
  for (var i = 0; i < listaCitas.length; i++) {
    var c = listaCitas[i];
    if (c.estado === 'cancelada' || c.estado === 'completada') continue;
    // Comparamos la fecha guardada en formato DD/MM
    var fechaCalendario = String(dia).padStart(2, '0') + '/' + String(mes + 1).padStart(2, '0');
    if (c.fechaISO) {
      var partes = c.fechaISO.split('-');
      var diaC = partes[2];
      var mesC = partes[1];
      if (parseInt(diaC) === dia && parseInt(mesC) === mes + 1) return true;
    }
  }
  return false;
}

// Muestra las citas de un día específico en la columna derecha
function mostrarCitasDelDia(dia) {
  var lista = document.getElementById('cal-citas-list');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  var citasDelDia = [];
  for (var i = 0; i < listaCitas.length; i++) {
    var c = listaCitas[i];
    if (c.estado === 'cancelada' || c.estado === 'completada') continue;
    if (c.fechaISO) {
      var partes = c.fechaISO.split('-');
      if (parseInt(partes[2]) === dia && parseInt(partes[1]) === mesActual + 1) {
        citasDelDia.push(c);
      }
    }
  }

  if (citasDelDia.length === 0) {
    lista.appendChild(crearEl('p', {
      textContent: 'No hay citas el día ' + dia,
      style: { color: 'var(--text3)', fontSize: '13px', padding: '12px 0' }
    }));
    return;
  }

  for (var i = 0; i < citasDelDia.length; i++) {
    var c = citasDelDia[i];
    var card = crearEl('div', { className: 'cita-card', style: { marginBottom: '10px' } });

    var tDiv = crearEl('div', { className: 'cita-time' });
    tDiv.appendChild(crearEl('div', { className: 'hour', textContent: c.hora }));
    tDiv.appendChild(crearEl('div', { className: 'date', textContent: 'Día ' + dia }));

    var sep = crearEl('div', { className: 'cita-divider' });

    var iDiv = crearEl('div', { className: 'cita-info' });
    iDiv.appendChild(crearEl('div', { className: 'cita-title', textContent: c.motivo }));
    iDiv.appendChild(crearEl('div', { className: 'cita-sub', textContent: c.mascota }));

    card.appendChild(tDiv);
    card.appendChild(sep);
    card.appendChild(iDiv);
    lista.appendChild(card);
  }
}

function changeMonth(d) {
  mesActual += d;
  if (mesActual > 11) { mesActual = 0;  anioActual++; }
  if (mesActual < 0)  { mesActual = 11; anioActual--; }
  diaSeleccionado = null;
  renderCalendario();
}

// ============================================================
// NUEVA CITA
// ============================================================
function closeModal() {
  var modales = document.querySelectorAll('.modal-overlay');
  for (var i = 0; i < modales.length; i++) {
    modales[i].classList.remove('open');
  }
}

function solicitarCita() {
  var mascota     = document.getElementById('nueva-mascota').value;
  var vetSelect   = document.getElementById('nueva-vet').value;
  var motivo      = document.getElementById('nueva-motivo').value.trim();
  var fechaInput  = document.getElementById('nueva-fecha').value;
  var horaInput   = document.getElementById('nueva-hora').value;

  if (!mascota || !motivo || !fechaInput || !horaInput) {
    PetSpot.notify('Por favor, rellena todos los campos');
    return;
  }

  // Convertir fecha de YYYY-MM-DD a DD/MM
  var partes = fechaInput.split('-');
  var fechaLegible = partes[2] + '/' + partes[1];

  // Crear la nueva cita
  var nueva = {
    id:         Date.now(),
    hora:       horaInput,
    fecha:      fechaLegible,
    fechaISO:   fechaInput, // Guardamos también en formato ISO para el calendario
    veterinario: vetSelect.split(' — ')[0],
    mascota:    mascota.split(' (')[0],
    motivo:     motivo,
    estado:     'pendiente',
    clinica:    vetSelect.split(' — ')[1] || 'PetSpot'
  };

  // Añadir al array y guardar en localStorage
  listaCitas.push(nueva);
  Almacen.guardar('citas', listaCitas);

  closeModal();
  renderProximas();
  renderHistorial();
  PetSpot.notify('✅ Cita solicitada — estado: pendiente');

  // Limpiar formulario
  document.getElementById('nueva-motivo').value = '';
  document.getElementById('nueva-fecha').value  = '';
}

// ── Render inicial ──
renderProximas();
