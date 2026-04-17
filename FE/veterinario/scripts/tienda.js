// PetSpot — Tienda del veterinario

PetSpot.init('veterinario');
buildVetLayout('tienda');

ponerIcono(document.getElementById('icon-plus'), Icons.plus);
ponerIcono(document.getElementById('icon-x-nuevo'), Icons.x);
ponerIcono(document.getElementById('icon-x-editar'), Icons.x);

document.getElementById('btn-nuevo').addEventListener('click', function() {
  document.getElementById('modal-prod').classList.add('open');
});

function showTab(tab, el) {
  document.getElementById('tab-productos').style.display = tab === 'productos' ? '' : 'none';
  document.getElementById('tab-pedidos').style.display   = tab === 'pedidos'   ? '' : 'none';
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  el.classList.add('active');
}

// Lista de productos (copia para poder modificar)
var listaProductos = [];
for (var i = 0; i < MockData.productos.length; i++) {
  listaProductos.push({
    id:      MockData.productos[i].id,
    nombre:  MockData.productos[i].nombre,
    precio:  MockData.productos[i].precio,
    stock:   MockData.productos[i].stock,
    ventas:  MockData.productos[i].ventas,
    cat:     MockData.productos[i].cat,
    visible: MockData.productos[i].visible,
    imagen:  MockData.productos[i].imagen
  });
}

var productoEditandoId = null;

function renderProductos() {
  var tbody = document.getElementById('productos-body');
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
  for (var i = 0; i < listaProductos.length; i++) {
    var p = listaProductos[i];
    var lowStock = p.stock < 20;
    var opacidad = p.visible ? '1' : '0.45';
    var fila = document.createElement('tr');
    fila.id = 'prod-row-' + p.id;
    fila.style.opacity = opacidad;
    // Celda: Producto (imagen/icono + nombre)
    var td1 = document.createElement('td');
    var prodWrap = document.createElement('div');
    prodWrap.style.cssText = 'display:flex;align-items:center;gap:11px';
    var imgDiv = document.createElement('div');
    imgDiv.style.cssText = 'width:40px;height:40px;background:var(--bg3);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden';
    if (p.imagen) {
      var img = document.createElement('img');
      img.src = p.imagen; img.alt = p.nombre;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover';
      imgDiv.appendChild(img);
    } else { ponerIcono(imgDiv, Icons.box); }
    prodWrap.appendChild(imgDiv);
    prodWrap.appendChild(crearEl('span', { textContent: p.nombre, style: { fontWeight: '600', fontSize: '14px' } }));
    td1.appendChild(prodWrap);

    // Celda: Categoría
    var td2 = document.createElement('td');
    td2.appendChild(crearEl('span', { className: 'badge badge-blue', textContent: p.cat }));

    // Celda: Precio
    var td3 = document.createElement('td');
    td3.appendChild(crearEl('strong', { textContent: p.precio.toFixed(2) + '€', style: { color: 'var(--accent)', fontSize: '15px' } }));

    // Celda: Stock
    var td4 = document.createElement('td');
    td4.appendChild(crearEl('span', { className: lowStock ? 'stock-low' : 'stock-ok', textContent: (lowStock ? '⚠️ ' : '') + p.stock + ' uds.' }));

    // Celda: Ventas
    var td5 = crearEl('td', { textContent: p.ventas + ' vendidos', style: { color: 'var(--text2)' } });

    // Celda: Acciones
    var td6 = document.createElement('td');
    var accionesDiv = document.createElement('div');
    accionesDiv.style.cssText = 'display:flex;gap:6px';
    var btnEditar = crearEl('button', { className: 'btn btn-ghost btn-sm' });
    ponerIcono(btnEditar, Icons.edit);
    btnEditar.addEventListener('click', crearHandlerEditar(p.id));
    var btnOcultar = crearEl('button', { className: 'btn btn-ghost btn-sm', textContent: p.visible ? '👁' : '🚫' });
    btnOcultar.title = p.visible ? 'Ocultar' : 'Mostrar';
    btnOcultar.addEventListener('click', crearHandlerVisible(p.id));
    var btnBorrar  = crearEl('button', { className: 'btn btn-danger btn-sm' });
    ponerIcono(btnBorrar, Icons.trash);
    btnBorrar.addEventListener('click', crearHandlerEliminar(p.id));
    accionesDiv.appendChild(btnEditar);
    accionesDiv.appendChild(btnOcultar);
    accionesDiv.appendChild(btnBorrar);
    td6.appendChild(accionesDiv);

    fila.appendChild(td1); fila.appendChild(td2); fila.appendChild(td3);
    fila.appendChild(td4); fila.appendChild(td5); fila.appendChild(td6);
    tbody.appendChild(fila);
  }
}

function crearHandlerEditar(id) { return function() { abrirEditar(id); }; }
function crearHandlerVisible(id) { return function() { toggleVisible(id); }; }
function crearHandlerEliminar(id) { return function() { eliminarProducto(id); }; }

function toggleVisible(id) {
  for (var i = 0; i < listaProductos.length; i++) {
    if (listaProductos[i].id === id) {
      listaProductos[i].visible = !listaProductos[i].visible;
      break;
    }
  }
  renderProductos();
}

function eliminarProducto(id) {
  var nueva = [];
  for (var i = 0; i < listaProductos.length; i++) {
    if (listaProductos[i].id !== id) nueva.push(listaProductos[i]);
  }
  listaProductos = nueva;
  renderProductos();
  PetSpot.notify('Producto eliminado');
}

function abrirEditar(id) {
  var prod = null;
  for (var i = 0; i < listaProductos.length; i++) {
    if (listaProductos[i].id === id) { prod = listaProductos[i]; break; }
  }
  if (!prod) return;
  productoEditandoId = id;

  // Pre-rellenar el modal de editar con los datos actuales
  document.getElementById('edit-nombre').value = prod.nombre;
  document.getElementById('edit-precio').value = prod.precio;
  document.getElementById('edit-stock').value  = prod.stock;
  document.getElementById('edit-cat').value    = prod.cat;

  document.getElementById('modal-editar').classList.add('open');
}

function guardarEdicion() {
  if (!productoEditandoId) return;
  var nombre = document.getElementById('edit-nombre').value.trim();
  var precio = parseFloat(document.getElementById('edit-precio').value);
  var stock  = parseInt(document.getElementById('edit-stock').value);
  var cat    = document.getElementById('edit-cat').value;

  if (!nombre || isNaN(precio) || isNaN(stock)) {
    PetSpot.notify('Rellena todos los campos correctamente');
    return;
  }

  for (var i = 0; i < listaProductos.length; i++) {
    if (listaProductos[i].id === productoEditandoId) {
      listaProductos[i].nombre = nombre;
      listaProductos[i].precio = precio;
      listaProductos[i].stock  = stock;
      listaProductos[i].cat    = cat;
      break;
    }
  }

  renderProductos();
  closeModal();
  PetSpot.notify('✅ Producto actualizado');
}

function addProduct() {
  var nombre = document.getElementById('nuevo-nombre').value.trim();
  var precio = parseFloat(document.getElementById('nuevo-precio').value);
  var stock  = parseInt(document.getElementById('nuevo-stock').value);
  var cat    = document.getElementById('nuevo-cat').value;

  if (!nombre || isNaN(precio) || isNaN(stock)) {
    PetSpot.notify('Rellena todos los campos');
    return;
  }

  listaProductos.push({
    id:      Date.now(),
    nombre:  nombre,
    precio:  precio,
    stock:   stock,
    ventas:  0,
    cat:     cat,
    visible: true,
    imagen:  null
  });

  renderProductos();
  closeModal();
  PetSpot.notify('✅ Producto creado correctamente');

  // Limpiar campos
  document.getElementById('nuevo-nombre').value = '';
  document.getElementById('nuevo-precio').value = '';
  document.getElementById('nuevo-stock').value  = '';
}

function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(function(m) {
    m.classList.remove('open');
  });
  productoEditandoId = null;
}

// Pedidos mock
var pedidos = [
  { id: '#1024', cliente: 'María Fernández', prods: 'Pienso Premium (x2), Collar (x1)', total: '92.48€', estado: 'entregado',  fecha: '14/03/2026' },
  { id: '#1023', cliente: 'Jordi Puig',      prods: 'Vitaminas K9 (x1)',                total: '22.00€', estado: 'en camino',  fecha: '15/03/2026' },
  { id: '#1022', cliente: 'Ana González',    prods: 'Arena Sílice (x3), Champú (x2)',   total: '53.47€', estado: 'procesando', fecha: '16/03/2026' }
];
var estadoClase = { 'entregado': 'badge-green', 'en camino': 'badge-orange', 'procesando': 'badge-blue' };
var pedidosBody = document.getElementById('pedidos-body');
for (var i = 0; i < pedidos.length; i++) {
  var p    = pedidos[i];
  var fila = document.createElement('tr');
  var td_id = document.createElement('td'); td_id.appendChild(crearEl('strong', { textContent: p.id }));
  var td_cl = crearEl('td', { textContent: p.cliente });
  var td_pr = crearEl('td', { textContent: p.prods, style: { maxWidth: '220px', color: 'var(--text2)' } });
  var td_to = document.createElement('td'); td_to.appendChild(crearEl('strong', { textContent: p.total, style: { color: 'var(--accent)' } }));
  var td_es = document.createElement('td'); td_es.appendChild(crearEl('span', { className: 'badge ' + (estadoClase[p.estado] || 'badge-gray'), textContent: p.estado }));
  var td_fe = crearEl('td', { textContent: p.fecha });
  fila.appendChild(td_id); fila.appendChild(td_cl); fila.appendChild(td_pr);
  fila.appendChild(td_to); fila.appendChild(td_es); fila.appendChild(td_fe);
  pedidosBody.appendChild(fila);
}

renderProductos();
