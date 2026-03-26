// PetSpot — Chat del veterinario
// Mensajes en tiempo real con Firestore

PetSpot.init('veterinario');
buildVetLayout('chat');

ponerIcono(document.getElementById('icon-search'), Icons.search);
ponerIcono(document.getElementById('btn-send'),    Icons.send);

var chatActivo = null;
var unsubscribeChat = null;

var conversaciones = Almacen.cargar('chat_convs_vet');
if (!Array.isArray(conversaciones) || conversaciones.length === 0) {
  conversaciones = [
    { id: 1, nombre: 'PetSpot', rol: 'Sistema', ultimo: 'Bienvenido al chat de PetSpot.' }
  ];
  Almacen.guardar('chat_convs_vet', conversaciones);
}

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
// FIRESTORE CHAT
// ============================================================
function getFirestoreChatId(chatId) {
  var user = PetSpot.getUser();
  if (!user || !user.uid) return null;
  return user.uid + '_vchat_' + chatId;
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
// BUSCAR CLIENTE POR EMAIL
// ============================================================
function buscarCliente() {
  var input = document.getElementById('search-email');
  var email = input.value.trim().toLowerCase();
  if (!email) return;

  // Buscar en Firestore primero, luego en MockData
  if (typeof db !== 'undefined') {
    db.collection('users').where('email', '==', email).where('tipo', '==', 'cliente').get()
      .then(function(querySnapshot) {
        if (!querySnapshot.empty) {
          var doc = querySnapshot.docs[0];
          var data = doc.data();
          abrirOCrearConversacion({
            nombre: data.nombre,
            email: data.email,
            mascotas: data.mascotas ? data.mascotas.map(function(m) { return m.nombre + ' (' + m.especie + ')'; }) : []
          });
        } else {
          buscarEnMockData(email);
        }
      })
      .catch(function(err) {
        console.warn('Error buscando en Firestore:', err);
        buscarEnMockData(email);
      });
  } else {
    buscarEnMockData(email);
  }
  input.value = '';
}

function buscarEnMockData(email) {
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

  abrirOCrearConversacion(clienteEncontrado);
}

function abrirOCrearConversacion(cliente) {
  var yaExiste = false;
  for (var i = 0; i < conversaciones.length; i++) {
    if (conversaciones[i].email === cliente.email) {
      abrirChat(conversaciones[i].id);
      yaExiste = true;
      break;
    }
  }

  if (!yaExiste) {
    var mascotasTexto = Array.isArray(cliente.mascotas) ? cliente.mascotas.join(', ') : '';
    var nuevaConv = {
      id:     Date.now(),
      nombre: cliente.nombre,
      rol:    mascotasTexto,
      email:  cliente.email,
      ultimo: 'Nueva conversación'
    };
    conversaciones.push(nuevaConv);
    Almacen.guardar('chat_convs_vet', conversaciones);
    construirListaChats();
    abrirChat(nuevaConv.id);
    PetSpot.notify('Chat iniciado con ' + cliente.nombre);
  }
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

  escucharMensajesFirestore(id);
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

  enviarMensajeFirestore(chatActivo, texto, hora);

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
