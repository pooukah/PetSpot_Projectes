PetSpot.init('veterinario');
buildVetLayout('inicio');

ponerIcono(document.getElementById('icon-cal'), Icons.calendar);
ponerIcono(document.getElementById('icon-cal-title'), Icons.calendar);
ponerIcono(document.getElementById('icon-euro'), Icons.euro);
ponerIcono(document.getElementById('icon-msg'), Icons.chat);
ponerIcono(document.getElementById('icon-shop'), Icons.shop);

let chartEl = document.getElementById('ingr-chart');
let labelsEl = document.getElementById('ingr-labels');
let chipEl = document.getElementById('date-chip-vet');
let hoyCitas = document.getElementById('hoy-citas');
let statCitas = document.getElementById('stat-citas');
let statPedidos = document.getElementById('stat-pedidos');

let todasLasCitas = [];
let citasDeHoy = [];
let vals = [180, 220, 310, 280, 340, 190, 320];
let dias7 = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
let maxVal = 0;
let hoy = new Date();
let dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
let meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
if (chipEl) {
  chipEl.textContent =
    dias[hoy.getDay()] +
    ', ' +
    hoy.getDate() +
    ' de ' +
    meses[hoy.getMonth()] +
    ' ' +
    hoy.getFullYear();
}

for (let i = 0; i < vals.length; i++) {
  if (vals[i] > maxVal) {
    maxVal = vals[i];
  }
}

for (let i = 0; i < vals.length; i++) {
  let h = Math.round((vals[i] / maxVal) * 76);
  let bar = crearEl('div', {
    className: 'bar-col' + (i === 4 ? ' today' : '')
  });
  bar.style.height = h + 'px';
  bar.style.pointerEvents = 'none';
  chartEl.appendChild(bar);
  labelsEl.appendChild(
    crearEl('span', {
      textContent: dias7[i]
    })
  );
}
const crearTarjetaCita = function(c) {
  let card = crearEl('div', { className: 'cita-card' });
  let timeDiv = crearEl('div', { className: 'cita-time' });
  let hourDiv = crearEl('div', {className: 'hour', textContent: c.hora.slice(0,5)});
  let dateDiv = crearEl('div', {className: 'date',textContent: c.fecha});

  timeDiv.appendChild(hourDiv);
  timeDiv.appendChild(dateDiv);

  let divider = crearEl('div', {className: 'cita-divider'});
  let infoDiv = crearEl('div', {className: 'cita-info'});
  let titleDiv = crearEl('div', {className: 'cita-title', textContent: c.motivo});
  let subDiv = crearEl('div', {className: 'cita-sub'});
  let pawSpan = document.createElement('span');

  ponerIcono(pawSpan, Icons.paw);

  subDiv.appendChild(pawSpan);

  subDiv.appendChild(document.createTextNode(' ' + c.mascota_nombre + ' · ' + c.cliente_nombre));
  infoDiv.appendChild(titleDiv);
  infoDiv.appendChild(subDiv);

  let badge = crearEl('span', {className: 'badge badge-green', textContent: c.estado});

  card.appendChild(timeDiv);
  card.appendChild(divider);
  card.appendChild(infoDiv);
  card.appendChild(badge);
  return card;
};

const cargarProximasCitas = async function() {
  try {
    let email = sessionStorage.getItem('user_email');
    let response = await fetch(
      'http://127.0.0.1:8000/api/citas/veterinario/mis-citas',
      {
        headers: {
          'x-user-email': email
        }
      }
    );
    if (!response.ok) {
      throw new Error('Error cargando citas');
    }
    todasLasCitas = await response.json();
    renderProximasCitas();
  } catch (error){
    console.error(error);
  }
};
function renderProximasCitas() {
  hoyCitas.textContent = '';
  let proximas = todasLasCitas.filter(c => c.estado === 'confirmada').slice(0, 3);

  if (proximas.length === 0) {
    let empty = crearEl('p', {
      textContent: 'No tienes citas próximas'
    });

    empty.style.textAlign = 'center';
    empty.style.color = 'var(--text3)';
    hoyCitas.appendChild(empty);
    return;
  }
  proximas.forEach(c => {
    hoyCitas.appendChild(crearTarjetaCita(c));
  });
}
const cargarCitasPendientes = async function() {
  try {
    let email = sessionStorage.getItem('user_email');
    let response = await fetch(
      'http://127.0.0.1:8000/api/citas/veterinario/mis-citas',
      {headers: {'x-user-email': email}});
    if (!response.ok) {
      throw new Error('Error al cargar citas');
    }
    let citas = await response.json();
    let pendientes = 0;
    for (let i = 0; i < citas.length; i++) {
      if (citas[i].estado === 'pendiente') {
        pendientes++;
      }
    }
    statCitas.textContent = pendientes;
  }catch (error) {
    console.error(error);
    statCitas.textContent = '0';
  }
};

const cargarPedidosPendientes = async function() {
  try {
    let email = sessionStorage.getItem('user_email');
    let response = await fetch(
      'http://127.0.0.1:8000/api/pedidos/veterinario/mis-pedidos',
      {
        headers: {
          'x-user-email': email
        }
      }
    );
    if (!response.ok) {
      throw new Error('Error al cargar pedidos');
    }
    let pedidos = await response.json();
    let pendientes = 0;
    for (let i = 0; i < pedidos.length; i++) {
      if (pedidos[i].estado === 'pendiente') {
        pendientes++;
      }
    }
    statPedidos.textContent = pendientes;
  }catch (error){
    console.error(error);
    statPedidos.textContent = '0';
  }
};

cargarCitasPendientes();
cargarPedidosPendientes();
cargarProximasCitas();