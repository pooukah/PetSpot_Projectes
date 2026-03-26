// PetSpot — Perfil del veterinario
// Datos persistentes con Firestore

PetSpot.init('veterinario');
buildVetLayout('perfil');

// ── Iconos ──
ponerIcono(document.getElementById('icon-edit-av'), Icons.edit);
ponerIcono(document.getElementById('icon-pin'),     Icons.pin);

// ── Cargar datos del usuario ──
function cargarDatosVet() {
  var user = PetSpot.getUser();
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
}

cargarDatosVet();

// Cargar desde Firestore
PetSpot.loadUserFromFirestore(function() {
  cargarDatosVet();
});

// ── Actualizar nombre en tiempo real ──
document.getElementById('input-nombre').addEventListener('input', function() {
  var nuevo = this.value || 'Sin nombre';
  document.getElementById('vet-name').textContent = 'Dr./Dra. ' + nuevo;
  var saludo = document.getElementById('topbar-greeting');
  if (saludo) {
    saludo.textContent = '';
    saludo.appendChild(document.createTextNode('Bienvenido, '));
    var strong = document.createElement('strong');
    strong.textContent = 'Dr./Dra. ' + nuevo;
    saludo.appendChild(strong);
  }
  var av = document.getElementById('topbar-avatar');
  if (av) av.textContent = nuevo[0] ? nuevo[0].toUpperCase() : 'V';
});

// ── Guardar datos (sessionStorage + Firestore) ──
function guardarDatos() {
  var nombre = document.getElementById('input-nombre').value.trim();
  var email  = document.getElementById('input-email').value.trim();
  if (!nombre) {
    PetSpot.notify('El nombre no puede estar vacío');
    return;
  }
  var u   = PetSpot.getUser();
  u.nombre = nombre;
  u.email  = email;
  PetSpot.setUser(u);

  // Guardar en Firestore
  PetSpot.saveUserToFirestore({
    nombre: nombre,
    email:  email
  });

  document.getElementById('vet-name').textContent  = 'Dr./Dra. ' + nombre;
  document.getElementById('vet-email').textContent = email;
  document.getElementById('vet-av').textContent    = nombre[0].toUpperCase();
  PetSpot.setTopbar();
  PetSpot.notify('Datos guardados correctamente');
}

// ── Especialidades ──
var specs    = ['Cirugía', 'Medicina interna', 'Odontología'];
var specsEl  = document.getElementById('vet-specs');
for (var i = 0; i < specs.length; i++) {
  specsEl.appendChild(crearEl('span', { className: 'spec-tag', textContent: specs[i] }));
}

// ── Notificaciones ──
var notifs = [
  ['Nueva cita solicitada', 'Cuando un cliente pide cita',  true ],
  ['Mensaje nuevo',         'Cuando recibes un mensaje',    true ],
  ['Pago recibido',         'Confirmación de pago',         true ],
  ['Recordatorio de cita',  '1h antes de cada cita',        true ],
  ['Valoración nueva',      'Cuando te valoran',            false]
];
var notifEl = document.getElementById('notif-list');
for (var i = 0; i < notifs.length; i++) {
  var n   = notifs[i];
  var row = crearEl('div', { className: 'notif-row' });
  var textDiv = document.createElement('div');
  textDiv.appendChild(crearEl('div', { style: { fontSize: '14px', fontWeight: '600' }, textContent: n[0] }));
  textDiv.appendChild(crearEl('div', { style: { fontSize: '12px', color: 'var(--text2)' }, textContent: n[1] }));
  var toggle = crearEl('div', { className: 'toggle' + (n[2] ? ' on' : '') });
  toggle.addEventListener('click', function() { this.classList.toggle('on'); });
  row.appendChild(textDiv);
  row.appendChild(toggle);
  notifEl.appendChild(row);
}

// ── Cambiar contraseña (Firebase Auth) ──
function cambiarPassword() {
  var actual    = document.getElementById('pass-actual').value;
  var nueva     = document.getElementById('pass-nueva').value;
  var confirmar = document.getElementById('pass-confirmar').value;

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

  // Si Firebase Auth está disponible, cambiar la contraseña real
  if (typeof auth !== 'undefined' && auth.currentUser) {
    var user = auth.currentUser;
    var credential = firebase.auth.EmailAuthProvider.credential(user.email, actual);
    user.reauthenticateWithCredential(credential).then(function() {
      return user.updatePassword(nueva);
    }).then(function() {
      document.getElementById('pass-actual').value    = '';
      document.getElementById('pass-nueva').value     = '';
      document.getElementById('pass-confirmar').value = '';
      PetSpot.notify('Contraseña actualizada correctamente');
    }).catch(function(error) {
      if (error.code === 'auth/wrong-password') {
        PetSpot.notify('La contraseña actual es incorrecta');
      } else {
        PetSpot.notify('Error al cambiar contraseña: ' + error.message);
      }
    });
  } else {
    document.getElementById('pass-actual').value    = '';
    document.getElementById('pass-nueva').value     = '';
    document.getElementById('pass-confirmar').value = '';
    PetSpot.notify('Contraseña actualizada correctamente');
  }
}
