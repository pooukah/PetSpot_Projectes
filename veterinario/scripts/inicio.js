// PetSpot — Inicio del veterinario
// Datos sincronizados con Firestore

PetSpot.init('veterinario');
buildVetLayout('inicio');

// Cargar datos desde Firestore al iniciar
PetSpot.loadUserFromFirestore(function() {
  renderCitasHoy();
});

// Iconos
ponerIcono(document.getElementById('icon-cal'),   Icons.calendar);
ponerIcono(document.getElementById('icon-euro'),  Icons.euro);
ponerIcono(document.getElementById('icon-users'), Icons.users);
ponerIcono(document.getElementById('icon-alert'), Icons.star);

// ── Fecha actual ──
var dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
var meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var hoy   = new Date();
var chipEl = document.getElementById('date-chip-vet');
if (chipEl) {
  chipEl.textContent = dias[hoy.getDay()] + ', ' + hoy.getDate() + ' de ' + meses[hoy.getMonth()] + ' ' + hoy.getFullYear();
}

// ── Stats (Pedidos hoy en vez de ingresos) ──
var statsData = [
  { label: 'Citas hoy',       value: '8',    change: '↑ 2 más que ayer', icon: Icons.calendar },
  { label: 'Mensajes',        value: '12',   change: '3 sin responder',   icon: Icons.chat     },
  { label: 'Pedidos hoy',     value: '5',    change: '↑ 3 vs ayer',      icon: Icons.shop     },
  { label: 'Clientes activos',value: '127',  change: '↑ 4 este mes',     icon: Icons.users    }
];

var statsGrid = document.getElementById('stats-grid');
for (var i = 0; i < statsData.length; i++) {
  var s   = statsData[i];
  var div = crearEl('div', { className: 'stat-card' });

  var iconDiv = crearEl('div', { className: 'stat-icon' });
  ponerIcono(iconDiv, s.icon);

  div.appendChild(iconDiv);
  div.appendChild(crearEl('div', { className: 'stat-label',  textContent: s.label  }));
  div.appendChild(crearEl('div', { className: 'stat-value',  textContent: s.value  }));
  div.appendChild(crearEl('div', { className: 'stat-change', textContent: s.change }));
  statsGrid.appendChild(div);
}

// ── Citas de hoy (desde localStorage/Firestore) ──
function renderCitasHoy() {
  var citasVet  = Almacen.cargar('citas_vet');
  var hoyCitas  = document.getElementById('hoy-citas');
  while (hoyCitas.firstChild) hoyCitas.removeChild(hoyCitas.firstChild);

  var citasDeHoy = [];
  for (var i = 0; i < citasVet.length; i++) {
    if (citasVet[i].fecha === 'Hoy') citasDeHoy.push(citasVet[i]);
  }

  if (citasDeHoy.length === 0) {
    hoyCitas.appendChild(crearEl('p', {
      textContent: 'No hay citas programadas para hoy',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '20px', fontSize: '13px' }
    }));
  } else {
    for (var i = 0; i < citasDeHoy.length; i++) {
      var c    = citasDeHoy[i];
      var card = crearEl('div', { className: 'cita-card' });

      var tDiv = crearEl('div', { className: 'cita-time' });
      tDiv.appendChild(crearEl('div', { className: 'hour', textContent: c.hora   }));
      tDiv.appendChild(crearEl('div', { className: 'date', textContent: 'Hoy'   }));

      var sep = crearEl('div', { className: 'cita-divider' });

      var iDiv = crearEl('div', { className: 'cita-info' });
      iDiv.appendChild(crearEl('div', { className: 'cita-title', textContent: c.motivo  }));
      var sub  = crearEl('div', { className: 'cita-sub' });
      sub.appendChild(document.createTextNode(c.cliente + ' · ' + c.mascota));
      iDiv.appendChild(sub);

      var badge = crearEl('span', {
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
}

// Render inicial con datos locales
renderCitasHoy();

// ── Clientes recientes ──
var clList = document.getElementById('clientes-list');
for (var i = 0; i < MockData.clientes.length; i++) {
  var cl  = MockData.clientes[i];
  var row = crearEl('div', { className: 'client-row' });

  var av = crearEl('div', {
    className: 'topbar-avatar',
    textContent: cl.nombre[0],
    style: { width: '36px', height: '36px', fontSize: '14px', flexShrink: '0' }
  });

  var info = document.createElement('div');
  info.style.flex = '1';
  info.appendChild(crearEl('div', { style: { fontSize: '14px', fontWeight: '600' }, textContent: cl.nombre }));
  info.appendChild(crearEl('div', { style: { fontSize: '12px', color: 'var(--text2)' }, textContent: cl.mascotas.join(', ') }));

  var fecha = crearEl('div', { style: { fontSize: '12px', color: 'var(--text3)' }, textContent: cl.ultima });

  row.appendChild(av);
  row.appendChild(info);
  row.appendChild(fecha);
  clList.appendChild(row);
}

// ── Alertas ──
var alertas = [
  { tipo: 'warning', title: '⚠️ Stock bajo',     sub: 'Vitaminas K9 Pro — 18 unidades' },
  { tipo: 'accent',  title: '💬 Mensaje nuevo',   sub: 'Ana González — hace 5 min'      },
  { tipo: 'info',    title: '📅 Recordatorio',    sub: 'Próxima cita en 30 min — Kira'  }
];
var colores = {
  warning: { bg: 'rgba(255,165,0,0.1)',  border: 'rgba(255,165,0,0.3)',  color: '#ffa500'       },
  accent:  { bg: 'var(--accent-light)',  border: 'var(--accent)',         color: 'var(--accent)' },
  info:    { bg: 'rgba(83,184,202,0.1)', border: 'rgba(83,184,202,0.3)', color: '#53B8CA'       }
};

var alertsList = document.getElementById('alerts-list');
for (var i = 0; i < alertas.length; i++) {
  var a  = alertas[i];
  var cl = colores[a.tipo];
  var al = crearEl('div', { className: 'alert-item', style: { background: cl.bg, border: '1px solid ' + cl.border, marginBottom: '8px' } });
  al.appendChild(crearEl('div', { className: 'alert-item-title', style: { color: cl.color }, textContent: a.title }));
  al.appendChild(crearEl('div', { className: 'alert-item-sub', textContent: a.sub }));
  alertsList.appendChild(al);
}

// ── Gráfica de barras (sin cursor de puntero) ──
var vals   = [180, 220, 310, 280, 340, 190, 320];
var dias7  = ['L','M','X','J','V','S','D'];
var maxVal = 0;
for (var i = 0; i < vals.length; i++) {
  if (vals[i] > maxVal) maxVal = vals[i];
}

var chartEl  = document.getElementById('ingr-chart');
var labelsEl = document.getElementById('ingr-labels');

for (var i = 0; i < vals.length; i++) {
  var h   = Math.round((vals[i] / maxVal) * 76);
  var bar = crearEl('div', { className: 'bar-col' + (i === 4 ? ' today' : '') });
  bar.style.height        = h + 'px';
  bar.style.pointerEvents = 'none'; // Sin cursor de clic
  chartEl.appendChild(bar);

  labelsEl.appendChild(crearEl('span', { textContent: dias7[i] }));
}
