PetSpot.init('cliente');
buildClienteLayout('perfil');

ponerIcono(document.getElementById('icon-edit-av'),  Icons.edit);
ponerIcono(document.getElementById('icon-check-sm'), Icons.check);
ponerIcono(document.getElementById('icon-plus-pet'), Icons.plus);
ponerIcono(document.getElementById('icon-x-pet'),    Icons.x);
ponerIcono(document.getElementById('icon-paw-modal'), Icons.paw);

let user = PetSpot.getUser();
if (user) {
  document.getElementById('input-nombre').value = user.nombre  || '';
  document.getElementById('input-email').value  = user.email   || '';
  document.getElementById('input-dir').value    = user.direccion || '';
  document.getElementById('profile-name').textContent  = user.nombre || '';
  document.getElementById('profile-email').textContent = user.email  || '';
}

document.getElementById('input-nombre').addEventListener('input', function() {
  document.getElementById('profile-name').textContent = this.value || 'Sin nombre';
});

const guardarDatos = function() {
  let nombre = document.getElementById('input-nombre').value.trim();
  let email  = document.getElementById('input-email').value.trim();
  let tel    = document.getElementById('input-tel').value.trim();
  let dir    = document.getElementById('input-dir').value.trim();
  let cp     = document.getElementById('input-cp').value.trim();

  if (!nombre) {
    PetSpot.notify('El nombre no puede estar vacío');
    return;
  }

  let u = PetSpot.getUser();
  u.nombre    = nombre;
  u.email     = email;
  u.direccion = dir;
  PetSpot.setUser(u);

  PetSpot.setTopbar();
  document.getElementById('profile-name').textContent  = nombre;
  document.getElementById('profile-email').textContent = email;

  PetSpot.notify('Datos guardados correctamente');
};

const showSection = function(sec, el) {
  document.getElementById('sec-datos').style.display    = sec === 'datos'    ? '' : 'none';
  document.getElementById('sec-mascotas').style.display = sec === 'mascotas' ? '' : 'none';
  document.getElementById('sec-config').style.display   = sec === 'config'   ? '' : 'none';
  let tabs = document.querySelectorAll('.tab');
  for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  el.classList.add('active');
};

let listaMascotas = Almacen.cargar('mascotas'); 
let petIcons = { dog: Icons.dog, cat: Icons.cat, rabbit: Icons.rabbit };

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

  let infoDiv  = document.createElement('div');
  infoDiv.style.flex = '1';
  infoDiv.appendChild(crearEl('div', { className: 'mascota-name',  textContent: m.nombre }));
  infoDiv.appendChild(crearEl('div', { className: 'mascota-breed', textContent: m.especie + ' · ' + m.raza }));

  let btnEliminar = crearEl('button', { className: 'btn btn-danger btn-sm', textContent: 'Eliminar' });
  btnEliminar.addEventListener('click', crearHandlerEliminar(m.id));

  top.appendChild(iconDiv);
  top.appendChild(infoDiv);
  top.appendChild(btnEliminar);

  let grid = crearEl('div', { className: 'grid-2', style: { gap: '12px' } });

  let pesoBloq = document.createElement('div');
  pesoBloq.className = 'form-group';
  let pesoLabel = crearEl('label', { className: 'form-label', textContent: 'Peso (kg)' });
  let pesoInput = crearEl('input', { className: 'form-input', type: 'text' });
  pesoInput.value = m.peso;
  pesoInput.id    = 'peso-' + m.id;
  pesoBloq.appendChild(pesoLabel);
  pesoBloq.appendChild(pesoInput);

  let fechaBloq = document.createElement('div');
  fechaBloq.className = 'form-group';
  let fechaLabel = crearEl('label', { className: 'form-label', textContent: 'Fecha de nacimiento' });
  let fechaInput = crearEl('input', { className: 'form-input', type: 'text' });
  fechaInput.value    = m.nacimiento;
  fechaInput.readOnly = true;
  fechaInput.style.opacity = '0.7';
  fechaBloq.appendChild(fechaLabel);
  fechaBloq.appendChild(fechaInput);

  let chipBloq = document.createElement('div');
  chipBloq.className = 'form-group';
  chipBloq.style.gridColumn = '1 / -1';
  let chipLabel = crearEl('label', { className: 'form-label', textContent: 'Nº Microchip' });
  let chipInput = crearEl('input', { className: 'form-input', type: 'text' });
  chipInput.value    = m.microchip;
  chipInput.readOnly = true;
  chipInput.style.opacity = '0.7';
  chipBloq.appendChild(chipLabel);
  chipBloq.appendChild(chipInput);

  grid.appendChild(pesoBloq);
  grid.appendChild(fechaBloq);
  grid.appendChild(chipBloq);

  let btnGuardar = crearEl('button', { className: 'btn btn-primary btn-sm', textContent: 'Guardar cambios' });
  btnGuardar.style.marginTop = '8px';
  btnGuardar.addEventListener('click', crearHandlerGuardarPeso(m.id));

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

const crearHandlerGuardarPeso = function(id) {
  return function() {
    let input = document.getElementById('peso-' + id);
    if (!input) return;
    for (let i = 0; i < listaMascotas.length; i++) {
      if (listaMascotas[i].id === id) {
        listaMascotas[i].peso = input.value;
        break;
      }
    }
    Almacen.guardar('mascotas', listaMascotas);
    PetSpot.notify('Peso actualizado');
  };
};

const eliminarMascota = function(id) {
  let nombreMascota = '';
  let nuevaLista = [];
  for (let i = 0; i < listaMascotas.length; i++) {
    if (listaMascotas[i].id === id) {
      nombreMascota = listaMascotas[i].nombre;
    } else {
      nuevaLista.push(listaMascotas[i]);
    }
  }
  listaMascotas = nuevaLista;
  Almacen.guardar('mascotas', listaMascotas);

  if (nombreMascota) {
    let citas = Almacen.cargar('citas');
    let nuevasCitas = [];
    for (let i = 0; i < citas.length; i++) {
      if (citas[i].mascota !== nombreMascota) {
        nuevasCitas.push(citas[i]);
      }
    }
    Almacen.guardar('citas', nuevasCitas);
  }

  renderMascotas();
  PetSpot.notify('Mascota eliminada');
};

document.getElementById('btn-add-pet').addEventListener('click', function() {
  document.getElementById('modal-pet').classList.add('open');
});

const addPet = function() {
  let nombre    = document.getElementById('nueva-nombre').value.trim();
  let especie   = document.getElementById('nueva-especie').value;
  let raza      = document.getElementById('nueva-raza').value.trim();
  let peso      = document.getElementById('nueva-peso').value.trim();
  let fecha     = document.getElementById('nueva-fecha').value;
  let microchip = document.getElementById('nueva-microchip').value.trim();

  if (!nombre || !raza || !peso || !fecha) {
    PetSpot.notify('Rellena al menos nombre, raza, peso y fecha');
    return;
  }

  let partes       = fecha.split('-');
  let fechaFormato = partes[2] + '/' + partes[1] + '/' + partes[0];

  let nueva = {
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

  document.getElementById('nueva-nombre').value    = '';
  document.getElementById('nueva-raza').value      = '';
  document.getElementById('nueva-peso').value      = '';
  document.getElementById('nueva-fecha').value     = '';
  document.getElementById('nueva-microchip').value = '';

  PetSpot.notify(nombre + ' añadido/a correctamente');
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

renderMascotas();