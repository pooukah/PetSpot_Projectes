// PetSpot — Funciones compartidas
// Gestiona sesión, tema, notificaciones y datos persistentes en localStorage

// ============================================================
// OBJETO PRINCIPAL
// ============================================================
var PetSpot = {

  // Obtiene los datos del usuario de sessionStorage
  getUser: function() {
    var datos = sessionStorage.getItem('ps_user');
    if (datos) return JSON.parse(datos);
    return null;
  },

  // Guarda los datos del usuario en sessionStorage
  setUser: function(usuario) {
    sessionStorage.setItem('ps_user', JSON.stringify(usuario));
  },

  // Cierra la sesión y vuelve al login
  logout: function() {
    sessionStorage.clear();
    // Subimos dos niveles desde cliente/htmls o veterinario/htmls
    var partes = window.location.pathname.split('/');
    if (partes.length >= 4) {
      window.location.href = '../../index.html';
    } else {
      window.location.href = '../index.html';
    }
  },

  // Aplica el tema (color del perfil + claro/oscuro)
  applyTheme: function() {
    var user = this.getUser();
    if (!user) return;
    document.body.classList.remove('cliente', 'veterinario');
    document.body.classList.add(user.tipo);
    var oscuro = localStorage.getItem('ps_dark') !== 'false';
    document.body.classList.toggle('modoclaro', !oscuro);
  },

  // Alterna entre modo claro y oscuro
  toggleTheme: function() {
    var oscuro = localStorage.getItem('ps_dark') !== 'false';
    localStorage.setItem('ps_dark', oscuro ? 'false' : 'true');
    document.body.classList.toggle('modoclaro', oscuro);
  },

  // Comprueba que el usuario está logueado y es del tipo correcto
  requireAuth: function(tipo) {
    var user = this.getUser();
    var partes = window.location.pathname.split('/');
    var raiz = partes.length >= 4 ? '../../' : '../';
    if (!user) {
      window.location.href = raiz + 'index.html';
      return false;
    }
    if (tipo && user.tipo !== tipo) {
      if (user.tipo === 'cliente') {
        window.location.href = raiz + 'cliente/htmls/inicio.html';
      } else {
        window.location.href = raiz + 'veterinario/htmls/inicio.html';
      }
      return false;
    }
    return true;
  },

  // Muestra un mensaje temporal en la esquina inferior derecha
  // Usa setTimeout para quitarlo después de unos segundos
  notify: function(mensaje) {
    var notif = document.querySelector('.notif');
    if (!notif) {
      notif = document.createElement('div');
      notif.className = 'notif';
      document.body.appendChild(notif);
    }
    notif.textContent = mensaje;
    notif.classList.add('show');
    // Guardar el timer para cancelarlo si se llama de nuevo antes de que acabe
    clearTimeout(notif._timer);
    notif._timer = setTimeout(function() {
      notif.classList.remove('show');
    }, 3200);
  },

  // Actualiza el saludo del topbar con el nombre actual
  setTopbar: function() {
    var user = this.getUser();
    if (!user) return;
    var saludo = document.getElementById('topbar-greeting');
    if (saludo) {
      saludo.textContent = '';
      if (user.tipo === 'veterinario') {
        saludo.appendChild(document.createTextNode('Bienvenido, '));
        var strong = document.createElement('strong');
        strong.textContent = 'Dr./Dra. ' + user.nombre;
        saludo.appendChild(strong);
      } else {
        saludo.appendChild(document.createTextNode('Hola, '));
        var strong = document.createElement('strong');
        strong.textContent = user.nombre;
        saludo.appendChild(strong);
      }
    }
    var avatar = document.getElementById('topbar-avatar');
    if (avatar) {
      avatar.textContent = user.nombre ? user.nombre[0].toUpperCase() : 'U';
    }
  },

  // Inicializa la página (auth + tema)
  init: function(tipo) {
    if (!this.requireAuth(tipo)) return;
    this.applyTheme();
  },

  // ── Plan de suscripción del veterinario ──
  getPlan: function() {
    return localStorage.getItem('ps_plan') || 'basico';
  },
  setPlan: function(plan) {
    localStorage.setItem('ps_plan', plan);
  }

};

// ============================================================
// ALMACENAMIENTO PERSISTENTE (localStorage)
// Los datos del usuario se guardan y recuperan aunque se recargue la página
// ============================================================
var Almacen = {

  // Clave única por usuario para separar datos entre cuentas
  clave: function(tipo) {
    var user = PetSpot.getUser();
    var id = user ? user.email.replace(/[^a-z0-9]/gi, '') : 'guest';
    return 'ps_' + tipo + '_' + id;
  },

  // Guarda un array en localStorage
  guardar: function(tipo, datos) {
    localStorage.setItem(this.clave(tipo), JSON.stringify(datos));
  },

  // Recupera un array de localStorage (devuelve [] si no hay nada)
  cargar: function(tipo) {
    var raw = localStorage.getItem(this.clave(tipo));
    if (raw) return JSON.parse(raw);
    return [];
  },

  // Borra todos los datos de un tipo
  borrar: function(tipo) {
    localStorage.removeItem(this.clave(tipo));
  }

};

// ============================================================
// FUNCIÓN AUXILIAR: crear un elemento HTML sin innerHTML
// Uso: crearEl('div', { className: 'card', textContent: 'Hola' })
// ============================================================
function crearEl(tag, props) {
  var el = document.createElement(tag);
  if (!props) return el;
  for (var clave in props) {
    if (clave === 'className') {
      el.className = props[clave];
    } else if (clave === 'textContent') {
      el.textContent = props[clave];
    } else if (clave === 'style') {
      // props.style es un objeto: { color: 'red', fontSize: '14px' }
      for (var prop in props[clave]) {
        el.style[prop] = props[clave][prop];
      }
    } else {
      el.setAttribute(clave, props[clave]);
    }
  }
  return el;
}

// ============================================================
// FUNCIÓN AUXILIAR: poner un icono SVG en un elemento
// Como no podemos usar innerHTML, insertamos el SVG parseado
// ============================================================
function ponerIcono(elemento, svgString) {
  if (!elemento) return;
  // Borramos lo que hubiera antes
  while (elemento.firstChild) {
    elemento.removeChild(elemento.firstChild);
  }
  // Parsear el SVG y añadirlo
  var parser = new DOMParser();
  var doc    = parser.parseFromString(svgString, 'image/svg+xml');
  var svg    = doc.documentElement;
  elemento.appendChild(svg);
}

// ============================================================
// DATOS INICIALES DE LA TIENDA (siempre disponibles)
// Las mascotas y citas empiezan vacías — el usuario las crea
// ============================================================
var MockData = {

  // Productos de la tienda — siempre están disponibles
  productos: [
    { id: 1, nombre: 'Pienso Premium Adulto', precio: 38.99, stock: 45, ventas: 120, cat: 'Alimentación', visible: true, imagen: null },
    { id: 2, nombre: 'Collar Antipulgas',      precio: 14.50, stock: 32, ventas: 89,  cat: 'Salud',        visible: true, imagen: null },
    { id: 3, nombre: 'Vitaminas K9 Pro',       precio: 22.00, stock: 18, ventas: 67,  cat: 'Salud',        visible: true, imagen: null },
    { id: 4, nombre: 'Arnés Ergonómico',       precio: 29.95, stock: 12, ventas: 43,  cat: 'Accesorios',   visible: true, imagen: null },
    { id: 5, nombre: 'Arena Sílice Gato',      precio: 11.99, stock: 60, ventas: 210, cat: 'Higiene',      visible: true, imagen: null },
    { id: 6, nombre: 'Champú Hipoalergénico',  precio: 8.75,  stock: 28, ventas: 55,  cat: 'Higiene',      visible: true, imagen: null },
    { id: 7, nombre: 'Juguete Interactivo',    precio: 16.50, stock: 35, ventas: 78,  cat: 'Juguetes',     visible: true, imagen: null },
    { id: 8, nombre: 'Cama Ortopédica M',      precio: 54.00, stock: 8,  ventas: 31,  cat: 'Descanso',     visible: true, imagen: null }
  ],

  // Clínicas del mapa
  clinicas: [
    { id: 0, nombre: 'Clínica VetPro',          dir: 'Carrer de Balmes, 120',      dist: '0.3 km', rating: 4.9, abierta: true,  h24: false, urgencias: true,  tel: '932 456 789', lat: 41.3940, lng: 2.1511 },
    { id: 1, nombre: 'VetSalut Barcelona',       dir: 'Av. Diagonal, 450',          dist: '0.8 km', rating: 4.7, abierta: true,  h24: true,  urgencias: true,  tel: '934 123 456', lat: 41.3948, lng: 2.1565 },
    { id: 2, nombre: 'AnimaCare Vet',            dir: 'Carrer de Provença, 88',     dist: '1.2 km', rating: 4.5, abierta: false, h24: false, urgencias: false, tel: '933 987 654', lat: 41.3922, lng: 2.1575 },
    { id: 3, nombre: 'Hospital Veterinari BCN',  dir: 'Gran Via de les Corts, 600', dist: '2.1 km', rating: 4.8, abierta: true,  h24: true,  urgencias: true,  tel: '931 234 567', lat: 41.3800, lng: 2.1510 }
  ],

  // Clientes del veterinario (lado vet)
  clientes: [
    { id: 1, nombre: 'María Fernández',   email: 'maria@email.com',   mascotas: ['Kira (Perro)', 'Mimo (Gato)'],     ultima: '14/03/2026' },
    { id: 2, nombre: 'Jordi Puig',        email: 'jordi@email.com',   mascotas: ['Rocky (Perro)'],                   ultima: '10/03/2026' },
    { id: 3, nombre: 'Ana González',      email: 'ana@email.com',     mascotas: ['Perla (Gato)', 'Bomba (Hámster)'], ultima: '05/03/2026' },
    { id: 4, nombre: 'Carlos Rodríguez',  email: 'carlos@email.com',  mascotas: ['Max (Perro)'],                     ultima: '01/03/2026' }
  ],

  // Productos veterinario (mismos que tienda cliente al principio)
  productosVet: [
    { id: 1, nombre: 'Pienso Premium Adulto', precio: 38.99, stock: 45, ventas: 120, cat: 'Alimentación', visible: true, imagen: null },
    { id: 2, nombre: 'Collar Antipulgas',      precio: 14.50, stock: 32, ventas: 89,  cat: 'Salud',        visible: true, imagen: null },
    { id: 3, nombre: 'Vitaminas K9 Pro',       precio: 22.00, stock: 18, ventas: 67,  cat: 'Salud',        visible: true, imagen: null },
    { id: 4, nombre: 'Arnés Ergonómico',       precio: 29.95, stock: 12, ventas: 43,  cat: 'Accesorios',   visible: true, imagen: null }
  ]

};
