// PetSpot — Analíticas (solo plan Enterprise)
// Sin innerHTML — todo con createElement y appendChild

PetSpot.init('veterinario');

// Redirigir si no tiene plan Enterprise
if (PetSpot.getPlan() !== 'enterprise') {
  window.location.href = 'suscripcion.html';
}

buildVetLayout('analiticas');

// ── Iconos ──
ponerIcono(document.getElementById('icon-export'),     Icons.send);
ponerIcono(document.getElementById('icon-paw-chart'),  Icons.paw);
ponerIcono(document.getElementById('icon-steth'),      Icons.stethoscope);
ponerIcono(document.getElementById('icon-cal-chart'),  Icons.calendar);
ponerIcono(document.getElementById('icon-euro-chart'), Icons.euro);
ponerIcono(document.getElementById('icon-dog-chart'),  Icons.dog);
ponerIcono(document.getElementById('icon-cat-chart'),  Icons.cat);

// ── KPIs (sin "clientes activos") ──
var kpis = [
  { value: '342',    label: 'Citas este mes'   },
  { value: '8,240€', label: 'Ingresos mes'     },
  { value: '4.8 ★',  label: 'Valoración media' },
  { value: '89%',    label: 'Tasa de retorno'  }
];

var kpiRow = document.getElementById('kpi-row');
for (var i = 0; i < kpis.length; i++) {
  var card = crearEl('div', { className: 'kpi-card' });
  card.appendChild(crearEl('div', { className: 'kpi-value', textContent: kpis[i].value }));
  card.appendChild(crearEl('div', { className: 'kpi-label', textContent: kpis[i].label }));
  kpiRow.appendChild(card);
}

// ── Leyenda del donut ──
var species = [
  { label: 'Perros',  pct: '55%', color: 'var(--accent)' },
  { label: 'Gatos',   pct: '28%', color: '#53B8CA'        },
  { label: 'Conejos', pct: '12%', color: '#f0c040'        },
  { label: 'Otros',   pct: '5%',  color: '#f0a080'        }
];

var legend = document.getElementById('donut-legend');
for (var i = 0; i < species.length; i++) {
  var s   = species[i];
  var row = crearEl('div', { className: 'legend-row' });
  var dot = crearEl('div', { className: 'legend-dot' });
  dot.style.background = s.color;
  var label = crearEl('span', { textContent: s.label, style: { color: 'var(--text2)' } });
  var pct   = crearEl('span', { className: 'legend-pct', textContent: s.pct });
  row.appendChild(dot);
  row.appendChild(label);
  row.appendChild(pct);
  legend.appendChild(row);
}

// ── Motivos de consulta generales ──
var motivos = [
  { label: 'Revisión anual',  val: 89, color: 'var(--accent)' },
  { label: 'Vacunación',      val: 67, color: '#53B8CA'        },
  { label: 'Dermatitis',      val: 34, color: '#f0c040'        },
  { label: 'Gastroenteritis', val: 28, color: '#f0a080'        },
  { label: 'Traumatismo',     val: 19, color: '#c080f0'        },
  { label: 'Dental',          val: 15, color: '#80c0f0'        }
];

function renderBarrasH(contenedorId, datos, maxVal) {
  var contenedor = document.getElementById(contenedorId);
  for (var i = 0; i < datos.length; i++) {
    var d   = datos[i];
    var row = crearEl('div', { className: 'motivo-row' });

    var lbl   = crearEl('div', { className: 'motivo-label', textContent: d.label });
    var track = crearEl('div', { className: 'motivo-track' });
    var fill  = crearEl('div', { className: 'motivo-fill' });
    fill.style.width      = Math.round(d.val / maxVal * 100) + '%';
    fill.style.background = d.color;
    track.appendChild(fill);

    var val = crearEl('div', { className: 'motivo-val', textContent: String(d.val) });

    row.appendChild(lbl);
    row.appendChild(track);
    row.appendChild(val);
    contenedor.appendChild(row);
  }
}

var maxMotivo = 89;
renderBarrasH('motivos-chart', motivos, maxMotivo);

// ── Distribución por edad ──
var ages = [
  { label: '0-1a',  val: 18, color: 'var(--accent)' },
  { label: '1-3a',  val: 32, color: '#53B8CA'        },
  { label: '3-6a',  val: 42, color: 'var(--accent)' },
  { label: '6-9a',  val: 24, color: '#53B8CA'        },
  { label: '9-12a', val: 8,  color: 'var(--accent)' },
  { label: '+12a',  val: 3,  color: '#f0a080'        }
];

var maxAge  = 42;
var ageEl   = document.getElementById('age-chart');
for (var i = 0; i < ages.length; i++) {
  var a    = ages[i];
  var h    = Math.round((a.val / maxAge) * 96);
  var wrap = crearEl('div', { className: 'age-bar-wrap' });
  var bar  = crearEl('div', { className: 'age-bar' });
  bar.style.height     = h + 'px';
  bar.style.background = a.color;
  bar.style.opacity    = '0.85';
  var lbl = crearEl('div', { className: 'age-bar-label', textContent: a.label });
  wrap.appendChild(bar);
  wrap.appendChild(lbl);
  ageEl.appendChild(wrap);
}

// ── Ingresos mensuales ──
var monthly = [
  { label: 'Ene', val: 6200,  current: false },
  { label: 'Feb', val: 7100,  current: false },
  { label: 'Mar', val: 8240,  current: true  }
];
var maxMo   = 8240;
var moEl    = document.getElementById('monthly-chart');
var futuros = ['Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

for (var i = 0; i < monthly.length; i++) {
  var mo   = monthly[i];
  var h    = Math.round((mo.val / maxMo) * 96);
  var wrap = crearEl('div', { className: 'month-bar-wrap' });
  var val  = crearEl('div', { className: 'month-value', textContent: (mo.val / 1000).toFixed(1) + 'k€' });
  var bar  = crearEl('div', { className: 'month-bar' + (mo.current ? ' current' : '') });
  bar.style.height = h + 'px';
  var lbl  = crearEl('div', { className: 'month-label', textContent: mo.label });
  wrap.appendChild(val);
  wrap.appendChild(bar);
  wrap.appendChild(lbl);
  moEl.appendChild(wrap);
}

// Meses futuros (sin datos)
for (var i = 0; i < futuros.length; i++) {
  var wrap = crearEl('div', { className: 'month-bar-wrap' });
  wrap.style.opacity = '0.25';
  var valFuturo = crearEl('div', { className: 'month-value' });
  valFuturo.style.visibility = 'hidden';
  valFuturo.textContent = '—';
  var barFuturo = crearEl('div', {});
  barFuturo.style.cssText = 'width:100%;height:14px;border-radius:5px 5px 0 0;background:var(--bg3);border-top:2px dashed var(--border)';
  var lblFuturo = crearEl('div', { className: 'month-label', textContent: futuros[i] });
  wrap.appendChild(valFuturo);
  wrap.appendChild(barFuturo);
  wrap.appendChild(lblFuturo);
  moEl.appendChild(wrap);
}

// ── Patologías por especie: PERROS ──
var dogConditions = [
  { label: 'Dermatitis',          val: 28, color: '#f0c040' },
  { label: 'Displasia de cadera', val: 18, color: '#f0a080' },
  { label: 'Otitis',              val: 15, color: '#c080f0' },
  { label: 'Obesidad',            val: 12, color: '#80c0f0' },
  { label: 'Epilepsia',           val: 7,  color: '#f08060' }
];
renderBarrasH('dog-conditions', dogConditions, 28);

// ── Patologías por especie: GATOS ──
var catConditions = [
  { label: 'Enfermedad renal', val: 22, color: '#53B8CA' },
  { label: 'Gingivitis',       val: 17, color: '#f0a080' },
  { label: 'Hipertiroidismo',  val: 11, color: '#c080f0' },
  { label: 'Urolitiasis',      val: 9,  color: '#f0c040' },
  { label: 'Anemia',           val: 5,  color: '#f08060' }
];
renderBarrasH('cat-conditions', catConditions, 22);

// ── Tratamientos más prescritos ──
var tratamientos = [
  { nombre: 'Antibióticos',      nPrescr: 54, especie: 'Perro + Gato' },
  { nombre: 'Antiparasitarios',  nPrescr: 48, especie: 'Todos'         },
  { nombre: 'Antiinflamatorios', nPrescr: 37, especie: 'Perro'         },
  { nombre: 'Vacuna rabia',      nPrescr: 29, especie: 'Perro + Gato' },
  { nombre: 'Corticoides',       nPrescr: 21, especie: 'Perro'         },
  { nombre: 'Probióticos',       nPrescr: 18, especie: 'Todos'         }
];

var tBody = document.getElementById('tratamientos-body');
for (var i = 0; i < tratamientos.length; i++) {
  var t    = tratamientos[i];
  var fila = document.createElement('tr');

  var tdNombre = document.createElement('td');
  tdNombre.appendChild(crearEl('strong', { textContent: t.nombre }));

  var tdEspecie = crearEl('td', { textContent: t.especie, style: { color: 'var(--text2)' } });

  var tdNum = document.createElement('td');
  tdNum.appendChild(crearEl('strong', { textContent: String(t.nPrescr), style: { color: 'var(--accent)' } }));

  fila.appendChild(tdNombre);
  fila.appendChild(tdEspecie);
  fila.appendChild(tdNum);
  tBody.appendChild(fila);
}
