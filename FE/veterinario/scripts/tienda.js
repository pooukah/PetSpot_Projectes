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

var listaProductos = [];
var productoEditandoId = null;

function renderProductos() {
  var tbody = document.getElementById('productos-body');
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
  
  for (var i = 0; i < listaProductos.length; i++) {
    var p = listaProductos[i];
    var lowStock = p.stock < 20;
    var fila = document.createElement('tr');

    // Celda: Producto
    var td1 = document.createElement('td');
    var prodWrap = document.createElement('div');
    prodWrap.style.cssText = 'display:flex;align-items:center;gap:11px';
    var imgDiv = document.createElement('div');
    imgDiv.style.cssText = 'width:40px;height:40px;background:var(--bg3);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden';
    ponerIcono(imgDiv, Icons.box);
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
    var td5 = crearEl('td', { textContent: (p.ventas || 0) + ' vendidos', style: { color: 'var(--text2)' } });

    // Celda: Acciones
    var td6 = document.createElement('td');
    var accionesDiv = document.createElement('div');
    accionesDiv.style.cssText = 'display:flex;gap:6px';
    var btnEditar = crearEl('button', { className: 'btn btn-ghost btn-sm' });
    ponerIcono(btnEditar, Icons.edit);
    btnEditar.addEventListener('click', crearHandlerEditar(p.id));
    var btnBorrar = crearEl('button', { className: 'btn btn-danger btn-sm' });
    ponerIcono(btnBorrar, Icons.trash);
    btnBorrar.addEventListener('click', crearHandlerEliminar(p.id));
    accionesDiv.appendChild(btnEditar);
    accionesDiv.appendChild(btnBorrar);
    td6.appendChild(accionesDiv);

    fila.appendChild(td1); fila.appendChild(td2); fila.appendChild(td3);
    fila.appendChild(td4); fila.appendChild(td5); fila.appendChild(td6);
    tbody.appendChild(fila);
  }
}

function crearHandlerEditar(id) { return function() { abrirEditar(id); }; }
function crearHandlerEliminar(id) { return function() { eliminarProducto(id); }; }

async function eliminarProducto(id) {
  const email = localStorage.getItem('user_email');
  try {
    const response = await fetch(`https://localhost:443/productos/${id}`, {
      method: "DELETE",
      headers: { "x-user-email": email }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Error al eliminar');
    }

    PetSpot.notify('Producto eliminado');
    cargarMisProductos();
  } catch (error) {
    PetSpot.notify('❌ ' + error.message);
  }
}

function abrirEditar(id) {
  var prod = null;
  for (var i = 0; i < listaProductos.length; i++) {
    if (listaProductos[i].id === id) { prod = listaProductos[i]; break; }
  }
  if (!prod) return;
  productoEditandoId = id;

  document.getElementById('edit-nombre').value = prod.nombre;
  document.getElementById('edit-precio').value = prod.precio;
  document.getElementById('edit-stock').value  = prod.stock;
  document.getElementById('edit-cat').value    = prod.cat;

  document.getElementById('modal-editar').classList.add('open');
}

async function guardarEdicion() {
  if (!productoEditandoId) return;
  var nombre = document.getElementById('edit-nombre').value.trim();
  var precio = parseFloat(document.getElementById('edit-precio').value);
  var stock  = parseInt(document.getElementById('edit-stock').value);
  var cat    = document.getElementById('edit-cat').value;

  if (!nombre || isNaN(precio) || isNaN(stock)) {
    PetSpot.notify('Rellena todos los campos correctamente');
    return;
  }

  const email = localStorage.getItem('user_email');
  try {
    const response = await fetch(`https://localhost:443/productos/${productoEditandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email
      },
      body: JSON.stringify({ nombre, categoria: cat, precio, stock })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Error al actualizar');
    }

    PetSpot.notify('✅ Producto actualizado');
    closeModal();
    cargarMisProductos();
  } catch (error) {
    PetSpot.notify('❌ ' + error.message);
  }
}

async function cargarMisProductos() {
  const email = localStorage.getItem('user_email');
  if (!email) return;

  try {
    const response = await fetch(`https://localhost:443/productos/mis-productos`, {
      method: "GET",
      headers: { "x-user-email": email }
    });

    if (!response.ok) throw new Error('Error al cargar productos');

    const productos = await response.json();
    
    listaProductos = productos.map(p => ({
      id: p.id_producto,
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      ventas: p.veces_vendido || 0,
      cat: p.categoria
    }));
    
    renderProductos();
  } catch (error) {
    console.error('Error:', error);
    PetSpot.notify('❌ Error al cargar productos');
  }
}

async function addProduct() {
  var nombre = document.getElementById('nuevo-nombre').value.trim();
  var precio = parseFloat(document.getElementById('nuevo-precio').value);
  var stock  = parseInt(document.getElementById('nuevo-stock').value);
  var cat    = document.getElementById('nuevo-cat').value;

  if (!nombre || isNaN(precio) || isNaN(stock)) {
    PetSpot.notify('Rellena todos los campos');
    return;
  }

  const email = localStorage.getItem('user_email');
  if (!email) {
    PetSpot.notify('❌ No se encontró el usuario');
    return;
  }

  try {
    const response = await fetch("https://localhost:443/productos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email
      },
      body: JSON.stringify({
        nombre: nombre,
        categoria: cat,
        precio: precio,
        stock: stock
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Error al crear producto');
    }

    const data = await response.json();

    PetSpot.notify('✅ Producto creado correctamente');
    closeModal();
    
    // Limpiar campos
    document.getElementById('nuevo-nombre').value = '';
    document.getElementById('nuevo-precio').value = '';
    document.getElementById('nuevo-stock').value = '';
    
    // Recargar productos
    cargarMisProductos();

  } catch (error) {
    console.error('Error:', error);
    PetSpot.notify('❌ ' + error.message);
  }
}

function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(function(m) {
    m.classList.remove('open');
  });
  productoEditandoId = null;
}

cargarMisProductos();