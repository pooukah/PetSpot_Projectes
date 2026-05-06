PetSpot.init('veterinario');
buildVetLayout('perfil');

ponerIcono(document.getElementById('icon-edit-av'), Icons.edit);
ponerIcono(document.getElementById('icon-pin'),     Icons.pin);

let user = PetSpot.getUser();
if (user) {
  document.getElementById('input-nombre').value    = user.nombre    || '';
  document.getElementById('input-email').value     = user.email     || '';
  document.getElementById('vet-name').textContent  = 'Dr./Dra. ' + (user.nombre || '');
  document.getElementById('vet-email').textContent = user.email || '';
  document.getElementById('vet-av').textContent    = user.nombre ? user.nombre[0].toUpperCase() : 'V';
  if (user.clinica) {
    document.getElementById('vet-clinic-name').textContent = user.clinica;
  }
}

document.getElementById('input-nombre').addEventListener('input', function() {
  let nuevo = this.value || 'Sin nombre';
  document.getElementById('vet-name').textContent = 'Dr./Dra. ' + nuevo;
  let saludo = document.getElementById('topbar-greeting');
  if (saludo) {
    saludo.textContent = '';
    saludo.appendChild(document.createTextNode('Bienvenido, '));
    let strong = document.createElement('strong');
    strong.textContent = 'Dr./Dra. ' + nuevo;
    saludo.appendChild(strong);
  }
  let av = document.getElementById('topbar-avatar');
  if (av) av.textContent = nuevo[0] ? nuevo[0].toUpperCase() : 'V';
});

const guardarDatos = function() {
  let nombre = document.getElementById('input-nombre').value.trim();
  let email  = document.getElementById('input-email').value.trim();
  if (!nombre) {
    PetSpot.notify('El nombre no puede estar vacío');
    return;
  }
  let u = PetSpot.getUser();
  u.nombre = nombre;
  u.email  = email;
  PetSpot.setUser(u);
  document.getElementById('vet-name').textContent  = 'Dr./Dra. ' + nombre;
  document.getElementById('vet-email').textContent = email;
  document.getElementById('vet-av').textContent    = nombre[0].toUpperCase();
  PetSpot.setTopbar();
  PetSpot.notify('Datos guardados correctamente');
};

let specs    = ['Cirugía', 'Medicina interna', 'Odontología'];
let specsEl  = document.getElementById('vet-specs');
for (let i = 0; i < specs.length; i++) {
  specsEl.appendChild(crearEl('span', { className: 'spec-tag', textContent: specs[i] }));
}

let notifs = [
  ['Nueva cita solicitada', 'Cuando un cliente pide cita',  true ],
  ['Mensaje nuevo',         'Cuando recibes un mensaje',    true ],
  ['Pago recibido',         'Confirmación de pago',         true ],
  ['Recordatorio de cita',  '1h antes de cada cita',        true ],
  ['Valoración nueva',      'Cuando te valoran',            false ]
];
let notifEl = document.getElementById('notif-list');
for (let i = 0; i < notifs.length; i++) {
  let n = notifs[i];
  let row = crearEl('div', { className: 'notif-row' });
  let textDiv = document.createElement('div');
  textDiv.appendChild(crearEl('div', { style: { fontSize: '14px', fontWeight: '600' }, textContent: n[0] }));
  textDiv.appendChild(crearEl('div', { style: { fontSize: '12px', color: 'var(--text2)' }, textContent: n[1] }));
  let toggle = crearEl('div', { className: 'toggle' + (n[2] ? ' on' : '') });
  toggle.addEventListener('click', function() { this.classList.toggle('on'); });
  row.appendChild(textDiv);
  row.appendChild(toggle);
  notifEl.appendChild(row);
}

const cambiarPassword = function() {
  let actual    = document.getElementById('pass-actual').value;
  let nueva     = document.getElementById('pass-nueva').value;
  let confirmar = document.getElementById('pass-confirmar').value;

  if (!actual || !nueva || !confirmar) {
    PetSpot.notify('Rellena todos los campos de contraseña');
    return;
  }
  if (nueva !== confirmar) {
    PetSpot.notify('Las contraseñas nuevas no coinciden');
    return;
  }
  if (nueva.length < 6) {
    PetSpot.notify('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  document.getElementById('pass-actual').value    = '';
  document.getElementById('pass-nueva').value     = '';
  document.getElementById('pass-confirmar').value = '';
  PetSpot.notify('Contraseña actualizada correctamente');
};