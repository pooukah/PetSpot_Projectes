// PetSpot — Chat del cliente
// El estado de mensajes no leídos persiste en localStorage
// Sin respuesta automática — preparado para conectar a API

PetSpot.init('cliente');
buildClienteLayout('chat');

ponerIcono(document.getElementById('icon-search'), Icons.search);
ponerIcono(document.getElementById('btn-send'),    Icons.send);

// ── Chat activo actualmente ──
var chatActivo = null;

// ── Estado de mensajes no leídos (persistente) ──
// Usamos localStorage para que si vuelves a la página, siga marcado
var estadoNoLeidos = Almacen.cargar('chat_unread');
// Por defecto, si nunca se ha cargado, empezamos con cero de todo
if (estadoNoLeidos.length === 0) {
  estadoNoLeidos = {};
}
// Asegurarnos de que es un objeto y no un array vacío
if (Array.isArray(estadoNoLeidos)) {
  estadoNoLeidos = {};
}

// ── Lista de conversaciones ──
// Empezamos con solo el mensaje de bienvenida de PetSpot
var conversaciones = Almacen.cargar('chat_convs');
if (conversaciones.length === 0) {
  // Estado inicial: solo el chat de bienvenida
  conversaciones = [
    { id: 1, nombre: 'PetSpot', rol: 'Bienvenida', ultimo: '¡Hola! Te damos la bienvenida a PetSpot.' }
  ];
  Almacen.guardar('chat_convs', conversaciones);
}
// chat_convs también puede ser array vacío devuelto como array
if (!Array.isArray(conversaciones)) conversaciones = [];

// ── Mensajes de cada chat (persistentes) ──
// Los mensajes de cada conversación se guardan por separado
function getMensajes(chatId) {
  var clave  = 'chat_msgs_' + chatId;
  var raw    = localStorage.getItem(Almacen.clave(clave));
  if (raw) return JSON.parse(raw);
  // Mensajes iniciales del chat de bienvenida
  if (chatId === 1) {
    return [
      { texto: '¡Hola! 👋 Bienvenido/a a PetSpot. Aquí podrás chatear con tu veterinario.', hora: '09:00', tipo: 'recv' }
    ];
  }
  return [];
}

function guardarMensajes(chatId, msgs) {
  var clave = 'chat_msgs_' + chatId;
  localStorage.setItem(Almacen.clave(clave), JSON.stringify(msgs));
}

// ============================================================
// CONSTRUIR LISTA DE CHATS
// ============================================================
function construirListaChats() {
  var contenedor = document.getElementById('chat-list-items');
  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

  for (var i = 0; i < conversaciones.length; i++) {
    var c  = conversaciones[i];
    var el = construirItemChat(c);
    contenedor.appendChild(el);
  }
}

function construirItemChat(c) {
  var el = crearEl('div', { className: 'chat-item' + (c.id === chatActivo ? ' active' : '') });
  el.dataset.id = c.id;

  // Avatar con inicial
  var av = crearEl('div', {
    className: 'topbar-avatar',
    textContent: c.nombre[0],
    style: { width: '38px', height: '38px', fontSize: '15px', flexShrink: '0', borderRadius: '50%' }
  });

  // Info del chat
  var infoDiv = document.createElement('div');
  infoDiv.style.flex = '1';
  infoDiv.style.minWidth = '0';

  var topRow = document.createElement('div');
  topRow.style.display = 'flex';
  topRow.style.alignItems = 'center';
  topRow.style.justifyContent = 'space-between';
  topRow.style.gap = '6px';
  topRow.appendChild(crearEl('span', { className: 'chat-item-name', textContent: c.nombre }));

  var msgDiv = crearEl('div', { className: 'chat-item-msg', textContent: c.ultimo });
  infoDiv.appendChild(topRow);
  infoDiv.appendChild(msgDiv);

  el.appendChild(av);
  el.appendChild(infoDiv);

  // Click para abrir el chat
  el.addEventListener('click', crearHandlerChatClick(c.id));
  return el;
}

// Función auxiliar para el closure del click
function crearHandlerChatClick(id) {
  return function() { abrirChat(id); };
}

// ============================================================
// ABRIR UN CHAT
// ============================================================
function abrirChat(id) {
  chatActivo = id;

  // Marcar el item activo en la lista
  var items = document.querySelectorAll('.chat-item');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle('active', parseInt(items[i].dataset.id) === id);
  }

  // Actualizar cabecera del chat
  var conv = null;
  for (var i = 0; i < conversaciones.length; i++) {
    if (conversaciones[i].id === id) { conv = conversaciones[i]; break; }
  }
  if (!conv) return;

  document.getElementById('chat-name').textContent = conv.nombre;
  document.getElementById('chat-av').textContent   = conv.nombre[0];

  // Cargar los mensajes del chat
  var msgs      = getMensajes(id);
  var contenedor = document.getElementById('chat-messages');
  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

  for (var i = 0; i < msgs.length; i++) {
    contenedor.appendChild(crearBurbuja(msgs[i].texto, msgs[i].hora, msgs[i].tipo));
  }
  contenedor.scrollTop = contenedor.scrollHeight;
}

// ============================================================
// CREAR BURBUJA DE MENSAJE
// ============================================================
function crearBurbuja(texto, hora, tipo) {
  var div    = crearEl('div', { className: 'msg ' + tipo });
  var bubble = crearEl('div', { className: 'msg-bubble', textContent: texto });
  var time   = crearEl('div', { className: 'msg-time',   textContent: hora   });
  div.appendChild(bubble);
  div.appendChild(time);
  return div;
}

// ============================================================
// ENVIAR MENSAJE
// ============================================================
function sendMsg() {
  var input = document.getElementById('msg-input');
  var texto = input.value.trim();
  if (!texto || !chatActivo) return;

  var ahora = new Date();
  var hora  = String(ahora.getHours()).padStart(2, '0') + ':' + String(ahora.getMinutes()).padStart(2, '0');

  // Añadir la burbuja al DOM
  var contenedor = document.getElementById('chat-messages');
  contenedor.appendChild(crearBurbuja(texto, hora, 'sent'));
  contenedor.scrollTop = contenedor.scrollHeight;

  // Guardar el mensaje en localStorage
  var msgs = getMensajes(chatActivo);
  msgs.push({ texto: texto, hora: hora, tipo: 'sent' });
  guardarMensajes(chatActivo, msgs);

  // Actualizar el último mensaje de la conversación
  for (var i = 0; i < conversaciones.length; i++) {
    if (conversaciones[i].id === chatActivo) {
      conversaciones[i].ultimo = texto;
      break;
    }
  }
  Almacen.guardar('chat_convs', conversaciones);

  input.value = '';
  // Sin respuesta automática — preparado para API
}

// ── Render inicial ──
construirListaChats();
if (conversaciones.length > 0) {
  abrirChat(conversaciones[0].id);
}
