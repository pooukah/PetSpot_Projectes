PetSpot.init('veterinario');
buildVetLayout('citas');

ponerIcono(document.getElementById('icon-search'), Icons.search);
ponerIcono(document.getElementById('icon-plus'),   Icons.plus);
ponerIcono(document.getElementById('icon-x'),      Icons.x);

let citas = [];
let filtroActual = 'todas';

// TODAS LAS DEL VETERINARIO LOGEADO
const cargarCitas = async function() {
  try {
    let email = sessionStorage.getItem('user_email');
    let response = await fetch(`http://127.0.0.1:8000/api/citas/veterinario/mis-citas`, { // HACER BIEN EL FECTH
      headers: { 'x-user-email': email }
    });
    if (!response.ok) throw new Error('Error al cargar citas');
    citas = await response.json();
    renderCitas();
  } catch (error) {
    console.error('Error:', error);
    PetSpot.notify('Error al cargar citas');
  }
};

const renderCitas = function() {
  let tbody = document.getElementById('citas-body');
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

  let filtradas = citas;
  if (filtroActual !== 'todas') {
    filtradas = citas.filter(c => c.estado === filtroActual);
  }

  if (filtradas.length === 0) {
    let fila = document.createElement('tr');
    let celda = document.createElement('td');
    celda.colSpan = 7;
    celda.textContent = 'No hay citas';
    celda.style.textAlign = 'center';
    celda.style.color = 'var(--text3)';
    celda.style.padding = '24px';
    fila.appendChild(celda);
    tbody.appendChild(fila);
    return;
  }

  for (let i = 0; i < filtradas.length; i++) {
    let c = filtradas[i];
    let fila = document.createElement('tr');

    fila.appendChild(crearEl('td', { textContent: c.hora || '--:--' }));
    fila.appendChild(crearEl('td', { textContent: c.fecha || '--/--/----' }));
    fila.appendChild(crearEl('td', { textContent: c.cliente_nombre || 'Cliente' }));
    fila.appendChild(crearEl('td', { textContent: c.mascota_nombre || 'Mascota' }));
    fila.appendChild(crearEl('td', { textContent: c.motivo || '—' }));

    let estadoClass = '';
    if (c.estado === 'pendiente') estadoClass = 'badge-orange';
    if (c.estado === 'confirmada') estadoClass = 'badge-green';
    if (c.estado === 'cancelada') estadoClass = 'badge-red';
    let tdEstado = document.createElement('td');
    tdEstado.appendChild(crearEl('span', { className: 'badge ' + estadoClass, textContent: c.estado }));
    fila.appendChild(tdEstado);

    let tdAcciones = document.createElement('td');
    let btnConfirmar = crearEl('button', { className: 'btn btn-success btn-sm', textContent: 'Confirmar' });
    let btnCancelar = crearEl('button', { className: 'btn btn-danger btn-sm', textContent: 'Cancelar' });
    let btnEliminar = crearEl('button', { className: 'btn btn-dark btn-sm', textContent: 'Eliminar' });

    if(c.estado==='pendiente'){
      btnConfirmar.addEventListener('click', () => cambiarEstado(c.id_cita, 'confirmada'));
      btnCancelar.addEventListener('click', () => eliminarCita(c.id_cita));
      tdAcciones.appendChild(btnConfirmar);
      tdAcciones.appendChild(btnCancelar);
    }else if(c.estado==='confirmada'){
      btnCancelar.addEventListener('click', () => eliminarCita(c.id_cita));
      tdAcciones.appendChild(btnCancelar);
    }else if (c.estado === 'cancelada') {
      btnEliminar.addEventListener('click', () => {
        fila.remove();
      });
      tdAcciones.appendChild(btnEliminar);
    }else{
      btnEliminar.addEventListener('click', () => eliminarCita(c.id_cita));
      tdAcciones.appendChild(btnEliminar);
    }
    fila.appendChild(tdAcciones);
    tbody.appendChild(fila);
  }
};
// CAMBIA DE CONFIRMAR CANCELAR O NOSE
const cambiarEstado = async function(id, nuevoEstado) {
  try {
    let email = sessionStorage.getItem('user_email');
    let response = await fetch(`http://127.0.0.1:8000/api/citas/${id}/estado`, { // HACER BIEN EL FETCH
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-email': email },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!response.ok) throw new Error('Error al actualizar');
    PetSpot.notify('Cita ' + nuevoEstado);
    cargarCitas();
  } catch (error) {
    console.error('Error:', error);
    PetSpot.notify('Error al actualizar la cita');
  }
};

const eliminarCita = async function(id) {
  try {
    let email = sessionStorage.getItem('user_email');
    let response = await fetch(
      `http://127.0.0.1:8000/api/citas/${id}`,
      {
        method: 'DELETE',
        headers: {
          'x-user-email': email
        }
      }
    );
    if (!response.ok) {
      throw new Error('Error al eliminar cita');
    }
    PetSpot.notify('Cita eliminada');
    citas = citas.filter(c => c.id_cita !== id);
    renderCitas();
  }catch(error){
    console.error(error);
    PetSpot.notify('Error al eliminar la cita');
  }
};

const filterCitas = function(tipo, el) {
  filtroActual = tipo;
  let tabs = document.querySelectorAll('.tab');
  for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  if (el) el.classList.add('active');
  renderCitas();
};

const searchCitas = function(texto) {
  let tbody = document.getElementById('citas-body');
  let filas = tbody.querySelectorAll('tr');
  for (let i = 0; i < filas.length; i++) {
    let fila = filas[i];
    let textoFila = fila.textContent.toLowerCase();
    if (texto === '' || textoFila.indexOf(texto.toLowerCase()) !== -1) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  }
};

const closeModal = function() {
  let modales = document.querySelectorAll('.modal-overlay');
  for (let i = 0; i < modales.length; i++) modales[i].classList.remove('open');
};

const addCita = async function() {
  let clienteId = document.getElementById('nueva-cliente').value;
  let mascotaId = document.getElementById('nueva-mascota').value;
  let motivo = document.getElementById('nueva-motivo').value.trim();
  let fecha = document.getElementById('nueva-fecha').value;
  let hora = document.getElementById('nueva-hora').value;

  if (!clienteId || !mascotaId || !motivo || !fecha || !hora) {
    PetSpot.notify('Rellena todos los campos');
    return;
  }

  try {
    let email = sessionStorage.getItem('user_email');
    // CREA NUEV CITA
    let response = await fetch(`http://127.0.0.1:8000/citas`, { // HACER BIEN EL FETCH
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-email': email },
      body: JSON.stringify({
        cliente_id: clienteId,
        mascota_id: mascotaId,
        motivo: motivo,
        fecha: fecha,
        hora: hora
      })
    });
    if (!response.ok) throw new Error('Error al crear cita');
    PetSpot.notify('Cita creada correctamente');
    closeModal();
    cargarCitas();
  } catch (error) {
    console.error('Error:', error);
    PetSpot.notify('Error al crear la cita');
  }
};

document.getElementById('btn-nueva').addEventListener('click', function() {
  cargarClientesMascotas();
  document.getElementById('modal-nueva').classList.add('open');
});

const cargarClientesMascotas = async function() {
  try {
    let email = sessionStorage.getItem('user_email');
    // LISTA DE LOS CLIENTES DEL VET LOGEADO
    let response = await fetch(`http://127.0.0.1:8000/clientes`, { // HACER BIEN EL FETCH
      headers: { 'x-user-email': email }
    });
    if (!response.ok) throw new Error('Error al cargar clientes');
    let clientes = await response.json();
    let selectCliente = document.getElementById('nueva-cliente');
    while (selectCliente.options.length > 1) selectCliente.remove(1);
    for (let i = 0; i < clientes.length; i++) {
      let option = document.createElement('option');
      option.value = clientes[i].id_cliente;
      option.textContent = clientes[i].nombre;
      selectCliente.appendChild(option);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

document.getElementById('nueva-cliente').addEventListener('change', async function() {
  let clienteId = this.value;
  if (!clienteId) return;
  try {
    let email = sessionStorage.getItem('user_email');
    // LAS MASCOTAS DEUN LCIENTE EN ESPECIFICO
    let response = await fetch(`http://127.0.0.1:8000/mascotas/cliente/${clienteId}`, { // HACER BIEN EL FECTH
      headers: { 'x-user-email': email }
    });
    if (!response.ok) throw new Error('Error al cargar mascotas');
    let mascotas = await response.json();
    let selectMascota = document.getElementById('nueva-mascota');
    while (selectMascota.options.length > 1) selectMascota.remove(1);
    for (let i = 0; i < mascotas.length; i++) {
      let option = document.createElement('option');
      option.value = mascotas[i].id_mascota;
      option.textContent = mascotas[i].nombre;
      selectMascota.appendChild(option);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

cargarCitas();