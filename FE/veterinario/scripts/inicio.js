PetSpot.init('veterinario');
buildVetLayout('inicio');

ponerIcono(document.getElementById('icon-cal'),   Icons.calendar);
ponerIcono(document.getElementById('icon-euro'),  Icons.euro);
ponerIcono(document.getElementById('icon-users'), Icons.users);
ponerIcono(document.getElementById('icon-alert'), Icons.star);

let dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
let meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
let hoy = new Date();
let chipEl = document.getElementById('date-chip-vet');
if (chipEl) {
  chipEl.textContent = dias[hoy.getDay()] + ', ' + hoy.getDate() + ' de ' + meses[hoy.getMonth()] + ' ' + hoy.getFullYear();
}

let statsData = [
  { label: 'Citas hoy', value: '8', change: '↑ 2 más que ayer', icon: Icons.calendar },
  { label: 'Mensajes', value: '12', change: '3 sin responder', icon: Icons.chat },
  { label: 'Pedidos hoy', value: '5', change: '↑ 3 vs ayer', icon: Icons.shop },
  { label: 'Clientes activos', value: '127', change: '↑ 4 este mes', icon: Icons.users }
];

let statsGrid = document.getElementById('stats-grid');
for (let i = 0; i < statsData.length; i++) {
  let s = statsData[i];
  let div = crearEl('div', { className: 'stat-card' });

  let iconDiv = crearEl('div', { className: 'stat-icon' });
  ponerIcono(iconDiv, s.icon);

  div.appendChild(iconDiv);
  div.appendChild(crearEl('div', { className: 'stat-label', textContent: s.label }));
  div.appendChild(crearEl('div', { className: 'stat-value', textContent: s.value }));
  div.appendChild(crearEl('div', { className: 'stat-change', textContent: s.change }));
  statsGrid.appendChild(div);
}

let citasVet = Almacen.cargar('citas_vet');
let hoyCitas = document.getElementById('hoy-citas');

let citasDeHoy = [];
for (let i = 0; i < citasVet.length; i++) {
  if (citasVet[i].fecha === 'Hoy') citasDeHoy.push(citasVet[i]);
}

if (citasDeHoy.length === 0) {
  hoyCitas.appendChild(crearEl('p', {
    textContent: 'No hay citas programadas para hoy',
    style: { textAlign: 'center', color: 'var(--text3)', padding: '20px', fontSize: '13px' }
  }));
} else {
  for (let i = 0; i < citasDeHoy.length; i++) {
    let c = citasDeHoy[i];
    let card = crearEl('div', { className: 'cita-card' });

    let tDiv = crearEl('div', { className: 'cita-time' });
    tDiv.appendChild(crearEl('div', { className: 'hour', textContent: c.hora }));
    tDiv.appendChild(crearEl('div', { className: 'date', textContent: 'Hoy' }));

    let sep = crearEl('div', { className: 'cita-divider' });

    let iDiv = crearEl('div', { className: 'cita-info' });
    iDiv.appendChild(crearEl('div', { className: 'cita-title', textContent: c.motivo }));
    let sub = crearEl('div', { className: 'cita-sub' });
    sub.appendChild(document.createTextNode(c.cliente + ' · ' + c.mascota));
    iDiv.appendChild(sub);

    let badge = crearEl('span', {
      className: 'badge ' + (c.estado === 'confirmada' ? 'badge-green' : 'badge-orange'),
      textContent: c.estado
    });

    card.appendChild(tDiv);
    card.appendChild(sep);
    card.appendChild(iDiv);
    card.appendChild(badge);
    hoyCitas.appendChild(card);
  }
}

let clList = document.getElementById('clientes-list');
for (let i = 0; i < MockData.clientes.length; i++) {
  let cl = MockData.clientes[i];
  let row = crearEl('div', { className: 'client-row' });

  let av = crearEl('div', {
    className: 'topbar-avatar',
    textContent: cl.nombre[0],
    style: { width: '36px', height: '36px', fontSize: '14px', flexShrink: '0' }
  });

  let info = document.createElement('div');
  info.style.flex = '1';
  info.appendChild(crearEl('div', { style: { fontSize: '14px', fontWeight: '600' }, textContent: cl.nombre }));
  info.appendChild(crearEl('div', { style: { fontSize: '12px', color: 'var(--text2)' }, textContent: cl.mascotas.join(', ') }));

  let fecha = crearEl('div', { style: { fontSize: '12px', color: 'var(--text3)' }, textContent: cl.ultima });

  row.appendChild(av);
  row.appendChild(info);
  row.appendChild(fecha);
  clList.appendChild(row);
}

let alertas = [
  { tipo: 'warning', title: 'Stock bajo', sub: 'Vitaminas K9 Pro - 18 unidades' },
  { tipo: 'accent', title: 'Mensaje nuevo', sub: 'Ana González - hace 5 min' },
  { tipo: 'info', title: 'Recordatorio', sub: 'Próxima cita en 30 min - Kira' }
];

let colores = {
  warning: { bg: 'rgba(255,165,0,0.1)', border: 'rgba(255,165,0,0.3)', color: '#ffa500' },
  accent: { bg: 'var(--accent-light)', border: 'var(--accent)', color: 'var(--accent)' },
  info: { bg: 'rgba(83,184,202,0.1)', border: 'rgba(83,184,202,0.3)', color: '#53B8CA' }
};

let alertsList = document.getElementById('alerts-list');
for (let i = 0; i < alertas.length; i++) {
  let a = alertas[i];
  let cl = colores[a.tipo];
  let al = crearEl('div', { className: 'alert-item', style: { background: cl.bg, border: '1px solid ' + cl.border, marginBottom: '8px' } });
  al.appendChild(crearEl('div', { className: 'alert-item-title', style: { color: cl.color }, textContent: a.title }));
  al.appendChild(crearEl('div', { className: 'alert-item-sub', textContent: a.sub }));
  alertsList.appendChild(al);
}

let vals = [180, 220, 310, 280, 340, 190, 320];
let dias7 = ['L','M','X','J','V','S','D'];
let maxVal = 0;
for (let i = 0; i < vals.length; i++) {
  if (vals[i] > maxVal) maxVal = vals[i];
}

let chartEl = document.getElementById('ingr-chart');
let labelsEl = document.getElementById('ingr-labels');

for (let i = 0; i < vals.length; i++) {
  let h = Math.round((vals[i] / maxVal) * 76);
  let bar = crearEl('div', { className: 'bar-col' + (i === 4 ? ' today' : '') });
  bar.style.height = h + 'px';
  bar.style.pointerEvents = 'none';
  chartEl.appendChild(bar);
  labelsEl.appendChild(crearEl('span', { textContent: dias7[i] }));
}