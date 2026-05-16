PetSpot.init('veterinario');
buildVetLayout('perfil');

let notifs = [
  ['Nueva cita solicitada', 'Cuando un cliente pide cita',  true ],
  ['Mensaje nuevo',         'Cuando recibes un mensaje',    true ],
  ['Pago recibido',         'Confirmación de pago',         true ],
  ['Recordatorio de cita',  '1h antes de cada cita',        true ],
  ['Valoración nueva',      'Cuando te valoran',            false ]
];
let notifEl = document.getElementById('notif-list');

ponerIcono(document.getElementById('icon-edit-av'), Icons.edit);
ponerIcono(document.getElementById('icon-pin'),     Icons.pin);

const cargarPerfil = async function() {
  try {
    let email = sessionStorage.getItem('user_email');

    let response = await fetch(
      `http://127.0.0.1:8000/auth/perfil/veterinario/${email}`
    );

    if (!response.ok) {
      throw new Error('Error cargando perfil');
    }
    let vet = await response.json();
    console.log(vet);

    document.getElementById('input-nombre').value = (vet.nombre || '') + ' ' + (vet.apellidos || '');
    document.getElementById('input-tel').value = vet.telefono || '';
    document.getElementById('input-colegiado').value = vet.numero_colegiado || '';
    const selectEspecialidad = document.querySelector('select.form-input');
    if (selectEspecialidad && vet.especialidad) {
      selectEspecialidad.value = vet.especialidad;
    }
    const inputExperiencia = document.querySelector('input[type="number"]');
    if (inputExperiencia && vet.años_experiencia) {
      inputExperiencia.value = vet.años_experiencia;
    }
    document.getElementById('vet-name').textContent = 'Dr./Dra. ' + (vet.nombre || '');
    document.getElementById('vet-email').textContent = vet.email || '';
    document.getElementById('vet-clinic-name').textContent = vet.clinica || '';
    document.getElementById('vet-av').textContent = (vet.nombre || 'V')[0].toUpperCase();
  } catch (err) {
    console.error(err);
    PetSpot.notify('Error cargando perfil');
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

const guardarDatos = async function() {
  try {
    let email = sessionStorage.getItem('user_email');
    let nombreCompleto = document.getElementById('input-nombre').value.trim();
    let partes = nombreCompleto.split(' ');
    let nombre = partes.shift() || '';
    let apellidos = partes.join(' ');

    const selectEspecialidad = document.querySelector('select.form-input');
    const inputExperiencia = document.querySelector('input[type="number"]');

    let datos = {
      nombre: nombre,
      apellidos: apellidos,
      telefono: document.getElementById('input-tel').value.trim(),
      numero_colegiado: document.getElementById('input-colegiado').value.trim(),
      especialidad: selectEspecialidad ? selectEspecialidad.value : '',
      años_experiencia: inputExperiencia ? parseInt(inputExperiencia.value) || 0 : 0
    };

    let response = await fetch(
      `http://127.0.0.1:8000/auth/perfil/veterinario/${email}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      }
    );

    let result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || 'Error guardando');
    }
    document.getElementById('vet-name').textContent = 'Dr./Dra. ' + nombre;
    document.getElementById('vet-av').textContent = nombre[0].toUpperCase();
    PetSpot.notify('Perfil actualizado');
  } catch (err) {
    console.error(err);
    PetSpot.notify(err.message);
  }
};
if (notifEl) {

  for (let i = 0; i < notifs.length; i++) {
    let n = notifs[i];
    let row = crearEl('div', {
      className: 'notif-row'
    });
    let textDiv = document.createElement('div');
    textDiv.appendChild(
      crearEl('div', {
        style: {
          fontSize: '14px',
          fontWeight: '600'
        },
        textContent: n[0]
      })
    );
    textDiv.appendChild(crearEl('div', {style: {fontSize: '12px',color: 'var(--text2)'},textContent: n[1]}));
    let toggle = crearEl('div', {
      className: 'toggle' + (n[2] ? ' on' : '')
    });
    toggle.addEventListener('click', function() {
      this.classList.toggle('on');
    });

    row.appendChild(textDiv);
    row.appendChild(toggle);
    notifEl.appendChild(row);
  }
}

const cambiarPassword = async function() {
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
  const email = sessionStorage.getItem('user_email');
 
  try {
    const response = await fetch(`http://127.0.0.1:8000/auth/cambiar-password/${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email
      },
      body: JSON.stringify({
        password_actual: actual,
        password_nueva: nueva
      })
    });
 
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al cambiar contraseña');
    }
 
    document.getElementById('pass-actual').value = '';
    document.getElementById('pass-nueva').value = '';
    document.getElementById('pass-confirmar').value = '';
 
    PetSpot.notify('Contraseña actualizada correctamente');
  } catch (error) {
    console.error(error);
    PetSpot.notify(error.message);
  }
};

cargarPerfil();