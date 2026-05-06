PetSpot.init('veterinario');
buildVetLayout('tienda');

ponerIcono(document.getElementById('icon-plus'), Icons.plus);
ponerIcono(document.getElementById('icon-x-nuevo'), Icons.x);
ponerIcono(document.getElementById('icon-x-editar'), Icons.x);

document.getElementById('btn-nuevo').addEventListener('click', function() {
  document.getElementById('modal-prod').classList.add('open');
});

const showTab = function(tab, el) {
  document.getElementById('tab-productos').style.display = tab === 'productos' ? '' : 'none';
  document.getElementById('tab-pedidos').style.display   = tab === 'pedidos'   ? '' : 'none';
  let tabs = document.querySelectorAll('.tab');
  for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  el.classList.add('active');
};

let listaProductos = [];
let productoEditandoId = null;

const renderProductos = function() {
  let tbody = document.getElementById('productos-body');
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
  
  for (let i = 0; i < listaProductos.length; i++) {
    let p = listaProductos[i];
    let lowStock = p.stock < 20;
    let fila = document.createElement('tr');

    let td1 = document.createElement('td');
    let prodWrap = document.createElement('div');
    prodWrap.style.cssText = 'display:flex;align-items:center;gap:11px';
    let imgDiv = document.createElement('div');
    imgDiv.style.cssText = 'width:40px;height:40px;background:var(--bg3);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden';
    ponerIcono(imgDiv, Icons.box);
    prodWrap.appendChild(imgDiv);
    prodWrap.appendChild(crearEl('span', { textContent: p.nombre, style: { fontWeight: '600', fontSize: '14px' } }));
    td1.appendChild(prodWrap);

    let td2 = document.createElement('td');
    td2.appendChild(crearEl('span', { className: 'badge badge-blue', textContent: p.cat }));

    let td3 = document.createElement('td');
    td3.appendChild(crearEl('strong', { textContent: p.precio.toFixed(2) + '€', style: { color: 'var(--accent)', fontSize: '15px' } }));

    let td4 = document.createElement('td');
    td4.appendChild(crearEl('span', { className: lowStock ? 'stock-low' : 'stock-ok', textContent: (lowStock ? 'Stock bajo - ' : '') + p.stock + ' uds.' }));

    let td5 = crearEl('td', { textContent: (p.ventas || 0) + ' vendidos', style: { color: 'var(--text2)' } });

    let td6 = document.createElement('td');
    let accionesDiv = document.createElement('div');
    accionesDiv.style.cssText = 'display:flex;gap:6px';
    let btnEditar = crearEl('button', { className: 'btn btn-ghost btn-sm' });
    ponerIcono(btnEditar, Icons.edit);
    btnEditar.addEventListener('click', crearHandlerEditar(p.id));
    let btnBorrar = crearEl('button', { className: 'btn btn-danger btn-sm' });
    ponerIcono(btnBorrar, Icons.trash);
    btnBorrar.addEventListener('click', crearHandlerEliminar(p.id));
    accionesDiv.appendChild(btnEditar);
    accionesDiv.appendChild(btnBorrar);
    td6.appendChild(accionesDiv);

    fila.appendChild(td1); fila.appendChild(td2); fila.appendChild(td3);
    fila.appendChild(td4); fila.appendChild(td5); fila.appendChild(td6);
    tbody.appendChild(fila);
  }
};

const crearHandlerEditar = function(id) { 
  return function() { abrirEditar(id); }; 
};

const crearHandlerEliminar = function(id) { 
  return function() { eliminarProducto(id); }; 
};

const eliminarProducto = async function(id) {
  let email = localStorage.getItem('user_email');
  try {
    let response = await fetch(`https://localhost:443/productos/${id}`, {
      method: "DELETE",
      headers: { "x-user-email": email }
    });

    if (!response.ok) {
      let err = await response.json();
      throw new Error(err.detail || 'Error al eliminar');
    }

    PetSpot.notify('Producto eliminado');
    cargarMisProductos();
  } catch (error) {
    PetSpot.notify(error.message);
  }
};

const abrirEditar = function(id) {
  let prod = null;
  for (let i = 0; i < listaProductos.length; i++) {
    if (listaProductos[i].id === id) { prod = listaProductos[i]; break; }
  }
  if (!prod) return;
  productoEditandoId = id;

  document.getElementById('edit-nombre').value = prod.nombre;
  document.getElementById('edit-precio').value = prod.precio;
  document.getElementById('edit-stock').value  = prod.stock;
  document.getElementById('edit-cat').value    = prod.cat;

  document.getElementById('modal-editar').classList.add('open');
};

const guardarEdicion = async function() {
  if (!productoEditandoId) return;
  let nombre = document.getElementById('edit-nombre').value.trim();
  let precio = parseFloat(document.getElementById('edit-precio').value);
  let stock  = parseInt(document.getElementById('edit-stock').value);
  let cat    = document.getElementById('edit-cat').value;

  if (!nombre || isNaN(precio) || isNaN(stock)) {
    PetSpot.notify('Rellena todos los campos correctamente');
    return;
  }

  let email = localStorage.getItem('user_email');
  try {
    let response = await fetch(`https://localhost:443/productos/${productoEditandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email
      },
      body: JSON.stringify({ nombre, categoria: cat, precio, stock })
    });

    if (!response.ok) {
      let err = await response.json();
      throw new Error(err.detail || 'Error al actualizar');
    }

    PetSpot.notify('Producto actualizado');
    closeModal();
    cargarMisProductos();
  } catch (error) {
    PetSpot.notify(error.message);
  }
};

const cargarMisProductos = async function() {
  let email = localStorage.getItem('user_email');
  if (!email) return;

  try {
    let response = await fetch(`https://localhost:443/productos/mis-productos`, {
      method: "GET",
      headers: { "x-user-email": email }
    });

    if (!response.ok) throw new Error('Error al cargar productos');

    let productos = await response.json();
    
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
    PetSpot.notify('Error al cargar productos');
  }
};

const addProduct = async function() {
  let nombre = document.getElementById('nuevo-nombre').value.trim();
  let precio = parseFloat(document.getElementById('nuevo-precio').value);
  let stock  = parseInt(document.getElementById('nuevo-stock').value);
  let cat    = document.getElementById('nuevo-cat').value;

  if (!nombre || isNaN(precio) || isNaN(stock)) {
    PetSpot.notify('Rellena todos los campos');
    return;
  }

  let email = localStorage.getItem('user_email');
  if (!email) {
    PetSpot.notify('No se encontró el usuario');
    return;
  }

  try {
    let response = await fetch("https://localhost:443/productos", {
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
      let err = await response.json();
      throw new Error(err.detail || 'Error al crear producto');
    }

    let data = await response.json();

    PetSpot.notify('Producto creado correctamente');
    closeModal();
    
    document.getElementById('nuevo-nombre').value = '';
    document.getElementById('nuevo-precio').value = '';
    document.getElementById('nuevo-stock').value = '';
    
    cargarMisProductos();

  } catch (error) {
    console.error('Error:', error);
    PetSpot.notify(error.message);
  }
};

const closeModal = function() {
  document.querySelectorAll('.modal-overlay').forEach(function(m) {
    m.classList.remove('open');
  });
  productoEditandoId = null;
};

cargarMisProductos();