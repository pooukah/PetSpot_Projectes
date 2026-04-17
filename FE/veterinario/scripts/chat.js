// PetSpot — Chat del veterinario
// Los veterinarios pueden buscar clientes por Gmail/email
// Sin respuesta automática — preparado para conectar a API

PetSpot.init('veterinario');
buildVetLayout('chat');

ponerIcono(document.getElementById('icon-search'), Icons.search);
ponerIcono(document.getElementById('btn-send'),    Icons.send);

// ── Chat activo ──
var chatActivo = null;

// ── Conversaciones guardadas ──
var conversaciones = Almacen.cargar('chat_convs_vet');
if (!Array.isArray(conversaciones) || conversaciones.length === 0) {
  // Solo el chat de bienvenida al inicio
  conversaciones = [
    { id: 1, nombre: 'PetSpot', rol: 'Sistema', ultimo: 'Bienvenido al chat de PetSpot.' }
  ];
  Almacen.guardar('chat_convs_vet', conversaciones);
}

// ── Mensajes persistentes por chat ──
function getMensajes(chatId) {
  var raw = localStorage.getItem(Almacen.clave('vmsg_' + chatId));
  if (raw) return JSON.parse(raw);
  if (chatId === 1) {
    return [{ texto: 'Bienvenido al panel de chat. Busca un cliente por email para iniciar una conversación.', hora: '09:00', tipo: 'recv' }];
  }
  return [];
}

function guardarMensajes(chatId, msgs) {
  localStorage.setItem(Almacen.clave('vmsg_' + chatId), JSON.stringify(msgs));
}

// ============================================================
// BUSCAR CLIENTE POR EMAIL (Gmail o cualquier correo)
// ============================================================
function buscarCliente() {
  var input = document.getElementById('search-email');
  var email = input.value.trim().toLowerCase();
  if (!email) return;

  // Buscar en la lista de clientes conocidos
  var clienteEncontrado = null;
  for (var i = 0; i < MockData.clientes.length; i++) {
    if (MockData.clientes[i].email.toLowerCase() === email ||
        MockData.clientes[i].email.toLowerCase().indexOf(email) !== -1) {
      clienteEncontrado = MockData.clientes[i];
      break;
    }
  }

  if (!clienteEncontrado) {
    PetSpot.notify('No se encontró ningún cliente con ese correo');
    return;
  }

  // Comprobar si ya existe una conversación con este cliente
  var yaExiste = false;
  for (var i = 0; i < conversaciones.length; i++) {
    if (conversaciones[i].email === clienteEncontrado.email) {
      // Ya existe — abrir directamente
      abrirChat(conversaciones[i].id);
      yaExiste = true;
      break;
    }
  }

  if (!yaExiste) {
    // Crear nueva conversación
    var nuevaConv = {
      id:     Date.now(),
      nombre: clienteEncontrado.nombre,
      rol:    clienteEncontrado.mascotas.join(', '),
      email:  clienteEncontrado.email,
      ultimo: 'Nueva conversación'
    };
    conversaciones.push(nuevaConv);
    Almacen.guardar('chat_convs_vet', conversaciones);
    construirListaChats();
    abrirChat(nuevaConv.id);
    PetSpot.notify('✅ Chat iniciado con ' + clienteEncontrado.nombre);
  }

  input.value = '';
}

// ============================================================
// LISTA DE CHATS
// ============================================================
function construirListaChats() {
  var contenedor = document.getElementById('chat-list-items');
  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

  for (var i = 0; i < conversaciones.length; i++) {
    contenedor.appendChild(construirItemChat(conversaciones[i]));
  }
}

function construirItemChat(c) {
  var el = crearEl('div', { className: 'chat-item' + (c.id === chatActivo ? ' active' : '') });
  el.dataset.id = c.id;

  var av = crearEl('div', {
    className: 'topbar-avatar',
    textContent: c.nombre[0],
    style: { width: '38px', height: '38px', fontSize: '15px', flexShrink: '0', borderRadius: '50%' }
  });

  var infoDiv = document.createElement('div');
  infoDiv.style.flex    = '1';
  infoDiv.style.minWidth = '0';

  var topRow = document.createElement('div');
  topRow.style.display        = 'flex';
  topRow.style.alignItems     = 'center';
  topRow.style.justifyContent = 'space-between';
  topRow.appendChild(crearEl('span', { className: 'chat-item-name', textContent: c.nombre }));

  infoDiv.appendChild(topRow);
  infoDiv.appendChild(crearEl('div', { className: 'chat-item-msg', textContent: c.ultimo }));

  el.appendChild(av);
  el.appendChild(infoDiv);
  el.addEventListener('click', crearHandlerChatClick(c.id));
  return el;
}

function crearHandlerChatClick(id) {
  return function() { abrirChat(id); };
}

// ============================================================
// ABRIR CHAT
// ============================================================
function abrirChat(id) {
  chatActivo = id;

  var items = document.querySelectorAll('.chat-item');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle('active', parseInt(items[i].dataset.id) === id);
  }

  var conv = null;
  for (var i = 0; i < conversaciones.length; i++) {
    if (conversaciones[i].id === id) { conv = conversaciones[i]; break; }
  }
  if (!conv) return;

  document.getElementById('chat-name').textContent = conv.nombre;
  document.getElementById('chat-sub').textContent  = conv.rol || '';
  document.getElementById('chat-av').textContent   = conv.nombre[0];

  var msgs = getMensajes(id);
  var contenedor = document.getElementById('chat-messages');
  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);
  for (var i = 0; i < msgs.length; i++) {
    contenedor.appendChild(crearBurbuja(msgs[i].texto, msgs[i].hora, msgs[i].tipo));
  }
  contenedor.scrollTop = contenedor.scrollHeight;
}

// ============================================================
// ENVIAR MENSAJE
// ============================================================
function crearBurbuja(texto, hora, tipo) {
  var div    = crearEl('div', { className: 'msg ' + tipo });
  var bubble = crearEl('div', { className: 'msg-bubble', textContent: texto });
  var time   = crearEl('div', { className: 'msg-time',   textContent: hora   });
  div.appendChild(bubble);
  div.appendChild(time);
  return div;
}

function sendMsg() {
  var input = document.getElementById('msg-input');
  var texto = input.value.trim();
  if (!texto || !chatActivo) return;

  var ahora = new Date();
  var hora  = String(ahora.getHours()).padStart(2, '0') + ':' + String(ahora.getMinutes()).padStart(2, '0');

  var contenedor = document.getElementById('chat-messages');
  contenedor.appendChild(crearBurbuja(texto, hora, 'sent'));
  contenedor.scrollTop = contenedor.scrollHeight;

  var msgs = getMensajes(chatActivo);
  msgs.push({ texto: texto, hora: hora, tipo: 'sent' });
  guardarMensajes(chatActivo, msgs);

  for (var i = 0; i < conversaciones.length; i++) {
    if (conversaciones[i].id === chatActivo) {
      conversaciones[i].ultimo = texto;
      break;
    }
  }
  Almacen.guardar('chat_convs_vet', conversaciones);
  input.value = '';
}

// ── Render inicial ──
construirListaChats();
if (conversaciones.length > 0) abrirChat(conversaciones[0].id);
