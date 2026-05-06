PetSpot.init('veterinario');
buildVetLayout('chat');

ponerIcono(document.getElementById('icon-search'), Icons.search);
ponerIcono(document.getElementById('btn-send'),    Icons.send);

let chatActivo = null;

let conversaciones = Almacen.cargar('chat_convs_vet');
if (!Array.isArray(conversaciones) || conversaciones.length === 0) {
  conversaciones = [
    { id: 1, nombre: 'PetSpot', rol: 'Sistema', ultimo: 'Bienvenido al chat de PetSpot.' }
  ];
  Almacen.guardar('chat_convs_vet', conversaciones);
}

const getMensajes = function(chatId) {
  let raw = localStorage.getItem(Almacen.clave('vmsg_' + chatId));
  if (raw) return JSON.parse(raw);
  if (chatId === 1) {
    return [{ texto: 'Bienvenido al panel de chat. Busca un cliente por email para iniciar una conversación.', hora: '09:00', tipo: 'recv' }];
  }
  return [];
};

const guardarMensajes = function(chatId, msgs) {
  localStorage.setItem(Almacen.clave('vmsg_' + chatId), JSON.stringify(msgs));
};
const buscarCliente = function() {
  let input = document.getElementById('search-email');
  let email = input.value.trim().toLowerCase();
  if (!email) return;

  let clienteEncontrado = null;
  
// FETCH AQUI para buscar al cliente por email

  if (!clienteEncontrado) {
    PetSpot.notify('No se encontró ningún cliente con ese correo');
    return;
  }

  let yaExiste = false;
  for (let i = 0; i < conversaciones.length; i++) {
    if (conversaciones[i].email === clienteEncontrado.email) {
      abrirChat(conversaciones[i].id);
      yaExiste = true;
      break;
    }
  }

  if (!yaExiste) {
    let nuevaConv = {
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
    PetSpot.notify('Chat iniciado con ' + clienteEncontrado.nombre);
  }

  input.value = '';
};
const construirListaChats = function() {
  let contenedor = document.getElementById('chat-list-items');
  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

  for (let i = 0; i < conversaciones.length; i++) {
    contenedor.appendChild(construirItemChat(conversaciones[i]));
  }
};

const construirItemChat = function(c){
  let el = crearEl('div', { className: 'chat-item' + (c.id === chatActivo ? ' active' : '') });
  el.dataset.id = c.id;

  let av = crearEl('div', {
    className: 'topbar-avatar',
    textContent: c.nombre[0],
    style: { width: '38px', height: '38px', fontSize: '15px', flexShrink: '0', borderRadius: '50%' }
  });

  let infoDiv = document.createElement('div');
  infoDiv.style.flex    = '1';
  infoDiv.style.minWidth = '0';

  let topRow = document.createElement('div');
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
};

const crearHandlerChatClick = function(id) {
  return function() { abrirChat(id); };
};

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
  document.getElementById('chat-sub').textContent  = conv.rol || '';
  document.getElementById('chat-av').textContent   = conv.nombre[0];

  let msgs = getMensajes(id);
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
  Almacen.guardar('chat_convs_vet', conversaciones);
  input.value = '';
};

construirListaChats();
if (conversaciones.length > 0) abrirChat(conversaciones[0].id);
