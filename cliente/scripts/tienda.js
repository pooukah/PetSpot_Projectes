// PetSpot — Tienda del cliente
// Carrito en memoria, pedidos persistentes en localStorage

PetSpot.init('cliente');
buildClienteLayout('tienda');

ponerIcono(document.getElementById('icon-search'), Icons.search);
ponerIcono(document.getElementById('icon-cart'),   Icons.shop);
ponerIcono(document.getElementById('icon-check'),  Icons.check);

// ── Categorías ──
var categorias = ['Todas'];
for (var i = 0; i < MockData.productos.length; i++) {
  if (categorias.indexOf(MockData.productos[i].cat) === -1) {
    categorias.push(MockData.productos[i].cat);
  }
}

var categoriaActiva = 'Todas';

// ── Carrito en memoria (no hace falta persistirlo) ──
var carrito = {};

// ── Pedidos persistentes ──
var misPedidos = Almacen.cargar('pedidos');

// ── Construir filtros de categoría ──
var filtrosEl = document.getElementById('cat-filters');
for (var i = 0; i < categorias.length; i++) {
  var chip = crearEl('div', {
    className: 'filter-chip' + (categorias[i] === 'Todas' ? ' active' : ''),
    textContent: categorias[i]
  });
  chip.addEventListener('click', crearHandlerCategoria(categorias[i], chip));
  filtrosEl.appendChild(chip);
}

// Función auxiliar para el closure del filtro
function crearHandlerCategoria(cat, chip) {
  return function() {
    categoriaActiva = cat;
    var chips = document.querySelectorAll('.cat-filters .filter-chip');
    for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
    chip.classList.add('active');
    renderProductos();
  };
}

// ── Buscar productos ──
function filterProducts() {
  renderProductos();
}

// ============================================================
// RENDER DE PRODUCTOS
// ============================================================
function renderProductos() {
  var query = document.getElementById('search-input').value.toLowerCase();
  var grid  = document.getElementById('products-grid');
  while (grid.firstChild) grid.removeChild(grid.firstChild);

  var hayAlguno = false;
  for (var i = 0; i < MockData.productos.length; i++) {
    var p = MockData.productos[i];
    if (!p.visible) continue;
    if (categoriaActiva !== 'Todas' && p.cat !== categoriaActiva) continue;
    if (query && p.nombre.toLowerCase().indexOf(query) === -1) continue;

    grid.appendChild(crearCardProducto(p));
    hayAlguno = true;
  }

  if (!hayAlguno) {
    grid.appendChild(crearEl('p', {
      textContent: 'No se encontraron productos',
      style: { color: 'var(--text3)', padding: '24px', fontSize: '13px', gridColumn: '1/-1' }
    }));
  }
}

// Crea la tarjeta de un producto
function crearCardProducto(p) {
  var card = crearEl('div', { className: 'product-card' });

  // Imagen o icono (preparado para foto futura)
  var imgDiv = crearEl('div', { className: 'product-img' });
  if (p.imagen) {
    var img = document.createElement('img');
    img.src = p.imagen;
    img.alt = p.nombre;
    img.style.width  = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    imgDiv.appendChild(img);
  } else {
    ponerIcono(imgDiv, Icons.box);
  }

  var catDiv  = crearEl('div', { className: 'product-cat',  textContent: p.cat });
  var nameDiv = crearEl('div', { className: 'product-name', textContent: p.nombre });

  // Fila precio + añadir
  var actionsDiv = crearEl('div', { className: 'product-actions' });
  var priceEl    = crearEl('span', { className: 'product-price', textContent: p.precio.toFixed(2) + '€' });
  var btnAdd     = crearEl('button', { className: 'btn btn-primary btn-sm', textContent: '+' });
  btnAdd.addEventListener('click', crearHandlerAddCart(p.id));
  actionsDiv.appendChild(priceEl);
  actionsDiv.appendChild(btnAdd);

  card.appendChild(imgDiv);
  card.appendChild(catDiv);
  card.appendChild(nameDiv);
  card.appendChild(actionsDiv);
  return card;
}

function crearHandlerAddCart(id) {
  return function() { addToCart(id); };
}

// ============================================================
// CARRITO
// ============================================================
function addToCart(id) {
  var producto = null;
  for (var i = 0; i < MockData.productos.length; i++) {
    if (MockData.productos[i].id === id) { producto = MockData.productos[i]; break; }
  }
  if (!producto) return;

  if (!carrito[id]) {
    carrito[id] = { nombre: producto.nombre, precio: producto.precio, qty: 0 };
  }
  carrito[id].qty++;
  renderCarrito();
  PetSpot.notify('✅ ' + producto.nombre + ' añadido');
}

function cambiarCantidad(id, diferencia) {
  if (!carrito[id]) return;
  carrito[id].qty += diferencia;
  if (carrito[id].qty <= 0) delete carrito[id];
  renderCarrito();
}

function renderCarrito() {
  var contenedor = document.getElementById('cart-items');
  var ids        = Object.keys(carrito);
  var total      = 0;
  var numItems   = 0;

  for (var i = 0; i < ids.length; i++) {
    numItems += carrito[ids[i]].qty;
    total    += carrito[ids[i]].precio * carrito[ids[i]].qty;
  }

  document.getElementById('cart-count').textContent = numItems + ' artículos';
  document.getElementById('subtotal').textContent   = total.toFixed(2) + '€';

  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

  if (ids.length === 0) {
    contenedor.appendChild(crearEl('p', { className: 'empty-msg', textContent: 'Tu carrito está vacío' }));
    return;
  }

  for (var i = 0; i < ids.length; i++) {
    var id   = ids[i];
    var item = carrito[id];
    var div  = crearEl('div', { className: 'cart-item' });

    var iconDiv = crearEl('div', { className: 'cart-item-icon' });
    ponerIcono(iconDiv, Icons.box);

    var infoDiv = document.createElement('div');
    infoDiv.style.flex = '1';
    infoDiv.appendChild(crearEl('div', { style: { fontSize: '13px', fontWeight: '600' }, textContent: item.nombre }));
    infoDiv.appendChild(crearEl('div', { style: { fontSize: '12px', color: 'var(--accent)' }, textContent: (item.precio * item.qty).toFixed(2) + '€' }));

    var qtyDiv  = crearEl('div', { className: 'qty-ctrl' });
    var btnMenos = crearEl('button', { className: 'qty-btn', textContent: '−' });
    var qtySpan  = crearEl('span', { textContent: String(item.qty), style: { fontSize: '13px', fontWeight: '700', minWidth: '18px', textAlign: 'center' } });
    var btnMas   = crearEl('button', { className: 'qty-btn', textContent: '+' });

    btnMenos.addEventListener('click', crearHandlerQty(id, -1));
    btnMas.addEventListener('click',   crearHandlerQty(id,  1));

    qtyDiv.appendChild(btnMenos);
    qtyDiv.appendChild(qtySpan);
    qtyDiv.appendChild(btnMas);

    div.appendChild(iconDiv);
    div.appendChild(infoDiv);
    div.appendChild(qtyDiv);
    contenedor.appendChild(div);
  }
}

function crearHandlerQty(id, diff) {
  return function() { cambiarCantidad(id, diff); };
}

// ============================================================
// CHECKOUT
// ============================================================
function checkout() {
  var ids = Object.keys(carrito);
  if (ids.length === 0) {
    PetSpot.notify('Tu carrito está vacío');
    return;
  }
  // Rellenar dirección automáticamente desde el perfil
  var user = PetSpot.getUser();
  if (user && user.direccion) {
    document.getElementById('checkout-dir').value = user.direccion;
  }
  document.getElementById('modal-checkout').classList.add('open');
}

function confirmarCompra() {
  var nombre = document.getElementById('checkout-nombre').value.trim();
  var cuenta = document.getElementById('checkout-cuenta').value.trim();
  if (!nombre || !cuenta) {
    PetSpot.notify('Por favor, rellena todos los campos');
    return;
  }

  // Crear registro del pedido
  var ids   = Object.keys(carrito);
  var prods = [];
  var total = 0;
  for (var i = 0; i < ids.length; i++) {
    prods.push(carrito[ids[i]].nombre + ' (x' + carrito[ids[i]].qty + ')');
    total += carrito[ids[i]].precio * carrito[ids[i]].qty;
  }

  var numPedido = '#' + (1025 + misPedidos.length);
  var nuevoPedido = {
    id:        numPedido,
    productos: prods.join(', '),
    total:     total.toFixed(2) + '€',
    estado:    'procesando',
    fecha:     new Date().toLocaleDateString('es-ES')
  };
  misPedidos.unshift(nuevoPedido);
  Almacen.guardar('pedidos', misPedidos);
  renderPedidos();

  carrito = {};
  renderCarrito();
  closeModal();
  PetSpot.notify('🎉 Pedido realizado — ' + numPedido);

  // Limpiar campos
  document.getElementById('checkout-nombre').value = '';
  document.getElementById('checkout-cuenta').value = '';
  document.getElementById('checkout-dir').value    = '';
}

// ============================================================
// MIS PEDIDOS
// ============================================================
function renderPedidos() {
  var lista = document.getElementById('pedidos-lista');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  if (misPedidos.length === 0) {
    lista.appendChild(crearEl('p', {
      textContent: 'Aún no has realizado ningún pedido',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '24px', fontSize: '13px' }
    }));
    return;
  }

  var estadoClase = { 'entregado': 'badge-green', 'en camino': 'badge-orange', 'procesando': 'badge-blue' };

  for (var i = 0; i < misPedidos.length; i++) {
    var p = misPedidos[i];

    var card = crearEl('div', { className: 'cita-card', style: { marginBottom: '10px' } });

    var tDiv = crearEl('div', { className: 'cita-time' });
    tDiv.appendChild(crearEl('div', { className: 'hour', style: { fontSize: '13px' }, textContent: p.id }));
    tDiv.appendChild(crearEl('div', { className: 'date', textContent: p.fecha }));

    var sep = crearEl('div', { className: 'cita-divider' });

    var iDiv = crearEl('div', { className: 'cita-info' });
    iDiv.appendChild(crearEl('div', { className: 'cita-title', textContent: p.productos }));

    var rightDiv = document.createElement('div');
    rightDiv.style.display = 'flex';
    rightDiv.style.alignItems = 'center';
    rightDiv.style.gap = '10px';
    rightDiv.appendChild(crearEl('strong', { textContent: p.total, style: { color: 'var(--accent)' } }));
    rightDiv.appendChild(crearEl('span', { className: 'badge ' + (estadoClase[p.estado] || 'badge-gray'), textContent: p.estado }));

    card.appendChild(tDiv);
    card.appendChild(sep);
    card.appendChild(iDiv);
    card.appendChild(rightDiv);
    lista.appendChild(card);
  }
}

// Cambiar entre tab productos y pedidos
function showTab(tab, el) {
  document.getElementById('tab-productos').style.display = tab === 'productos' ? '' : 'none';
  document.getElementById('tab-pedidos').style.display   = tab === 'pedidos'   ? '' : 'none';
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  el.classList.add('active');
}

function closeModal() {
  var modales = document.querySelectorAll('.modal-overlay');
  for (var i = 0; i < modales.length; i++) modales[i].classList.remove('open');
}

// ── Render inicial ──
renderProductos();
renderPedidos();
