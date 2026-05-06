PetSpot.init('cliente');
buildClienteLayout('chat');

ponerIcono(document.getElementById('icon-search'), Icons.search);
ponerIcono(document.getElementById('btn-send'),    Icons.send);

let chatActivo = null;

let estadoNoLeidos = Almacen.cargar('chat_unread');
if (estadoNoLeidos.length === 0) {
  estadoNoLeidos = {};
}
if (Array.isArray(estadoNoLeidos)) {
  estadoNoLeidos = {};
}

let conversaciones = Almacen.cargar('chat_convs');
if (conversaciones.length === 0) {
  conversaciones = [
    { id: 1, nombre: 'PetSpot', rol: 'Bienvenida', ultimo: '¡Hola! Te damos la bienvenida a PetSpot.' }
  ];
  Almacen.guardar('chat_convs', conversaciones);
}
if (!Array.isArray(conversaciones)) conversaciones = [];

const getMensajes = function(chatId) {
  let clave  = 'chat_msgs_' + chatId;
  let raw    = localStorage.getItem(Almacen.clave(clave));
  if (raw) return JSON.parse(raw);
  if (chatId === 1) {
    return [
      { texto: '¡Hola! Bienvenido/a a PetSpot. Aquí podrás chatear con tu veterinario.', hora: '09:00', tipo: 'recv' }
    ];
  }
  return [];
};

const guardarMensajes = function(chatId, msgs) {
  let clave = 'chat_msgs_' + chatId;
  localStorage.setItem(Almacen.clave(clave), JSON.stringify(msgs));
};

const construirListaChats = function() {
  let contenedor = document.getElementById('chat-list-items');
  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

  for (let i = 0; i < conversaciones.length; i++) {
    let c  = conversaciones[i];
    let el = construirItemChat(c);
    contenedor.appendChild(el);
  }
}

// perdon oriol por mezclar codigo (css y js)
const construirItemChat = function(c) {
  let el = crearEl('div', { className: 'chat-item' + (c.id === chatActivo ? ' active' : '') });
  el.dataset.id = c.id;

  let av = crearEl('div', {
    className: 'topbar-avatar',
    textContent: c.nombre[0],
    style: { width: '38px', height: '38px', fontSize: '15px', flexShrink: '0', borderRadius: '50%' }
  });

  let infoDiv = document.createElement('div');
  infoDiv.style.flex = '1';
  infoDiv.style.minWidth = '0';

  let topRow = document.createElement('div');
  topRow.style.display = 'flex';
  topRow.style.alignItems = 'center';
  topRow.style.justifyContent = 'space-between';
  topRow.style.gap = '6px';
  topRow.appendChild(crearEl('span', { className: 'chat-item-name', textContent: c.nombre }));

  let msgDiv = crearEl('div', { className: 'chat-item-msg', textContent: c.ultimo });
  infoDiv.appendChild(topRow);
  infoDiv.appendChild(msgDiv);

  el.appendChild(av);
  el.appendChild(infoDiv);

  el.addEventListener('click', crearHandlerChatClick(c.id));
  return el;
};

const crearHandlerChatClick = function(id) {
  return function() { abrirChat(id); };
}

const abrirChat = function(id) {
  chatActivo = id;

  let items = document.querySelectorAll('.chat-item');
  for (let i = 0; i < items.length; i++) {
    items[i].classList.toggle('active', parseInt(items[i].dataset.id) === id);
  }

  let conv = null;
  for (let i = 0; i < conversaciones.length; i++) {
    if (conversaciones[i].id === id) { conv = conversaciones[i]; break; }
  }
  if (!conv) return;

  document.getElementById('chat-name').textContent = conv.nombre;
  document.getElementById('chat-av').textContent   = conv.nombre[0];

  let msgs      = getMensajes(id);
  let contenedor = document.getElementById('chat-messages');
  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

  for (let i = 0; i < msgs.length; i++) {
    contenedor.appendChild(crearBurbuja(msgs[i].texto, msgs[i].hora, msgs[i].tipo));
  }
  contenedor.scrollTop = contenedor.scrollHeight;
};

const crearBurbuja = function(texto, hora, tipo) {
  let div    = crearEl('div', { className: 'msg ' + tipo });
  let bubble = crearEl('div', { className: 'msg-bubble', textContent: texto });
  let time   = crearEl('div', { className: 'msg-time',   textContent: hora   });
  div.appendChild(bubble);
  div.appendChild(time);
  return div;
};

const sendMsg = function() {
  let input = document.getElementById('msg-input');
  let texto = input.value.trim();
  if (!texto || !chatActivo) return;

  let ahora = new Date();
  let hora  = String(ahora.getHours()).padStart(2, '0') + ':' + String(ahora.getMinutes()).padStart(2, '0');

  let contenedor = document.getElementById('chat-messages');
  contenedor.appendChild(crearBurbuja(texto, hora, 'sent'));
  contenedor.scrollTop = contenedor.scrollHeight;

  let msgs = getMensajes(chatActivo);
  msgs.push({ texto: texto, hora: hora, tipo: 'sent' });
  guardarMensajes(chatActivo, msgs);

  for (let i = 0; i < conversaciones.length; i++) {
    if (conversaciones[i].id === chatActivo) {
      conversaciones[i].ultimo = texto;
      break;
    }
  }
  Almacen.guardar('chat_convs', conversaciones);

  input.value = '';
};

construirListaChats();
if (conversaciones.length > 0) {
  abrirChat(conversaciones[0].id);
}
