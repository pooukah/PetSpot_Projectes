// PetSpot — Construye la sidebar y el topbar de cada página
// Sin innerHTML — todo con createElement y appendChild

// ── Nav del cliente (sin packs, sin badges) ──
function buildClienteLayout(paginaActiva) {
  var nav = [
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
  var plan = PetSpot.getPlan();
  var nav = [
    { id: 'inicio',      icon: Icons.home,     label: 'Inicio'      },
    { id: 'citas',       icon: Icons.calendar, label: 'Citas'       },
    { id: 'chat',        icon: Icons.chat,     label: 'Chat'        },
    { id: 'tienda',      icon: Icons.shop,     label: 'Tienda'      },
    { id: 'suscripcion', icon: Icons.card,     label: 'Suscripción' },
    { id: 'perfil',      icon: Icons.user,     label: 'Mi Perfil'   }
  ];
  // Solo añadimos Analíticas si el plan es Enterprise
  if (plan === 'enterprise') {
    nav.splice(4, 0, { id: 'analiticas', icon: Icons.chart, label: 'Analíticas' });
  }
  construirLayout(paginaActiva, nav, 'veterinario');
}

// ── Función principal que construye sidebar + topbar ──
function construirLayout(paginaActiva, nav, tipo) {
  var oscuro = localStorage.getItem('ps_dark') !== 'false';

  // === SIDEBAR ===
  var sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  // Logo
  var logoDiv = crearEl('div', { className: 'sidebar-logo' });
  var logoIcon = crearEl('div', { className: 'logo-icon' });
  ponerIcono(logoIcon, Icons.logoPaw);
  var logoNombre = crearEl('span', { className: 'logo-name', textContent: 'PetSpot' });
  logoDiv.appendChild(logoIcon);
  logoDiv.appendChild(logoNombre);
  sidebar.appendChild(logoDiv);

  // Nav
  var nav_el = document.createElement('nav');
  nav_el.className = 'sidebar-nav';

  var navLabel = crearEl('div', { className: 'nav-label', textContent: 'Menú' });
  nav_el.appendChild(navLabel);

  // Crear cada item del menú
  for (var i = 0; i < nav.length; i++) {
    var n = nav[i];
    var href = n.id + '.html';
    var link = document.createElement('a');
    link.href = href;
    link.className = 'nav-item' + (n.id === paginaActiva ? ' active' : '');

    // Icono SVG
    var iconSpan = document.createElement('span');
    iconSpan.style.display = 'flex';
    iconSpan.style.alignItems = 'center';
    iconSpan.style.width = '18px';
    iconSpan.style.height = '18px';
    iconSpan.style.flexShrink = '0';
    ponerIcono(iconSpan, n.icon);
    link.appendChild(iconSpan);

    // Texto
    var textSpan = crearEl('span', { textContent: n.label });
    link.appendChild(textSpan);

    nav_el.appendChild(link);
  }
  sidebar.appendChild(nav_el);

  // Parte inferior: toggle tema + cerrar sesión
  var bottom = crearEl('div', { className: 'sidebar-bottom' });

  // Fila del toggle de tema
  var themeRow = crearEl('div', { className: 'theme-toggle-row' });
  var themeIconSpan = document.createElement('span');
  themeIconSpan.id = 'theme-icon-svg';
  themeIconSpan.style.display = 'flex';
  themeIconSpan.style.width = '18px';
  themeIconSpan.style.height = '18px';
  themeIconSpan.style.flexShrink = '0';
  themeIconSpan.style.opacity = '0.7';
  ponerIcono(themeIconSpan, oscuro ? Icons.moon : Icons.sun);

  var themeLabel = crearEl('span', {
    textContent: oscuro ? 'Modo claro' : 'Modo oscuro'
  });
  themeLabel.id = 'theme-label';

  var themeToggle = crearEl('div', { className: 'toggle-switch' + (!oscuro ? ' on' : '') });
  themeToggle.id = 'theme-toggle';

  themeRow.appendChild(themeIconSpan);
  themeRow.appendChild(themeLabel);
  themeRow.appendChild(themeToggle);
  bottom.appendChild(themeRow);

  // Botón cerrar sesión
  var logoutBtn = document.createElement('button');
  logoutBtn.className = 'btn-logout';
  logoutBtn.id = 'logout-btn';
  var logoutIcon = document.createElement('span');
  logoutIcon.style.display = 'flex';
  logoutIcon.style.width = '18px';
  logoutIcon.style.height = '18px';
  logoutIcon.style.flexShrink = '0';
  ponerIcono(logoutIcon, Icons.logout);
  var logoutText = crearEl('span', { textContent: 'Cerrar sesión' });
  logoutBtn.appendChild(logoutIcon);
  logoutBtn.appendChild(logoutText);
  bottom.appendChild(logoutBtn);

  sidebar.appendChild(bottom);

  // === TOPBAR ===
  var topbar = document.createElement('header');
  topbar.className = 'topbar';

  var greeting = crearEl('div', { className: 'topbar-greeting' });
  greeting.id = 'topbar-greeting';

  var spacer = crearEl('div', { className: 'topbar-spacer' });

  var avatar = crearEl('div', { className: 'topbar-avatar' });
  avatar.id = 'topbar-avatar';
  avatar.textContent = 'U';
  avatar.title = 'Mi perfil';
  avatar.style.cursor = 'pointer';

  topbar.appendChild(greeting);
  topbar.appendChild(spacer);
  topbar.appendChild(avatar);

  // Insertar en el body (sidebar va primero)
  document.body.insertBefore(topbar, document.body.firstChild);
  document.body.insertBefore(sidebar, document.body.firstChild);

  // Poner el saludo con el nombre del usuario
  PetSpot.setTopbar();

  // El avatar lleva al perfil
  avatar.addEventListener('click', function() {
    window.location.href = 'perfil.html';
  });

  // Toggle de tema — cambia modo claro/oscuro
  themeToggle.addEventListener('click', function() {
    PetSpot.toggleTheme();
    var ahora = localStorage.getItem('ps_dark') !== 'false';
    themeToggle.classList.toggle('on', !ahora);
    themeLabel.textContent = ahora ? 'Modo claro' : 'Modo oscuro';
    // Cambiar el icono del sol/luna
    ponerIcono(themeIconSpan, ahora ? Icons.moon : Icons.sun);
  });

  // Botón de cerrar sesión
  logoutBtn.addEventListener('click', function() {
    PetSpot.logout();
  });
}
