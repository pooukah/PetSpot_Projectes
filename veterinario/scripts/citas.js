// PetSpot — Citas del veterinario
// Las citas se guardan en localStorage + Firestore

PetSpot.init('veterinario');
buildVetLayout('citas');

// Cargar datos desde Firestore al iniciar
PetSpot.loadUserFromFirestore(function() {
  listaCitas = Almacen.cargar('citas_vet');
  filtrarYRenderizar();
});

ponerIcono(document.getElementById('icon-plus'),   Icons.plus);
ponerIcono(document.getElementById('icon-search'), Icons.search);
ponerIcono(document.getElementById('icon-x'),      Icons.x);

// Abrir modal de nueva cita
document.getElementById('btn-nueva').addEventListener('click', function() {
  document.getElementById('modal-nueva').classList.add('open');
});

// Cargar citas guardadas
var listaCitas = Almacen.cargar('citas_vet');
var filtroActivo = 'todas';

// Icono según especie
function iconoPorEspecie(especie) {
  if (especie === 'Gato') return Icons.cat;
  if (especie === 'Perro') return Icons.dog;
  return Icons.paw;
}

// ============================================================
// RENDER DE CITAS EN LA TABLA
// ============================================================
function renderCitas(datos) {
  var tbody = document.getElementById('citas-body');
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

  if (!datos || datos.length === 0) {
    var fila = document.createElement('tr');
    var celda = document.createElement('td');
    celda.colSpan = 7;
    celda.style.textAlign = 'center';
    celda.style.color     = 'var(--text3)';
    celda.style.padding   = '32px';
    celda.textContent     = 'No hay citas que mostrar';
    fila.appendChild(celda);
    tbody.appendChild(fila);
    return;
  }

  for (var i = 0; i < datos.length; i++) {
    tbody.appendChild(crearFilaCita(datos[i]));
  }
}

// Crea una fila de la tabla para una cita
function crearFilaCita(c) {
  var fila = document.createElement('tr');
  fila.id  = 'cita-row-' + c.id;

  // Hora
  var tdHora = document.createElement('td');
  var horaEl = crearEl('strong', { textContent: c.hora, style: { fontSize: '15px' } });
  tdHora.appendChild(horaEl);

  // Fecha
  var tdFecha = crearEl('td', { textContent: c.fecha });

  // Cliente
  var tdCliente = document.createElement('td');
  var clienteWrap = document.createElement('div');
  clienteWrap.style.display = 'flex';
  clienteWrap.style.alignItems = 'center';
  clienteWrap.style.gap = '9px';
  var avEl = crearEl('div', {
    className: 'topbar-avatar',
    textContent: c.cliente[0],
    style: { width: '30px', height: '30px', fontSize: '12px', flexShrink: '0' }
  });
  var clienteNombre = crearEl('span', { textContent: c.cliente, style: { fontWeight: '500' } });
  clienteWrap.appendChild(avEl);
  clienteWrap.appendChild(clienteNombre);
  tdCliente.appendChild(clienteWrap);

  // Mascota con icono de especie
  var tdMascota = document.createElement('td');
  var mascotaWrap = document.createElement('div');
  mascotaWrap.style.display = 'flex';
  mascotaWrap.style.alignItems = 'center';
  mascotaWrap.style.gap = '7px';
  var iconoEspecie = document.createElement('span');
  iconoEspecie.style.display = 'flex';
  iconoEspecie.style.width   = '18px';
  iconoEspecie.style.height  = '18px';
  ponerIcono(iconoEspecie, iconoPorEspecie(c.especie || 'Perro'));
  mascotaWrap.appendChild(iconoEspecie);
  mascotaWrap.appendChild(document.createTextNode(c.mascota));
  tdMascota.appendChild(mascotaWrap);

  var tdMotivo = crearEl('td', { textContent: c.motivo });

  // Estado (badge)
  var tdEstado  = document.createElement('td');
  var claseBadge = c.estado === 'confirmada' ? 'badge-green' : 'badge-orange';
  tdEstado.appendChild(crearEl('span', { className: 'badge ' + claseBadge, textContent: c.estado }));

  // Acciones
  var tdAcciones = document.createElement('td');
  var accionesDiv = document.createElement('div');
  accionesDiv.style.display = 'flex';
  accionesDiv.style.gap     = '6px';

  if (c.estado === 'pendiente') {
    var btnAceptar  = crearEl('button', { className: 'btn btn-success btn-sm', textContent: '✓ Aceptar' });
    var btnRechazar = crearEl('button', { className: 'btn btn-danger btn-sm',  textContent: '✕ Rechazar' });
    btnAceptar.addEventListener('click',  crearHandlerAceptar(c.id));
    btnRechazar.addEventListener('click', crearHandlerRechazar(c.id));
    accionesDiv.appendChild(btnAceptar);
    accionesDiv.appendChild(btnRechazar);
  } else {
    var btnVer = crearEl('button', { className: 'btn btn-ghost btn-sm', textContent: 'Ver historial' });
    btnVer.addEventListener('click', function() { PetSpot.notify('Historial del paciente (próximamente)'); });
    accionesDiv.appendChild(btnVer);
  }

  tdAcciones.appendChild(accionesDiv);

  fila.appendChild(tdHora);
  fila.appendChild(tdFecha);
  fila.appendChild(tdCliente);
  fila.appendChild(tdMascota);
  fila.appendChild(tdMotivo);
  fila.appendChild(tdEstado);
  fila.appendChild(tdAcciones);
  return fila;
}

function crearHandlerAceptar(id) {
  return function() {
    for (var i = 0; i < listaCitas.length; i++) {
      if (listaCitas[i].id === id) { listaCitas[i].estado = 'confirmada'; break; }
    }
    Almacen.guardar('citas_vet', listaCitas);
    filtrarYRenderizar();
    PetSpot.notify('✅ Cita confirmada');
  };
}

function crearHandlerRechazar(id) {
  return function() {
    var nueva = [];
    for (var i = 0; i < listaCitas.length; i++) {
      if (listaCitas[i].id !== id) nueva.push(listaCitas[i]);
    }
    listaCitas = nueva;
    Almacen.guardar('citas_vet', listaCitas);
    filtrarYRenderizar();
    PetSpot.notify('Cita rechazada');
  };
}

function filtrarYRenderizar() {
  var datos = [];
  for (var i = 0; i < listaCitas.length; i++) {
    if (filtroActivo === 'todas' || listaCitas[i].estado === filtroActivo) {
      datos.push(listaCitas[i]);
    }
  }
  renderCitas(datos);
}

function filterCitas(tipo, el) {
  filtroActivo = tipo;
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  el.classList.add('active');
  filtrarYRenderizar();
}

function searchCitas(q) {
  var busq  = q.toLowerCase();
  var datos = [];
  for (var i = 0; i < listaCitas.length; i++) {
    var c = listaCitas[i];
    if (c.cliente.toLowerCase().indexOf(busq) !== -1 ||
        c.mascota.toLowerCase().indexOf(busq) !== -1 ||
        c.motivo.toLowerCase().indexOf(busq)  !== -1) {
      datos.push(c);
    }
  }
  renderCitas(datos);
}

// ============================================================
// CREAR NUEVA CITA
// ============================================================
function closeModal() {
  var modales = document.querySelectorAll('.modal-overlay');
  for (var i = 0; i < modales.length; i++) modales[i].classList.remove('open');
}

function addCita() {
  var cliente = document.getElementById('nueva-cliente').value.trim();
  var mascota = document.getElementById('nueva-mascota').value.trim();
  var motivo  = document.getElementById('nueva-motivo').value.trim();
  var fecha   = document.getElementById('nueva-fecha').value;
  var hora    = document.getElementById('nueva-hora').value;

  // Validación — todos los campos son obligatorios
  if (!cliente || !mascota || !motivo || !fecha || !hora) {
    PetSpot.notify('Por favor, rellena todos los campos');
    return;
  }

  // Convertir fecha
  var partes       = fecha.split('-');
  var fechaLegible = partes[2] + '/' + partes[1];

  // Crear la cita
  var nueva = {
    id:       Date.now(),
    hora:     hora,
    fecha:    fechaLegible,
    cliente:  cliente,
    mascota:  mascota,
    especie:  'Perro', // Por defecto; en una versión real vendría del perfil del cliente
    motivo:   motivo,
    estado:   'confirmada' // El vet la crea directamente como confirmada
  };

  listaCitas.push(nueva);
  Almacen.guardar('citas_vet', listaCitas);
  filtrarYRenderizar();
  closeModal();

  // Limpiar campos del formulario
  document.getElementById('nueva-cliente').value = '';
  document.getElementById('nueva-mascota').value = '';
  document.getElementById('nueva-motivo').value  = '';
  document.getElementById('nueva-fecha').value   = '';

  PetSpot.notify('✅ Cita añadida correctamente');
}

// ── Render inicial ──
filtrarYRenderizar();
