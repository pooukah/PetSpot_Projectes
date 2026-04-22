// PetSpot — Mapa del cliente
// Google Maps JavaScript API + filtro de un solo valor activo
// Sin innerHTML — todo con createElement

PetSpot.init('cliente');
buildClienteLayout('mapa');

ponerIcono(document.getElementById('icon-search'), Icons.search);

// ── Estado del mapa ──
var mapaGoogle      = null;    // Instancia del mapa de Google
var marcadores      = [];      // Marcadores en el mapa
var clinicasFiltradas = [];    // Clínicas visibles según el filtro activo
var filtroActivo    = 'todas'; // Qué filtro está seleccionado

// ============================================================
// INICIALIZAR EL MAPA DE GOOGLE
// Esta función la llama Google Maps automáticamente al cargarse
// ============================================================
function initMap() {
  var barcelona = { lat: 41.3874, lng: 2.1686 };

  mapaGoogle = new google.maps.Map(document.getElementById('google-map'), {
    center:           barcelona,
    zoom:             14,
    styles:           obtenerEstiloMapa(),
    disableDefaultUI: true,
    zoomControl:      true
  });

  // Al iniciar, mostrar todas las clínicas
  aplicarFiltro('todas', document.querySelector('.filter-chip'));
}

// Devuelve el estilo oscuro o claro del mapa según el tema actual
function obtenerEstiloMapa() {
  var oscuro = localStorage.getItem('ps_dark') !== 'false';
  if (!oscuro) return []; // Estilo por defecto (claro)
  return [
    { elementType: 'geometry',              stylers: [{ color: '#1e2535' }] },
    { elementType: 'labels.text.stroke',    stylers: [{ color: '#1e2535' }] },
    { elementType: 'labels.text.fill',      stylers: [{ color: '#8a91a8' }] },
    { featureType: 'road', elementType: 'geometry',        stylers: [{ color: '#161b26' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f1117' }] },
    { featureType: 'water', elementType: 'geometry',       stylers: [{ color: '#0f1117' }] },
    { featureType: 'poi',   elementType: 'geometry',       stylers: [{ color: '#1e2535' }] }
  ];
}

// ============================================================
// APLICAR FILTRO (solo uno activo a la vez)
// ============================================================
function aplicarFiltro(tipo, chipEl) {
  filtroActivo = tipo;

  // Quitar clase active de todos los chips y ponérsela solo al clicado
  var chips = document.querySelectorAll('.filter-chip');
  for (var i = 0; i < chips.length; i++) {
    chips[i].classList.remove('active');
  }
  if (chipEl) chipEl.classList.add('active');

  // Filtrar las clínicas según el tipo seleccionado
  clinicasFiltradas = [];
  for (var i = 0; i < MockData.clinicas.length; i++) {
    var c = MockData.clinicas[i];
    var mostrar = false;
    if (tipo === 'todas')     mostrar = true;
    if (tipo === '24h')       mostrar = c.h24;
    if (tipo === 'urgencias') mostrar = c.urgencias;
    if (tipo === 'abiertas')  mostrar = c.abierta;
    if (mostrar) clinicasFiltradas.push(c);
  }

  renderClinicas();
  if (mapaGoogle) actualizarMarcadores();
}

// ============================================================
// ACTUALIZAR MARCADORES EN EL MAPA
// ============================================================
function actualizarMarcadores() {
  // Quitar marcadores anteriores del mapa
  for (var i = 0; i < marcadores.length; i++) {
    marcadores[i].setMap(null);
  }
  marcadores = [];

  // Añadir un marcador por cada clínica filtrada
  for (var i = 0; i < clinicasFiltradas.length; i++) {
    var c = clinicasFiltradas[i];
    var marcador = new google.maps.Marker({
      position: { lat: c.lat, lng: c.lng },
      map:      mapaGoogle,
      title:    c.nombre,
      icon: {
        path:         google.maps.SymbolPath.CIRCLE,
        scale:        10,
        fillColor:    c.abierta ? '#6dd3b1' : '#545e7a',
        fillOpacity:  0.9,
        strokeColor:  '#fff',
        strokeWeight: 2
      }
    });

    // Clicar el marcador selecciona esa clínica en la lista
    marcador.addListener('click', crearHandlerMarcador(i));
    marcadores.push(marcador);
  }
}

function crearHandlerMarcador(idx) {
  return function() { seleccionarClinica(idx); };
}

// ============================================================
// RENDERIZAR LISTA DE CLÍNICAS (sin innerHTML)
// ============================================================
function renderClinicas() {
  var lista = document.getElementById('clinicas-list');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  if (clinicasFiltradas.length === 0) {
    lista.appendChild(crearEl('p', {
      textContent: 'No hay clínicas con este filtro',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '24px', fontSize: '13px' }
    }));
    return;
  }

  for (var i = 0; i < clinicasFiltradas.length; i++) {
    lista.appendChild(crearCardClinica(clinicasFiltradas[i], i));
  }
}

function crearCardClinica(c, idx) {
  var card = crearEl('div', { className: 'clinica-card' });
  card.dataset.idx = idx;

  // Fila superior: nombre + badge abierto/cerrado
  var topRow = document.createElement('div');
  topRow.style.display        = 'flex';
  topRow.style.alignItems     = 'flex-start';
  topRow.style.justifyContent = 'space-between';
  topRow.style.gap            = '8px';
  topRow.appendChild(crearEl('div', { className: 'clinica-name', textContent: c.nombre }));
  topRow.appendChild(crearEl('span', {
    className: 'badge ' + (c.abierta ? 'badge-green' : 'badge-red'),
    textContent: c.abierta ? 'Abierto' : 'Cerrado',
    style: { flexShrink: '0' }
  }));
  card.appendChild(topRow);

  // Dirección con icono de pin
  var dirRow = crearEl('div', { className: 'clinica-addr' });
  var pinSpan = document.createElement('span');
  pinSpan.style.display = 'flex';
  pinSpan.style.width   = '13px';
  pinSpan.style.height  = '13px';
  ponerIcono(pinSpan, Icons.pin);
  dirRow.appendChild(pinSpan);
  dirRow.appendChild(document.createTextNode(' ' + c.dir + ' · '));
  var distEl = crearEl('strong', { textContent: c.dist });
  dirRow.appendChild(distEl);
  card.appendChild(dirRow);

  // Estrellas + badges 24h/urgencias
  var metaRow = crearEl('div', { className: 'clinica-meta' });
  var stars = '';
  for (var s = 1; s <= 5; s++) {
    stars += s <= Math.floor(c.rating) ? '★' : '☆';
  }
  var starsEl = crearEl('span', { textContent: stars, style: { color: '#ffa500', fontSize: '13px' } });
  var ratingEl = crearEl('span', { textContent: c.rating, style: { fontSize: '12px', color: 'var(--text2)', marginLeft: '4px' } });
  metaRow.appendChild(starsEl);
  metaRow.appendChild(ratingEl);
  if (c.h24) {
    metaRow.appendChild(crearEl('span', { className: 'badge badge-blue', textContent: '24h', style: { marginLeft: '6px' } }));
  }
  if (c.urgencias) {
    metaRow.appendChild(crearEl('span', { className: 'badge badge-orange', textContent: 'Urgencias', style: { marginLeft: '4px' } }));
  }
  card.appendChild(metaRow);

  // Botones de acción
  var actionsRow = crearEl('div', { className: 'clinica-actions' });
  var btnTel = crearEl('button', { className: 'btn btn-ghost btn-sm' });
  var telIconSpan = document.createElement('span');
  telIconSpan.style.display = 'inline-flex';
  telIconSpan.style.width   = '13px';
  telIconSpan.style.height  = '13px';
  ponerIcono(telIconSpan, Icons.phone);
  btnTel.appendChild(telIconSpan);
  btnTel.appendChild(document.createTextNode(' ' + c.tel));
  actionsRow.appendChild(btnTel);
  card.appendChild(actionsRow);

  // Clicar la card selecciona la clínica
  card.addEventListener('click', crearHandlerSeleccionarClinica(idx));
  return card;
}

function crearHandlerSeleccionarClinica(idx) {
  return function() { seleccionarClinica(idx); };
}

// ============================================================
// SELECCIONAR UNA CLÍNICA (resaltar en lista y centrar mapa)
// ============================================================
function seleccionarClinica(idx) {
  var cards = document.querySelectorAll('.clinica-card');
  for (var i = 0; i < cards.length; i++) {
    cards[i].classList.toggle('active', parseInt(cards[i].dataset.idx) === idx);
  }
  // Hacer scroll suave hasta la card
  if (cards[idx]) {
    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  // Centrar el mapa en la clínica seleccionada
  if (mapaGoogle && clinicasFiltradas[idx]) {
    mapaGoogle.setCenter({ lat: clinicasFiltradas[idx].lat, lng: clinicasFiltradas[idx].lng });
    mapaGoogle.setZoom(16);
  }
}
