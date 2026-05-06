PetSpot.init('veterinario');
buildVetLayout('suscripcion');

ponerIcono(document.getElementById('icon-check-chip'), Icons.check);
ponerIcono(document.getElementById('icon-card'),       Icons.card);

let planActual = PetSpot.getPlan();

const actualizarChip = function() {
  let nombres = { basico: 'Básico', profesional: 'Profesional', enterprise: 'Enterprise' };
  let chipEl  = document.getElementById('current-plan-name');
  if (chipEl) chipEl.textContent = nombres[planActual] || planActual;
};
actualizarChip();

let planes = [
  {
    id:    'basico',
    name:  'Básico',
    desc:  'Para clínicas pequeñas',
    price: '29€',
    period: '/mes',
    popular: false,
    features: [
      { text: 'Agenda de citas',         on: true  },
      { text: 'Chat limitado', on: true  },
      { text: 'Perfil de clínica',       on: true  },
      { text: 'Marketplace',             on: false },
      { text: 'Historial médico',        on: false }
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
      { text: 'Chat ilimitado',          on: true  },
      { text: 'Marketplace',             on: true  },
      { text: 'Historial médico',        on: true  },
      { text: 'Soporte prioritario',     on: false },
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
      { text: 'Todo lo del plan Profesional',    on: true },
      { text: 'Multi-sede',              on: true },
      { text: 'Soporte prioritario 24/7',on: true },
      { text: 'SLA garantizado',         on: true }
    ]
  }
];

const renderPlanes = function() {
  let grid = document.getElementById('plans-grid');
  while (grid.firstChild) grid.removeChild(grid.firstChild);

  for (let i = 0; i < planes.length; i++) {
    grid.appendChild(crearCardPlan(planes[i]));
  }
};

const crearCardPlan = function(p) {
  let actual  = planActual === p.id;
  let card    = crearEl('div', { className: 'plan-card' + (actual ? ' current-plan' : '') + (p.popular && !actual ? ' popular-plan' : '') });
  card.id = 'plan-card-' + p.id;

  if (actual) {
    let badge = crearEl('div', { className: 'plan-badge current-badge', textContent: '✓ Tu plan actual' });
    card.appendChild(badge);
  } else if (p.popular) {
    let badge = crearEl('div', { className: 'plan-badge popular-badge', textContent: 'Más popular' });
    card.appendChild(badge);
  }

  let iconDiv = crearEl('div', { className: 'plan-icon' });
  ponerIcono(iconDiv, Icons.box);
  card.appendChild(iconDiv);

  card.appendChild(crearEl('div', { className: 'plan-name', textContent: p.name }));
  card.appendChild(crearEl('div', { className: 'plan-desc', textContent: p.desc }));

  let priceDiv = crearEl('div', { className: 'plan-price' });
  priceDiv.appendChild(crearEl('span', { className: 'amount', textContent: p.price  }));
  priceDiv.appendChild(crearEl('span', { className: 'period', textContent: p.period }));
  card.appendChild(priceDiv);

  let lista = crearEl('ul', { className: 'plan-features' });
  for (let j = 0; j < p.features.length; j++) {
    let f  = p.features[j];
    let li = crearEl('li', { className: f.on ? 'enabled' : 'disabled' });
    let iconSpan = document.createElement('span');
    iconSpan.style.display = 'flex';
    iconSpan.style.width   = '14px';
    iconSpan.style.height  = '14px';
    ponerIcono(iconSpan, f.on ? Icons.check : Icons.x);
    li.appendChild(iconSpan);
    li.appendChild(document.createTextNode(' ' + f.text));
    lista.appendChild(li);
  }
  card.appendChild(lista);

  let btn;
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
};

const crearHandlerCambiarPlan = function(nuevoPlan) {
  return function() {
    PetSpot.setPlan(nuevoPlan);
    planActual = nuevoPlan;
    actualizarChip();
    renderPlanes();

    let nombres = { basico: 'Básico', profesional: 'Profesional', enterprise: 'Enterprise' };
    PetSpot.notify('Plan cambiado a ' + nombres[nuevoPlan] + '. Recargando menú...');

    setTimeout(function() {
      window.location.reload();
    }, 1500);
  };
};

let billing = [
  { fecha: '17/03/2026', plan: 'Básico', importe: '29.00€' },
  { fecha: '17/02/2026', plan: 'Básico', importe: '29.00€' },
  { fecha: '17/01/2026', plan: 'Básico', importe: '29.00€' }
];

let tbody = document.getElementById('billing-body');
for (let i = 0; i < billing.length; i++) {
  let b    = billing[i];
  let fila = document.createElement('tr');
  fila.appendChild(crearEl('td', { textContent: b.fecha   }));
  fila.appendChild(crearEl('td', { textContent: b.plan    }));
  let tdImp = document.createElement('td');
  tdImp.appendChild(crearEl('strong', { textContent: b.importe }));
  fila.appendChild(tdImp);
  let tdEst = document.createElement('td');
  tdEst.appendChild(crearEl('span', { className: 'badge badge-green', textContent: 'pagado' }));
  fila.appendChild(tdEst);
  let tdFac = document.createElement('td');
  let btnPdf = crearEl('button', { className: 'btn btn-ghost btn-sm', textContent: 'PDF' });
  tdFac.appendChild(btnPdf);
  fila.appendChild(tdFac);
  tbody.appendChild(fila);
}

renderPlanes();
