PetSpot.init('cliente');
buildClienteLayout('citas');

ponerIcono(document.getElementById('btn-nueva-icon'), Icons.plus);
ponerIcono(document.getElementById('icon-x'),         Icons.x);
ponerIcono(document.getElementById('icon-cal2'),      Icons.calendar);

let listaCitas = Almacen.cargar('citas');

const cargarMascotasCliente = async function() {
  const email = localStorage.getItem('user_email');
  console.log(email);
  if (!email) return;
  
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/mascotas/mis-mascotas`, {
      headers: { "x-user-email": email }
    });
    
    if (!response.ok) throw new Error('Error al cargar mascotas');
    
    const mascotas = await response.json();
    console.log(mascotas);
    const select = document.getElementById('nueva-mascota');
    
    if (select) {
      while (select.options.length > 0) {
        select.remove(0);
      }

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '— Selecciona —';
      select.appendChild(defaultOption);
      
      for (let i = 0; i < mascotas.length; i++) {
        const option = document.createElement('option');
        option.value = mascotas[i].id;
        option.textContent = mascotas[i].nombre + ' (' + mascotas[i].especie + ')';
        select.appendChild(option);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const cargarVeterinariosCliente = async function() {
  const email = localStorage.getItem('user_email');

  if (!email) return;

  try {
    const response = await fetch('http://127.0.0.1:8000/api/veterinarios/mis-veterinarios', {
      headers: { "x-user-email": email }
    });

    if (!response.ok) {
      throw new Error('Error al cargar veterinarios');
    }

    const veterinarios = await response.json();

    console.log(veterinarios);

    const select = document.getElementById('nueva-vet');

    if (select) {

      while (select.options.length > 0) {
        select.remove(0);
      }

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '— Selecciona —';
      select.appendChild(defaultOption);

      for (let i = 0; i < veterinarios.length; i++) {

        const vet = veterinarios[i];

        const option = document.createElement('option');

        option.value = vet.id;

        option.textContent =
          vet.nombre + ' ' +
          vet.apellidos + ' — ' +
          vet.clinica;

        select.appendChild(option);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
};

const switchTab = function(tab, el) {
  document.getElementById('tab-proximas').style.display   = 'none';
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
    if (listaCitas[i].estado !== 'cancelada') {
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

const cancelarCita = async function(id, cardEl) {

  try {

    const email = localStorage.getItem('user_email');

    const response = await fetch(
      `http://127.0.0.1:8000/api/citas/${id}`,
      {
        method: 'DELETE',
        headers: {
          'x-user-email': email
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al eliminar cita');
    }

    cardEl.style.transition = 'opacity 0.3s, transform 0.3s';
    cardEl.style.opacity = '0';
    cardEl.style.transform = 'translateX(20px)';

    setTimeout(function() {
      if (cardEl.parentNode) {
        cardEl.parentNode.removeChild(cardEl);
      }
    }, 300);

    listaCitas = listaCitas.filter(c => c.id !== id);

    Almacen.guardar('citas', listaCitas);

    PetSpot.notify('Cita cancelada');

  } catch (error) {

    console.error(error);

    PetSpot.notify('Error al cancelar la cita');
  }
};

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

const solicitarCita = async function() {

  let mascota = document.getElementById('nueva-mascota').value;

  let vetSelectEl = document.getElementById('nueva-vet');
  let vetId = vetSelectEl.value;
  let vetTexto = vetSelectEl.options[vetSelectEl.selectedIndex].text;

  let motivo = document.getElementById('nueva-motivo').value.trim();
  let fechaInput = document.getElementById('nueva-fecha').value;
  let horaInput = document.getElementById('nueva-hora').value;

  if (!mascota || !motivo || !fechaInput || !horaInput || !vetId) {
    PetSpot.notify('Por favor, rellena todos los campos');
    return;
  }

  try {

    const email = localStorage.getItem('user_email');

    const response = await fetch('http://127.0.0.1:8000/api/citas/crear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': email
      },
      body: JSON.stringify({
        id_veterinario: parseInt(vetId),
        id_mascota: parseInt(mascota),
        fecha: fechaInput,
        hora: horaInput,
        motivo: motivo
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al crear cita');
    }

    let partes = fechaInput.split('-');

    let nueva = {
      id: data.id_cita,
      hora: horaInput,
      fecha: partes[2] + '/' + partes[1],
      fechaISO: fechaInput,
      id_veterinario: vetId,
      veterinario: vetTexto.split(' — ')[0],
      mascota: document.getElementById('nueva-mascota')
        .options[document.getElementById('nueva-mascota').selectedIndex]
        .text.split(' (')[0],
      motivo: motivo,
      estado: 'pendiente',
      clinica: vetTexto.split(' — ')[1] || 'PetSpot'
    };

    listaCitas.push(nueva);

    Almacen.guardar('citas', listaCitas);

    closeModal();

    renderProximas();

    PetSpot.notify('Cita creada correctamente');

    document.getElementById('nueva-motivo').value = '';
    document.getElementById('nueva-fecha').value = '';

  } catch (error) {

    console.error(error);

    PetSpot.notify('Error al crear la cita');
  }
};

document.getElementById('btn-nueva').addEventListener('click', async function() {
  await cargarMascotasCliente();
  await cargarVeterinariosCliente();
  document.getElementById('modal-cita').classList.add('open');
});
renderProximas();
