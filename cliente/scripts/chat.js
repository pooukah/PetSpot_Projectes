// PetSpot — Chat del cliente
// Mensajes en tiempo real con Firestore

PetSpot.init('cliente');
buildClienteLayout('chat');

ponerIcono(document.getElementById('icon-search'), Icons.search);
ponerIcono(document.getElementById('btn-send'),    Icons.send);

// ── Chat activo actualmente ──
var chatActivo = null;
var unsubscribeChat = null; // Listener de Firestore en tiempo real

// ── Lista de conversaciones ──
var conversaciones = Almacen.cargar('chat_convs');
if (conversaciones.length === 0) {
  conversaciones = [
    { id: 1, nombre: 'PetSpot', rol: 'Bienvenida', ultimo: '¡Hola! Te damos la bienvenida a PetSpot.' }
  ];
  Almacen.guardar('chat_convs', conversaciones);
}
if (!Array.isArray(conversaciones)) conversaciones = [];

// ── Mensajes de cada chat ──
function getMensajes(chatId) {
  var clave  = 'chat_msgs_' + chatId;
  var raw    = localStorage.getItem(Almacen.clave(clave));
  if (raw) return JSON.parse(raw);
  if (chatId === 1) {
    return [
      { texto: '¡Hola! Bienvenido/a a PetSpot. Aquí podrás chatear con tu veterinario.', hora: '09:00', tipo: 'recv' }
    ];
  }
  return [];
}

function guardarMensajes(chatId, msgs) {
  var clave = 'chat_msgs_' + chatId;
  localStorage.setItem(Almacen.clave(clave), JSON.stringify(msgs));
}

// ============================================================
// FIRESTORE CHAT - enviar y escuchar mensajes en tiempo real
// ============================================================
function getFirestoreChatId(chatId) {
  var user = PetSpot.getUser();
  if (!user || !user.uid) return null;
  return user.uid + '_chat_' + chatId;
}

function enviarMensajeFirestore(chatId, texto, hora) {
  if (typeof db === 'undefined') return;
  var user = PetSpot.getUser();
  if (!user || !user.uid) return;
  var firestoreChatId = getFirestoreChatId(chatId);
  if (!firestoreChatId) return;

  db.collection('chats').doc(firestoreChatId).collection('messages').add({
    texto: texto,
    hora: hora,
    tipo: 'sent',
    senderUid: user.uid,
    senderName: user.nombre,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(err) {
    console.warn('Error enviando mensaje a Firestore:', err);
  });
}

function escucharMensajesFirestore(chatId) {
  if (typeof db === 'undefined') return;
  var user = PetSpot.getUser();
  if (!user || !user.uid) return;

  // Cancelar listener anterior
  if (unsubscribeChat) {
    unsubscribeChat();
    unsubscribeChat = null;
  }

  var firestoreChatId = getFirestoreChatId(chatId);
  if (!firestoreChatId) return;

  unsubscribeChat = db.collection('chats').doc(firestoreChatId)
    .collection('messages')
    .orderBy('timestamp', 'asc')
    .onSnapshot(function(snapshot) {
      var contenedor = document.getElementById('chat-messages');
      if (!contenedor) return;
      while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

      snapshot.forEach(function(doc) {
        var msg = doc.data();
        contenedor.appendChild(crearBurbuja(msg.texto, msg.hora, msg.tipo));
      });
      contenedor.scrollTop = contenedor.scrollHeight;
    }, function(err) {
      console.warn('Error escuchando mensajes:', err);
    });
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

  var av = crearEl('div', {
    className: 'topbar-avatar',
    textContent: c.nombre[0],
    style: { width: '38px', height: '38px', fontSize: '15px', flexShrink: '0', borderRadius: '50%' }
  });

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

  el.addEventListener('click', crearHandlerChatClick(c.id));
  return el;
}

function crearHandlerChatClick(id) {
  return function() { abrirChat(id); };
}

// ============================================================
// ABRIR UN CHAT
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
  document.getElementById('chat-av').textContent   = conv.nombre[0];

  // Cargar mensajes locales primero
  var msgs      = getMensajes(id);
  var contenedor = document.getElementById('chat-messages');
  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

  for (var i = 0; i < msgs.length; i++) {
    contenedor.appendChild(crearBurbuja(msgs[i].texto, msgs[i].hora, msgs[i].tipo));
  }
  contenedor.scrollTop = contenedor.scrollHeight;

  // Activar listener de Firestore para mensajes en tiempo real
  escucharMensajesFirestore(id);
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

  // Enviar a Firestore
  enviarMensajeFirestore(chatActivo, texto, hora);

  // Actualizar el último mensaje de la conversación
  for (var i = 0; i < conversaciones.length; i++) {
    if (conversaciones[i].id === chatActivo) {
      conversaciones[i].ultimo = texto;
      break;
    }
  }
  Almacen.guardar('chat_convs', conversaciones);

  input.value = '';
}

// ── Render inicial ──
construirListaChats();
if (conversaciones.length > 0) {
  abrirChat(conversaciones[0].id);
}
