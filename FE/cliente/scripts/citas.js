PetSpot.init('cliente');
buildClienteLayout('citas');

ponerIcono(document.getElementById('btn-nueva-icon'), Icons.plus);
ponerIcono(document.getElementById('icon-x'),         Icons.x);
ponerIcono(document.getElementById('icon-cal2'),      Icons.calendar);

let listaCitas = Almacen.cargar('citas');

document.getElementById('btn-nueva').addEventListener('click', function() {
  document.getElementById('modal-cita').classList.add('open');
});

const switchTab = function(tab, el) {
  document.getElementById('tab-proximas').style.display   = 'none';
  document.getElementById('tab-historial').style.display  = 'none';
  document.getElementById('tab-calendario').style.display = 'none';
  document.getElementById('tab-' + tab).style.display = '';
  let botones = document.querySelectorAll('.tab');
  for (let i = 0; i < botones.length; i++) {
    botones[i].classList.remove('active');
  }
  el.classList.add('active');
  if (tab === 'calendario') renderCalendario();
};

 const renderProximas = function() {
  let lista = document.getElementById('list-proximas');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  let proximas = [];
  for (let i = 0; i < listaCitas.length; i++) {
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

  for (let i = 0; i < proximas.length; i++) {
    lista.appendChild(crearCardProxima(proximas[i]));
  }
};

const crearCardProxima = function(c) {
  let card = crearEl('div', { className: 'cita-card' });
  card.dataset.id = c.id;

  let timeDiv = crearEl('div', { className: 'cita-time' });
  timeDiv.appendChild(crearEl('div', { className: 'hour', textContent: c.hora }));
  timeDiv.appendChild(crearEl('div', { className: 'date', textContent: c.fecha }));

  let divider = crearEl('div', { className: 'cita-divider' });

  let infoDiv = crearEl('div', { className: 'cita-info' });
  infoDiv.appendChild(crearEl('div', { className: 'cita-title', textContent: c.motivo }));
  let sub = crearEl('div', { className: 'cita-sub' });
  let pawSpan = document.createElement('span');
  ponerIcono(pawSpan, Icons.paw);
  sub.appendChild(pawSpan);
  sub.appendChild(document.createTextNode(' ' + c.mascota + ' · ' + c.veterinario));
  infoDiv.appendChild(sub);

  let acciones = crearEl('div', { className: 'cita-actions' });
  let badge = crearEl('span', {
    className: 'badge ' + (c.estado === 'confirmada' ? 'badge-green' : 'badge-orange'),
    textContent: c.estado
  });

  let btnCancelar = crearEl('button', { className: 'btn btn-danger btn-sm', textContent: 'Cancelar' });
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
};

const cancelarCita = function(id, cardEl) {
  cardEl.style.transition = 'opacity 0.3s, transform 0.3s';
  cardEl.style.opacity = '0';
  cardEl.style.transform = 'translateX(20px)';

  setTimeout(function() {
    if (cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
  }, 300);

  for (let i = 0; i < listaCitas.length; i++) {
    if (listaCitas[i].id === id) {
      listaCitas[i].estado = 'cancelada';
      break;
    }
  }
  Almacen.guardar('citas', listaCitas);
  PetSpot.notify('Cita cancelada');
};

const renderHistorial = function() {
  let lista = document.getElementById('list-historial');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  let completadas = [];
  for (let i = 0; i < listaCitas.length; i++) {
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

  for (let i = 0; i < completadas.length; i++) {
    let c = completadas[i];
    let card = crearEl('div', { className: 'cita-card' });

    let timeDiv = crearEl('div', { className: 'cita-time' });
    timeDiv.appendChild(crearEl('div', { className: 'hour', textContent: c.hora }));
    timeDiv.appendChild(crearEl('div', { className: 'date', textContent: c.fecha }));

    let divider = crearEl('div', { className: 'cita-divider' });

    let infoDiv = crearEl('div', { className: 'cita-info' });
    infoDiv.appendChild(crearEl('div', { className: 'cita-title', textContent: c.motivo }));
    let sub = crearEl('div', { className: 'cita-sub', textContent: c.mascota + ' · ' + c.veterinario + ' · ' + (c.clinica || '') });
    infoDiv.appendChild(sub);

    let badge = crearEl('span', { className: 'badge badge-blue', textContent: 'completada' });

    card.appendChild(timeDiv);
    card.appendChild(divider);
    card.appendChild(infoDiv);
    card.appendChild(badge);
    lista.appendChild(card);
  }
};

renderHistorial();

let mesActual  = new Date().getMonth();
let anioActual = new Date().getFullYear();
let diaSeleccionado = null;
let nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const renderCalendario = function() {
  let tituloEl = document.getElementById('cal-title');
  tituloEl.textContent = nombresMeses[mesActual] + ' ' + anioActual;

  let grid = document.getElementById('cal-grid');
  while (grid.firstChild) grid.removeChild(grid.firstChild);

  let primerDia  = new Date(anioActual, mesActual, 1).getDay();
  let offset     = (primerDia + 6) % 7; 
  let totalDias  = new Date(anioActual, mesActual + 1, 0).getDate();
  let hoyDia     = new Date().getDate();
  let hoyMes     = new Date().getMonth();
  let hoyAnio    = new Date().getFullYear();

  for (let i = 0; i < offset; i++) {
    grid.appendChild(document.createElement('div'));
  }

  for (let d = 1; d <= totalDias; d++) {
    let esHoy    = d === hoyDia && mesActual === hoyMes && anioActual === hoyAnio;
    let tienesCita = tieneCitaEnDia(d, mesActual, anioActual);
    let estaSeleccionado = d === diaSeleccionado;

    let diaEl = document.createElement('div');
    diaEl.className = 'cal-day';
    if (esHoy) diaEl.classList.add('today');
    if (tienesCita) diaEl.classList.add('has-cita');
    if (estaSeleccionado) diaEl.classList.add('selected');
    diaEl.textContent = d;

    diaEl.addEventListener('click', crearHandlerDia(d));
    grid.appendChild(diaEl);
  }

  if (diaSeleccionado) {
    mostrarCitasDelDia(diaSeleccionado);
  } else {
    let msgEl = document.getElementById('cal-citas-list');
    while (msgEl.firstChild) msgEl.removeChild(msgEl.firstChild);
    msgEl.appendChild(crearEl('p', {
      textContent: 'Clica un día para ver sus citas',
      style: { color: 'var(--text3)', fontSize: '13px', padding: '12px 0' }
    }));
  }
};

const crearHandlerDia = function(dia) {
  return function() {
    diaSeleccionado = dia;
    renderCalendario();
  };
};

const tieneCitaEnDia = function(dia, mes, anio) {
  for (let i = 0; i < listaCitas.length; i++) {
    let c = listaCitas[i];
    if (c.estado === 'cancelada' || c.estado === 'completada') continue;
    let fechaCalendario = String(dia).padStart(2, '0') + '/' + String(mes + 1).padStart(2, '0');
    if (c.fechaISO) {
      let partes = c.fechaISO.split('-');
      let diaC = partes[2];
      let mesC = partes[1];
      if (parseInt(diaC) === dia && parseInt(mesC) === mes + 1) return true;
    }
  }
  return false;
};

const mostrarCitasDelDia = function(dia) {
  let lista = document.getElementById('cal-citas-list');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  let citasDelDia = [];
  for (let i = 0; i < listaCitas.length; i++) {
    let c = listaCitas[i];
    if (c.estado === 'cancelada' || c.estado === 'completada') continue;
    if (c.fechaISO) {
      let partes = c.fechaISO.split('-');
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

  for (let i = 0; i < citasDelDia.length; i++) {
    let c = citasDelDia[i];
    let card = crearEl('div', { className: 'cita-card', style: { marginBottom: '10px' } });

    let tDiv = crearEl('div', { className: 'cita-time' });
    tDiv.appendChild(crearEl('div', { className: 'hour', textContent: c.hora }));
    tDiv.appendChild(crearEl('div', { className: 'date', textContent: 'Día ' + dia }));

    let sep = crearEl('div', { className: 'cita-divider' });

    let iDiv = crearEl('div', { className: 'cita-info' });
    iDiv.appendChild(crearEl('div', { className: 'cita-title', textContent: c.motivo }));
    iDiv.appendChild(crearEl('div', { className: 'cita-sub', textContent: c.mascota }));

    card.appendChild(tDiv);
    card.appendChild(sep);
    card.appendChild(iDiv);
    lista.appendChild(card);
  }
};

const changeMonth = function(d) {
  mesActual += d;
  if (mesActual > 11) { mesActual = 0;  anioActual++; }
  if (mesActual < 0)  { mesActual = 11; anioActual--; }
  diaSeleccionado = null;
  renderCalendario();
};

const closeModal = function() {
  let modales = document.querySelectorAll('.modal-overlay');
  for (let i = 0; i < modales.length; i++) {
    modales[i].classList.remove('open');
  }
};

const solicitarCita = function() {
  let mascota     = document.getElementById('nueva-mascota').value;
  let vetSelect   = document.getElementById('nueva-vet').value;
  let motivo      = document.getElementById('nueva-motivo').value.trim();
  let fechaInput  = document.getElementById('nueva-fecha').value;
  let horaInput   = document.getElementById('nueva-hora').value;

  if (!mascota || !motivo || !fechaInput || !horaInput) {
    PetSpot.notify('Por favor, rellena todos los campos');
    return;
  }

  let partes = fechaInput.split('-');
  let fechaLegible = partes[2] + '/' + partes[1];

  let nueva = {
    id:         Date.now(),
    hora:       horaInput,
    fecha:      fechaLegible,
    fechaISO:   fechaInput, 
    veterinario: vetSelect.split(' — ')[0],
    mascota:    mascota.split(' (')[0],
    motivo:     motivo,
    estado:     'pendiente',
    clinica:    vetSelect.split(' — ')[1] || 'PetSpot'
  };

  listaCitas.push(nueva);
  Almacen.guardar('citas', listaCitas);

  closeModal();
  renderProximas();
  renderHistorial();
  PetSpot.notify('Cita solicitada — estado: pendiente');

  document.getElementById('nueva-motivo').value = '';
  document.getElementById('nueva-fecha').value  = '';
};
renderProximas();
