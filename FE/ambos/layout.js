// construye la sidebar, topbar y los iconos de la página
// innerHTML solo para insertar los svgs (LO SIENTO ORIOL)


function ponerIcono(contenedor, svgString) {
  // vaciamos el contenedor
  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);
  // insertamos svg
  contenedor.innerHTML = svgString;
  const svg = contenedor.firstElementChild;
  // ajustamos tamaño
  if (svg) {
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
  }
}
// buscamos los elementos html icon-x 
function cargarIconosPagina() {
  const aux = {
    cal: 'calendar',
    euro: 'euro',
    users: 'users',
    alert: 'alert',       
    home: 'home',
    chat: 'chat',
    map: 'map',
    shop: 'shop',
    user: 'user',
    chart: 'chart',
    card: 'card',
    plus: 'plus',
    check: 'check',
    x: 'x',
    edit: 'edit',
    trash: 'trash',
    send: 'send',
    search: 'search',
    logout: 'logout',
    moon: 'moon',
    sun: 'sun',
    box: 'box',
    pin: 'pin',
    phone: 'phone',
    stethoscope: 'stethoscope',
    paw: 'paw',
    dog: 'dog',
    cat: 'cat',
    rabbit: 'rabbit'
  };

  // aqui ponemos el icono que corresponda a lo de arriba
  for (let el in aux) {
    const elemento = document.getElementById(`icon-${el}`);
    if (elemento && Icons[aux[el]]) {
      ponerIcono(elemento, Icons[aux[el]]);
    }
  }
}

// si props no se pasa, sera un obj vacio
// se llama desde lo de crearloslayouts
function crearEl(tag, props = {}) {
  const el = document.createElement(tag);
  if (props.className) el.className = props.className;
  if (props.textContent) el.textContent = props.textContent;
  if (props.id) el.id = props.id;
  if (props.href) el.href = props.href;
  return el;
}

// las opciones que tendra el cliente, lo crea
function buildClienteLayout(paginaActiva) {
  const nav = [
    { id: 'inicio', icon: Icons.home,     label: 'Inicio'   },
    { id: 'citas',  icon: Icons.calendar, label: 'Citas'    },
    { id: 'chat',   icon: Icons.chat,     label: 'Chat'     },
    { id: 'mapa',   icon: Icons.map,      label: 'Mapa'     },
    { id: 'tienda', icon: Icons.shop,     label: 'Tienda'   },
    { id: 'perfil', icon: Icons.user,     label: 'Mi Perfil'}
  ];
  construirLayout(paginaActiva, nav, 'cliente');
}

// lo mismo pero de vet
function buildVetLayout(paginaActiva) {
  const plan = PetSpot.getPlan();
  const nav = [
    { id: 'inicio',      icon: Icons.home,     label: 'Inicio'      },
    { id: 'citas',       icon: Icons.calendar, label: 'Citas'       },
    { id: 'chat',        icon: Icons.chat,     label: 'Chat'        },
    { id: 'tienda',      icon: Icons.shop,     label: 'Tienda'      },
    { id: 'suscripcion', icon: Icons.card,     label: 'Suscripción' },
    { id: 'perfil',      icon: Icons.user,     label: 'Mi Perfil'   }
  ];
  // ESTO ES OPCIONAL, BORRALO SINO
  if (plan === 'enterprise') {
    nav.splice(4, 0, { id: 'analiticas', icon: Icons.chart, label: 'Analíticas' });
  }
  construirLayout(paginaActiva, nav, 'veterinario');
}

// esto construye lo que le pasemos de las dos funciones de arriba
function construirLayout(paginaActiva, nav, tipo) {
  const oscuro = localStorage.getItem('ps_dark') !== 'false';

  // SIDEBAR 
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  // LOGO
  const logoDiv = crearEl('div', { className: 'sidebar-logo' });
  const logoIcon = crearEl('div', { className: 'logo-icon' });
  ponerIcono(logoIcon, Icons.logoPaw);
  const logoNombre = crearEl('span', { className: 'logo-name', textContent: 'PetSpot' });
  logoDiv.appendChild(logoIcon);
  logoDiv.appendChild(logoNombre);
  sidebar.appendChild(logoDiv);

  // SIDEBAR
  const navEl = crearEl('nav', { className: 'sidebar-nav' });
  const navLabel = crearEl('div', { className: 'nav-label', textContent: 'Menú' });
  navEl.appendChild(navLabel);

  //menu
  nav.forEach(item => {
    const link = document.createElement('a');
    link.href = `${item.id}.html`;
    link.className = 'nav-item' + (item.id === paginaActiva ? ' active' : '');

    const iconSpan = document.createElement('span');
    iconSpan.style.display = 'flex';
    iconSpan.style.alignItems = 'center';
    iconSpan.style.width = '18px';
    iconSpan.style.height = '18px';
    iconSpan.style.flexShrink = '0';
    ponerIcono(iconSpan, item.icon);

    const textSpan = crearEl('span', { textContent: item.label });

    link.appendChild(iconSpan);
    link.appendChild(textSpan);
    navEl.appendChild(link);
  });

  sidebar.appendChild(navEl);

  // MODO OSCURO...
  const bottom = crearEl('div', { className: 'sidebar-bottom' });

  const themeRow = crearEl('div', { className: 'theme-toggle-row' });
  const themeIconSpan = document.createElement('span');
  themeIconSpan.id = 'theme-icon-svg';
  themeIconSpan.style.display = 'flex';
  themeIconSpan.style.width = '18px';
  themeIconSpan.style.height = '18px';
  themeIconSpan.style.flexShrink = '0';
  themeIconSpan.style.opacity = '0.7';
  ponerIcono(themeIconSpan, oscuro ? Icons.moon : Icons.sun);

  const themeLabel = crearEl('span', { textContent: oscuro ? 'Modo claro' : 'Modo oscuro' });
  themeLabel.id = 'theme-label';

  // botondemodoscuroyblanco
  const themeToggle = crearEl('div', { className: 'toggle-switch' + (!oscuro ? ' on' : '') });
  themeToggle.id = 'theme-toggle';

  themeRow.appendChild(themeIconSpan);
  themeRow.appendChild(themeLabel);
  themeRow.appendChild(themeToggle);
  bottom.appendChild(themeRow);

  // LO DE CERRAR SESION
  const logoutBtn = crearEl('button', { className: 'btn-logout', id: 'logout-btn' });
  const logoutIconSpan = document.createElement('span');
  logoutIconSpan.style.display = 'flex';
  logoutIconSpan.style.width = '18px';
  logoutIconSpan.style.height = '18px';
  logoutIconSpan.style.flexShrink = '0';
  ponerIcono(logoutIconSpan, Icons.logout);
  const logoutText = crearEl('span', { textContent: 'Cerrar sesión' });
  logoutBtn.appendChild(logoutIconSpan);
  logoutBtn.appendChild(logoutText);
  bottom.appendChild(logoutBtn);

  sidebar.appendChild(bottom);

  // TOPBAR, lo de olamaria
  const topbar = document.createElement('header');
  topbar.className = 'topbar';

  const greeting = crearEl('div', { className: 'topbar-greeting', id: 'topbar-greeting' });
  const spacer = crearEl('div', { className: 'topbar-spacer' });
  const avatar = crearEl('div', { className: 'topbar-avatar', id: 'topbar-avatar' });
  avatar.textContent = 'U';
  avatar.title = 'Mi perfil';
  avatar.style.cursor = 'pointer';

  topbar.appendChild(greeting);
  topbar.appendChild(spacer);
  topbar.appendChild(avatar);

  document.body.insertBefore(topbar, document.body.firstChild);
  document.body.insertBefore(sidebar, document.body.firstChild);

  PetSpot.setTopbar();

  avatar.addEventListener('click', () => {
    window.location.href = 'perfil.html';
  });

  themeToggle.addEventListener('click', () => {
    PetSpot.toggleTheme();
    const ahora = localStorage.getItem('ps_dark') !== 'false';
    themeToggle.classList.toggle('on', !ahora);
    themeLabel.textContent = ahora ? 'Modo claro' : 'Modo oscuro';
    ponerIcono(themeIconSpan, ahora ? Icons.moon : Icons.sun);
  });

  logoutBtn.addEventListener('click', () => {
    PetSpot.logout();
  });

  cargarIconosPagina();
}