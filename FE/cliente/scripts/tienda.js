PetSpot.init('cliente');
buildClienteLayout('tienda');

ponerIcono(document.getElementById('icon-search'), Icons.search);
ponerIcono(document.getElementById('icon-cart'),   Icons.shop);
ponerIcono(document.getElementById('icon-check'),  Icons.check);

let productos = [];  
let categorias = ['Todas'];
let categoriaActiva = 'Todas';
let carrito = {};
let misPedidos = Almacen.cargar('pedidos');

const cargarProductos = async function() {
  try {
    const response = await fetch("https://localhost:443/");
    if (!response.ok) throw new Error("Error al cargar productos");
    productos = await response.json();
    
    categorias = ['Todas'];
    for (let i = 0; i < productos.length; i++) {
      if (categorias.indexOf(productos[i].categoria) === -1) {
        categorias.push(productos[i].categoria);
      }
    }
    
    renderFiltros();
    renderProductos();
  } catch (error) {
    console.error("Error:", error);
    PetSpot.notify("Error al cargar productos");
  }
};

const renderFiltros = function() {
  let filtrosEl = document.getElementById('cat-filters');
  while (filtrosEl.firstChild) filtrosEl.removeChild(filtrosEl.firstChild);
  
  for (let i = 0; i < categorias.length; i++) {
    let chip = crearEl('div', {
      className: 'filter-chip' + (categorias[i] === 'Todas' ? ' active' : ''),
      textContent: categorias[i]
    });
    chip.addEventListener('click', crearHandlerCategoria(categorias[i], chip));
    filtrosEl.appendChild(chip);
  }
};

const crearHandlerCategoria = function(cat, chip) {
  return function() {
    categoriaActiva = cat;
    let chips = document.querySelectorAll('#cat-filters .filter-chip');
    for (let i = 0; i < chips.length; i++) chips[i].classList.remove('active');
    chip.classList.add('active');
    renderProductos();
  };
};

const filterProducts = function() {
  renderProductos();
};

const renderProductos = function() {
  let query = document.getElementById('search-input').value.toLowerCase();
  let grid = document.getElementById('products-grid');
  while (grid.firstChild) grid.removeChild(grid.firstChild);

  let hayAlguno = false;
  for (let i = 0; i < productos.length; i++) {
    let p = productos[i];
    if (categoriaActiva !== 'Todas' && p.categoria !== categoriaActiva) continue;
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
};

const crearCardProducto = function(p) {
  let card = crearEl('div', { className: 'product-card' });

  let imgDiv = crearEl('div', { className: 'product-img' });
  if (p.foto_url) {
    let img = document.createElement('img');
    img.src = p.foto_url;
    img.alt = p.nombre;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    imgDiv.appendChild(img);
  } else {
    ponerIcono(imgDiv, Icons.box);
  }

  let catDiv = crearEl('div', { className: 'product-cat', textContent: p.categoria });
  let nameDiv = crearEl('div', { className: 'product-name', textContent: p.nombre });

  let actionsDiv = crearEl('div', { className: 'product-actions' });
  let priceEl = crearEl('span', { className: 'product-price', textContent: p.precio.toFixed(2) + '€' });
  let btnAdd = crearEl('button', { className: 'btn btn-primary btn-sm', textContent: '+' });
  btnAdd.addEventListener('click', crearHandlerAddCart(p.id_producto));
  actionsDiv.appendChild(priceEl);
  actionsDiv.appendChild(btnAdd);

  card.appendChild(imgDiv);
  card.appendChild(catDiv);
  card.appendChild(nameDiv);
  card.appendChild(actionsDiv);
  return card;
};

const crearHandlerAddCart = function(id) {
  return function() { addToCart(id); };
};

const addToCart = function(id) {
  let producto = null;
  for (let i = 0; i < productos.length; i++) {
    if (productos[i].id_producto === id) { producto = productos[i]; break; }
  }
  if (!producto) return;

  if (!carrito[id]) {
    carrito[id] = { nombre: producto.nombre, precio: producto.precio, qty: 0 };
  }
  carrito[id].qty++;
  renderCarrito();
  PetSpot.notify(producto.nombre + ' añadido');
};

const cambiarCantidad = function(id, diferencia) {
  if (!carrito[id]) return;
  carrito[id].qty += diferencia;
  if (carrito[id].qty <= 0) delete carrito[id];
  renderCarrito();
};

const renderCarrito = function() {
  let contenedor = document.getElementById('cart-items');
  let ids = Object.keys(carrito);
  let total = 0;
  let numItems = 0;

  for (let i = 0; i < ids.length; i++) {
    numItems += carrito[ids[i]].qty;
    total += carrito[ids[i]].precio * carrito[ids[i]].qty;
  }

  document.getElementById('cart-count').textContent = numItems + ' artículos';
  document.getElementById('subtotal').textContent = total.toFixed(2) + '€';

  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

  if (ids.length === 0) {
    contenedor.appendChild(crearEl('p', { className: 'empty-msg', textContent: 'Tu carrito está vacío' }));
    return;
  }

  for (let i = 0; i < ids.length; i++) {
    let id = ids[i];
    let item = carrito[id];
    let div = crearEl('div', { className: 'cart-item' });

    let iconDiv = crearEl('div', { className: 'cart-item-icon' });
    ponerIcono(iconDiv, Icons.box);

    let infoDiv = document.createElement('div');
    infoDiv.style.flex = '1';
    infoDiv.appendChild(crearEl('div', { style: { fontSize: '13px', fontWeight: '600' }, textContent: item.nombre }));
    infoDiv.appendChild(crearEl('div', { style: { fontSize: '12px', color: 'var(--accent)' }, textContent: (item.precio * item.qty).toFixed(2) + '€' }));

    let qtyDiv = crearEl('div', { className: 'qty-ctrl' });
    let btnMenos = crearEl('button', { className: 'qty-btn', textContent: '−' });
    let qtySpan = crearEl('span', { textContent: String(item.qty), style: { fontSize: '13px', fontWeight: '700', minWidth: '18px', textAlign: 'center' } });
    let btnMas = crearEl('button', { className: 'qty-btn', textContent: '+' });

    btnMenos.addEventListener('click', crearHandlerQty(id, -1));
    btnMas.addEventListener('click', crearHandlerQty(id, 1));

    qtyDiv.appendChild(btnMenos);
    qtyDiv.appendChild(qtySpan);
    qtyDiv.appendChild(btnMas);

    div.appendChild(iconDiv);
    div.appendChild(infoDiv);
    div.appendChild(qtyDiv);
    contenedor.appendChild(div);
  }
};

const crearHandlerQty = function(id, diff) {
  return function() { cambiarCantidad(id, diff); };
};

const checkout = function() {
  let ids = Object.keys(carrito);
  if (ids.length === 0) {
    PetSpot.notify('Tu carrito está vacío');
    return;
  }
  let user = PetSpot.getUser();
  if (user && user.direccion) {
    document.getElementById('checkout-dir').value = user.direccion;
  }
  document.getElementById('modal-checkout').classList.add('open');
};

const confirmarCompra = function() {
  let nombre = document.getElementById('checkout-nombre').value.trim();
  let cuenta = document.getElementById('checkout-cuenta').value.trim();
  if (!nombre || !cuenta) {
    PetSpot.notify('Por favor, rellena todos los campos');
    return;
  }

  let ids = Object.keys(carrito);
  let prods = [];
  let total = 0;
  for (let i = 0; i < ids.length; i++) {
    prods.push(carrito[ids[i]].nombre + ' (x' + carrito[ids[i]].qty + ')');
    total += carrito[ids[i]].precio * carrito[ids[i]].qty;
  }

  let numPedido = '#' + (1025 + misPedidos.length);
  let nuevoPedido = {
    id: numPedido,
    productos: prods.join(', '),
    total: total.toFixed(2) + '€',
    estado: 'procesando',
    fecha: new Date().toLocaleDateString('es-ES')
  };
  misPedidos.unshift(nuevoPedido);
  Almacen.guardar('pedidos', misPedidos);
  renderPedidos();

  carrito = {};
  renderCarrito();
  closeModal();
  PetSpot.notify('Pedido realizado — ' + numPedido);

  document.getElementById('checkout-nombre').value = '';
  document.getElementById('checkout-cuenta').value = '';
  document.getElementById('checkout-dir').value = '';
};

const renderPedidos = function() {
  let lista = document.getElementById('pedidos-lista');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  if (misPedidos.length === 0) {
    lista.appendChild(crearEl('p', {
      textContent: 'Aún no has realizado ningún pedido',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '24px', fontSize: '13px' }
    }));
    return;
  }

  let estadoClase = { 'entregado': 'badge-green', 'en camino': 'badge-orange', 'procesando': 'badge-blue' };

  for (let i = 0; i < misPedidos.length; i++) {
    let p = misPedidos[i];

    let card = crearEl('div', { className: 'cita-card', style: { marginBottom: '10px' } });

    let tDiv = crearEl('div', { className: 'cita-time' });
    tDiv.appendChild(crearEl('div', { className: 'hour', style: { fontSize: '13px' }, textContent: p.id }));
    tDiv.appendChild(crearEl('div', { className: 'date', textContent: p.fecha }));

    let sep = crearEl('div', { className: 'cita-divider' });

    let iDiv = crearEl('div', { className: 'cita-info' });
    iDiv.appendChild(crearEl('div', { className: 'cita-title', textContent: p.productos }));

    let rightDiv = document.createElement('div');
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
};

const showTab = function(tab, el) {
  document.getElementById('tab-productos').style.display = tab === 'productos' ? '' : 'none';
  document.getElementById('tab-pedidos').style.display = tab === 'pedidos' ? '' : 'none';
  let tabs = document.querySelectorAll('.tab');
  for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  el.classList.add('active');
};

const closeModal = function() {
  let modales = document.querySelectorAll('.modal-overlay');
  for (let i = 0; i < modales.length; i++) modales[i].classList.remove('open');
};

cargarProductos();
renderPedidos();