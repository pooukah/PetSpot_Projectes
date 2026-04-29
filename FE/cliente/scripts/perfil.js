// PetSpot — Perfil del cliente
// Mascotas persistentes en localStorage — añadir/eliminar persiste entre sesiones

PetSpot.init('cliente');
buildClienteLayout('perfil');

// ── Iconos ──
ponerIcono(document.getElementById('icon-edit-av'),  Icons.edit);
ponerIcono(document.getElementById('icon-check-sm'), Icons.check);
ponerIcono(document.getElementById('icon-plus-pet'), Icons.plus);
ponerIcono(document.getElementById('icon-x-pet'),    Icons.x);
ponerIcono(document.getElementById('icon-paw-modal'), Icons.paw);

// ── Cargar datos del usuario ──
var user = PetSpot.getUser();
if (user) {
  document.getElementById('input-nombre').value = user.nombre  || '';
  document.getElementById('input-email').value  = user.email   || '';
  document.getElementById('input-dir').value    = user.direccion || '';
  document.getElementById('profile-name').textContent  = user.nombre || '';
  document.getElementById('profile-email').textContent = user.email  || '';
}

// ── Actualizar nombre en tiempo real ──
document.getElementById('input-nombre').addEventListener('input', function() {
  document.getElementById('profile-name').textContent = this.value || 'Sin nombre';
});

// ── Guardar datos personales ──
function guardarDatos() {
  var nombre = document.getElementById('input-nombre').value.trim();
  var email  = document.getElementById('input-email').value.trim();
  var tel    = document.getElementById('input-tel').value.trim();
  var dir    = document.getElementById('input-dir').value.trim();
  var cp     = document.getElementById('input-cp').value.trim();

  if (!nombre) {
    PetSpot.notify('El nombre no puede estar vacío');
    return;
  }

  // Guardar en sesión
  var u = PetSpot.getUser();
  u.nombre    = nombre;
  u.email     = email;
  u.direccion = dir;
  PetSpot.setUser(u);

  // Actualizar UI
  PetSpot.setTopbar();
  document.getElementById('profile-name').textContent  = nombre;
  document.getElementById('profile-email').textContent = email;

  PetSpot.notify('✅ Datos guardados correctamente');
}

// ── Tabs ──
function showSection(sec, el) {
  document.getElementById('sec-datos').style.display    = sec === 'datos'    ? '' : 'none';
  document.getElementById('sec-mascotas').style.display = sec === 'mascotas' ? '' : 'none';
  document.getElementById('sec-config').style.display   = sec === 'config'   ? '' : 'none';
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  el.classList.add('active');
}

// ============================================================
// MASCOTAS PERSISTENTES
// ============================================================
var listaMascotas = Almacen.cargar('mascotas'); // Array guardado en localStorage
var petIcons = { dog: Icons.dog, cat: Icons.cat, rabbit: Icons.rabbit };

// Devuelve el tipo (dog/cat/rabbit) a partir del nombre de la especie
function obtenerType(especie) {
  if (especie === 'Perro') return 'dog';
  if (especie === 'Gato')  return 'cat';
  return 'rabbit';
}

function renderMascotas() {
  var lista = document.getElementById('mascotas-list');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  // Actualizar el contador
  var contador = document.getElementById('contador-mascotas');
  if (contador) contador.textContent = '(' + listaMascotas.length + ')';

  if (listaMascotas.length === 0) {
    lista.appendChild(crearEl('p', {
      textContent: 'Aún no has añadido ninguna mascota',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '24px', fontSize: '13px' }
    }));
    return;
  }

  for (var i = 0; i < listaMascotas.length; i++) {
    lista.appendChild(crearCardMascota(listaMascotas[i]));
  }
}

function crearCardMascota(m) {
  var card = crearEl('div', { className: 'mascota-card' });
  card.dataset.id = m.id;

  // Cabecera de la tarjeta
  var top = crearEl('div', { className: 'mascota-card-top' });

  var iconDiv = crearEl('div', { className: 'mascota-icon' });
  ponerIcono(iconDiv, petIcons[m.type] || Icons.paw);

  var infoDiv  = document.createElement('div');
  infoDiv.style.flex = '1';
  infoDiv.appendChild(crearEl('div', { className: 'mascota-name',  textContent: m.nombre }));
  infoDiv.appendChild(crearEl('div', { className: 'mascota-breed', textContent: m.especie + ' · ' + m.raza }));

  // Botón eliminar
  var btnEliminar = crearEl('button', { className: 'btn btn-danger btn-sm', textContent: 'Eliminar' });
  btnEliminar.addEventListener('click', crearHandlerEliminar(m.id));

  top.appendChild(iconDiv);
  top.appendChild(infoDiv);
  top.appendChild(btnEliminar);

  // Campos editables
  var grid = crearEl('div', { className: 'grid-2', style: { gap: '12px' } });

  // Peso — editable
  var pesoBloq = document.createElement('div');
  pesoBloq.className = 'form-group';
  var pesoLabel = crearEl('label', { className: 'form-label', textContent: 'Peso (kg)' });
  var pesoInput = crearEl('input', { className: 'form-input', type: 'text' });
  pesoInput.value = m.peso;
  pesoInput.id    = 'peso-' + m.id;
  pesoBloq.appendChild(pesoLabel);
  pesoBloq.appendChild(pesoInput);

  // Fecha nacimiento — solo lectura
  var fechaBloq = document.createElement('div');
  fechaBloq.className = 'form-group';
  var fechaLabel = crearEl('label', { className: 'form-label', textContent: 'Fecha de nacimiento' });
  var fechaInput = crearEl('input', { className: 'form-input', type: 'text' });
  fechaInput.value    = m.nacimiento;
  fechaInput.readOnly = true;
  fechaInput.style.opacity = '0.7';
  fechaBloq.appendChild(fechaLabel);
  fechaBloq.appendChild(fechaInput);

  // Microchip — solo lectura
  var chipBloq = document.createElement('div');
  chipBloq.className = 'form-group';
  chipBloq.style.gridColumn = '1 / -1';
  var chipLabel = crearEl('label', { className: 'form-label', textContent: 'Nº Microchip' });
  var chipInput = crearEl('input', { className: 'form-input', type: 'text' });
  chipInput.value    = m.microchip;
  chipInput.readOnly = true;
  chipInput.style.opacity = '0.7';
  chipBloq.appendChild(chipLabel);
  chipBloq.appendChild(chipInput);

  grid.appendChild(pesoBloq);
  grid.appendChild(fechaBloq);
  grid.appendChild(chipBloq);

  // Botón guardar cambios de peso
  var btnGuardar = crearEl('button', { className: 'btn btn-primary btn-sm', textContent: 'Guardar cambios' });
  btnGuardar.style.marginTop = '8px';
  btnGuardar.addEventListener('click', crearHandlerGuardarPeso(m.id));

  card.appendChild(top);
  card.appendChild(grid);
  card.appendChild(btnGuardar);
  return card;
}

function crearHandlerEliminar(id) {
  return function() {
    if (!confirm('¿Seguro que quieres eliminar esta mascota? También se borrarán sus citas.')) return;
    eliminarMascota(id);
  };
}

function crearHandlerGuardarPeso(id) {
  return function() {
    var input = document.getElementById('peso-' + id);
    if (!input) return;
    for (var i = 0; i < listaMascotas.length; i++) {
      if (listaMascotas[i].id === id) {
        listaMascotas[i].peso = input.value;
        break;
      }
    }
    Almacen.guardar('mascotas', listaMascotas);
    PetSpot.notify('✅ Peso actualizado');
  };
}

// Elimina la mascota y sus citas del localStorage
function eliminarMascota(id) {
  // Encontrar el nombre de la mascota para borrar sus citas
  var nombreMascota = '';
  var nuevaLista = [];
  for (var i = 0; i < listaMascotas.length; i++) {
    if (listaMascotas[i].id === id) {
      nombreMascota = listaMascotas[i].nombre;
    } else {
      nuevaLista.push(listaMascotas[i]);
    }
  }
  listaMascotas = nuevaLista;
  Almacen.guardar('mascotas', listaMascotas);

  // Borrar también las citas asociadas a esa mascota
  if (nombreMascota) {
    var citas = Almacen.cargar('citas');
    var nuevasCitas = [];
    for (var i = 0; i < citas.length; i++) {
      if (citas[i].mascota !== nombreMascota) {
        nuevasCitas.push(citas[i]);
      }
    }
    Almacen.guardar('citas', nuevasCitas);
  }

  renderMascotas();
  PetSpot.notify('Mascota eliminada');
}

// ── Añadir nueva mascota ──
document.getElementById('btn-add-pet').addEventListener('click', function() {
  document.getElementById('modal-pet').classList.add('open');
});

function addPet() {
  var nombre    = document.getElementById('nueva-nombre').value.trim();
  var especie   = document.getElementById('nueva-especie').value;
  var raza      = document.getElementById('nueva-raza').value.trim();
  var peso      = document.getElementById('nueva-peso').value.trim();
  var fecha     = document.getElementById('nueva-fecha').value;
  var microchip = document.getElementById('nueva-microchip').value.trim();

  if (!nombre || !raza || !peso || !fecha) {
    PetSpot.notify('Rellena al menos nombre, raza, peso y fecha');
    return;
  }

  // Convertir fecha de YYYY-MM-DD a DD/MM/YYYY
  var partes       = fecha.split('-');
  var fechaFormato = partes[2] + '/' + partes[1] + '/' + partes[0];

  // Crear la mascota y guardarla
  var nueva = {
    id:         Date.now(),
    nombre:     nombre,
    especie:    especie,
    raza:       raza,
    peso:       peso,
    nacimiento: fechaFormato,
    microchip:  microchip || 'Sin microchip',
    type:       obtenerType(especie)
  };
  listaMascotas.push(nueva);
  Almacen.guardar('mascotas', listaMascotas);

  renderMascotas();
  closeModal();

  // Limpiar el formulario
  document.getElementById('nueva-nombre').value    = '';
  document.getElementById('nueva-raza').value      = '';
  document.getElementById('nueva-peso').value      = '';
  document.getElementById('nueva-fecha').value     = '';
  document.getElementById('nueva-microchip').value = '';

  PetSpot.notify('✅ ' + nombre + ' añadido/a correctamente');
}

function closeModal() {
  var modales = document.querySelectorAll('.modal-overlay');
  for (var i = 0; i < modales.length; i++) modales[i].classList.remove('open');
}

// ── Notificaciones ──
var notifCfg = [
  ['Recordatorio de citas', '24h antes de cada cita', true],
  ['Mensajes nuevos',       'Cuando recibas un mensaje', true],
  ['Ofertas',               'Novedades y descuentos',    false],
  ['Email marketing',       'Boletín mensual',           false]
];
var notifLista = document.getElementById('notif-list');
for (var i = 0; i < notifCfg.length; i++) {
  var row = crearEl('div', { className: 'notif-row' });
  var textDiv = document.createElement('div');
  textDiv.appendChild(crearEl('div', { style: { fontSize: '14px', fontWeight: '600' }, textContent: notifCfg[i][0] }));
  textDiv.appendChild(crearEl('div', { style: { fontSize: '12px', color: 'var(--text2)' }, textContent: notifCfg[i][1] }));
  var toggle = crearEl('div', { className: 'toggle' + (notifCfg[i][2] ? ' on' : '') });
  toggle.addEventListener('click', function() { this.classList.toggle('on'); });
  row.appendChild(textDiv);
  row.appendChild(toggle);
  notifLista.appendChild(row);
}

// ── Render inicial ──
renderMascotas();