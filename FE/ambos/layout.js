// PetSpot — Construye la sidebar, topbar y los iconos de la página
// Permite innerHTML solo para insertar los SVGs desde el objeto Icons

// ── Convierte un string SVG en un nodo y lo mete en el contenedor ──
function ponerIcono(contenedor, svgString) {
  // Vaciamos el contenedor
  while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);
  // Insertamos el SVG usando innerHTML (controlado, solo para iconos)
  contenedor.innerHTML = svgString;
  // Ajustamos el SVG para que herede el color y tamaño
  const svg = contenedor.firstElementChild;
  if (svg) {
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
  }
}

// ── Carga todos los iconos que hay en la página (span con id="icon-xxx") ──
function cargarIconosPagina() {
  const mapa = {
    cal: 'calendar',
    euro: 'euro',
    users: 'users',
    alert: 'alert',       // Si no existe en Icons, añádelo
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

  for (let sufijo in mapa) {
    const elemento = document.getElementById(`icon-${sufijo}`);
    if (elemento && Icons[mapa[sufijo]]) {
      ponerIcono(elemento, Icons[mapa[sufijo]]);
    }
  }
}

// ── Helper para crear elementos con atributos comunes ──
function crearEl(tag, props = {}) {
  const el = document.createElement(tag);
  if (props.className) el.className = props.className;
  if (props.textContent) el.textContent = props.textContent;
  if (props.id) el.id = props.id;
  if (props.href) el.href = props.href;
  return el;
}

// ── Nav del cliente (sin packs, sin badges) ──
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

// ── Nav del veterinario (analíticas solo si tiene plan Enterprise) ──
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
  if (plan === 'enterprise') {
    nav.splice(4, 0, { id: 'analiticas', icon: Icons.chart, label: 'Analíticas' });
  }
  construirLayout(paginaActiva, nav, 'veterinario');
}

// ── Construcción principal de la interfaz (sidebar + topbar) ──
function construirLayout(paginaActiva, nav, tipo) {
  const oscuro = localStorage.getItem('ps_dark') !== 'false';

  // ========== SIDEBAR ==========
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  // Logo
  const logoDiv = crearEl('div', { className: 'sidebar-logo' });
  const logoIcon = crearEl('div', { className: 'logo-icon' });
  ponerIcono(logoIcon, Icons.logoPaw);
  const logoNombre = crearEl('span', { className: 'logo-name', textContent: 'PetSpot' });
  logoDiv.appendChild(logoIcon);
  logoDiv.appendChild(logoNombre);
  sidebar.appendChild(logoDiv);

  // Navegación
  const navEl = crearEl('nav', { className: 'sidebar-nav' });
  const navLabel = crearEl('div', { className: 'nav-label', textContent: 'Menú' });
  navEl.appendChild(navLabel);

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

  // Parte inferior (tema + cerrar sesión)
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

  const themeToggle = crearEl('div', { className: 'toggle-switch' + (!oscuro ? ' on' : '') });
  themeToggle.id = 'theme-toggle';

  themeRow.appendChild(themeIconSpan);
  themeRow.appendChild(themeLabel);
  themeRow.appendChild(themeToggle);
  bottom.appendChild(themeRow);

  // Botón cerrar sesión
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

  // ========== TOPBAR ==========
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

  // Insertar en el DOM (sidebar va primero, luego topbar)
  document.body.insertBefore(topbar, document.body.firstChild);
  document.body.insertBefore(sidebar, document.body.firstChild);

  // Asignar funcionalidad
  PetSpot.setTopbar(); // rellena saludo y avatar

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

  // Cargar los iconos que están dentro del contenido de la página
  cargarIconosPagina();
}