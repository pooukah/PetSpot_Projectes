// PetSpot — Suscripción del veterinario
// Puedes cambiar entre cualquiera de los tres planes
// El plan Enterprise desbloquea la página de Analíticas en el menú

PetSpot.init('veterinario');
buildVetLayout('suscripcion');

ponerIcono(document.getElementById('icon-check-chip'), Icons.check);
ponerIcono(document.getElementById('icon-card'),       Icons.card);

// Plan actual (guardado en localStorage)
var planActual = PetSpot.getPlan();

// Actualizar el chip del encabezado
function actualizarChip() {
  var nombres = { basico: 'Básico', profesional: 'Profesional', enterprise: 'Enterprise' };
  var chipEl  = document.getElementById('current-plan-name');
  if (chipEl) chipEl.textContent = nombres[planActual] || planActual;
}
actualizarChip();

// ── Definición de los planes ──
var planes = [
  {
    id:    'basico',
    name:  'Básico',
    desc:  'Para clínicas pequeñas',
    price: '29€',
    period: '/mes',
    popular: false,
    features: [
      { text: 'Agenda de citas',         on: true  },
      { text: 'Hasta 50 clientes',       on: true  },
      { text: 'Chat limitado (100/mes)', on: true  },
      { text: 'Perfil de clínica',       on: true  },
      { text: 'Marketplace',             on: false },
      { text: 'Historial médico',        on: false },
      { text: 'Analíticas avanzadas',    on: false }
    ]
  },
  {
    id:    'profesional',
    name:  'Profesional',
    desc:  'Para clínicas en crecimiento',
    price: '79€',
    period: '/mes',
    popular: true,
    features: [
      { text: 'Todo lo del plan Básico', on: true  },
      { text: 'Clientes ilimitados',     on: true  },
      { text: 'Chat ilimitado',          on: true  },
      { text: 'Marketplace',             on: true  },
      { text: 'Historial médico',        on: true  },
      { text: 'Soporte prioritario',     on: false },
      { text: 'Analíticas avanzadas',    on: false }
    ]
  },
  {
    id:    'enterprise',
    name:  'Enterprise',
    desc:  'Para grupos veterinarios',
    price: 'A medida',
    period: '',
    popular: false,
    features: [
      { text: 'Todo lo del plan Pro',    on: true },
      { text: 'Multi-sede',              on: true },
      { text: 'API de integración',      on: true },
      { text: 'Analíticas avanzadas',    on: true }, // <-- Esto desbloquea la página
      { text: 'Soporte prioritario 24/7',on: true },
      { text: 'SLA garantizado',         on: true }
    ]
  }
];

// ============================================================
// RENDER DE LAS TARJETAS DE PLAN
// ============================================================
function renderPlanes() {
  var grid = document.getElementById('plans-grid');
  while (grid.firstChild) grid.removeChild(grid.firstChild);

  for (var i = 0; i < planes.length; i++) {
    grid.appendChild(crearCardPlan(planes[i]));
  }
}

function crearCardPlan(p) {
  var actual  = planActual === p.id;
  var card    = crearEl('div', { className: 'plan-card' + (actual ? ' current-plan' : '') + (p.popular && !actual ? ' popular-plan' : '') });
  card.id = 'plan-card-' + p.id;

  // Badge encima
  if (actual) {
    var badge = crearEl('div', { className: 'plan-badge current-badge', textContent: '✓ Tu plan actual' });
    card.appendChild(badge);
  } else if (p.popular) {
    var badge = crearEl('div', { className: 'plan-badge popular-badge', textContent: '⭐ Más popular' });
    card.appendChild(badge);
  }

  // Icono
  var iconDiv = crearEl('div', { className: 'plan-icon' });
  ponerIcono(iconDiv, Icons.box);
  card.appendChild(iconDiv);

  card.appendChild(crearEl('div', { className: 'plan-name', textContent: p.name }));
  card.appendChild(crearEl('div', { className: 'plan-desc', textContent: p.desc }));

  // Precio
  var priceDiv = crearEl('div', { className: 'plan-price' });
  priceDiv.appendChild(crearEl('span', { className: 'amount', textContent: p.price  }));
  priceDiv.appendChild(crearEl('span', { className: 'period', textContent: p.period }));
  card.appendChild(priceDiv);

  // Características
  var lista = crearEl('ul', { className: 'plan-features' });
  for (var j = 0; j < p.features.length; j++) {
    var f  = p.features[j];
    var li = crearEl('li', { className: f.on ? 'enabled' : 'disabled' });
    var iconSpan = document.createElement('span');
    iconSpan.style.display = 'flex';
    iconSpan.style.width   = '14px';
    iconSpan.style.height  = '14px';
    ponerIcono(iconSpan, f.on ? Icons.check : Icons.x);
    li.appendChild(iconSpan);
    li.appendChild(document.createTextNode(' ' + f.text));
    lista.appendChild(li);
  }
  card.appendChild(lista);

  // Botón
  var btn;
  if (actual) {
    btn = crearEl('button', { className: 'btn btn-ghost', textContent: 'Plan actual' });
    btn.style.width         = '100%';
    btn.style.justifyContent = 'center';
    btn.style.opacity       = '0.7';
    btn.disabled = true;
  } else if (p.id === 'enterprise') {
    btn = crearEl('button', { className: 'btn btn-ghost', textContent: 'Cambiar a Enterprise' });
    btn.style.width         = '100%';
    btn.style.justifyContent = 'center';
    btn.addEventListener('click', crearHandlerCambiarPlan(p.id));
  } else {
    btn = crearEl('button', { className: 'btn btn-primary', textContent: 'Cambiar a este plan' });
    btn.style.width         = '100%';
    btn.style.justifyContent = 'center';
    btn.addEventListener('click', crearHandlerCambiarPlan(p.id));
  }
  card.appendChild(btn);
  return card;
}

// Función que cambia el plan
function crearHandlerCambiarPlan(nuevoPlan) {
  return function() {
    PetSpot.setPlan(nuevoPlan);
    planActual = nuevoPlan;
    actualizarChip();
    renderPlanes();

    var nombres = { basico: 'Básico', profesional: 'Profesional', enterprise: 'Enterprise' };
    PetSpot.notify('✅ Plan cambiado a ' + nombres[nuevoPlan] + '. Recargando menú...');

    // Recargar la página para que el menú se actualice
    // (el sidebar se genera al cargar con el plan guardado)
    setTimeout(function() {
      window.location.reload();
    }, 1500);
  };
}

// ── Historial de facturación ──
var billing = [
  { fecha: '17/03/2026', plan: 'Básico', importe: '29.00€' },
  { fecha: '17/02/2026', plan: 'Básico', importe: '29.00€' },
  { fecha: '17/01/2026', plan: 'Básico', importe: '29.00€' }
];

var tbody = document.getElementById('billing-body');
for (var i = 0; i < billing.length; i++) {
  var b    = billing[i];
  var fila = document.createElement('tr');
  fila.appendChild(crearEl('td', { textContent: b.fecha   }));
  fila.appendChild(crearEl('td', { textContent: b.plan    }));
  var tdImp = document.createElement('td');
  tdImp.appendChild(crearEl('strong', { textContent: b.importe }));
  fila.appendChild(tdImp);
  var tdEst = document.createElement('td');
  tdEst.appendChild(crearEl('span', { className: 'badge badge-green', textContent: 'pagado' }));
  fila.appendChild(tdEst);
  var tdFac = document.createElement('td');
  var btnPdf = crearEl('button', { className: 'btn btn-ghost btn-sm', textContent: 'PDF' });
  tdFac.appendChild(btnPdf);
  fila.appendChild(tdFac);
  tbody.appendChild(fila);
}

// ── Render inicial ──
renderPlanes();
