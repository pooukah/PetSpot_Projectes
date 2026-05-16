// objeto
const PetSpot = {
  getUser: function() {
    let datos = sessionStorage.getItem('ps_user');
    if (datos) return JSON.parse(datos);
    return null;
  },
  setUser: function(usuario) {
    sessionStorage.setItem('ps_user', JSON.stringify(usuario));
  },
  logout: function() {
    sessionStorage.clear();
    let partes = window.location.pathname.split('/');
    if (partes.length >= 4) {
      window.location.href = '../../index.html';
    } else {
      window.location.href = '../index.html';
    }
  },
  applyTheme: function() {
    let user = this.getUser();
    if (!user) return;
    document.body.classList.remove('cliente', 'veterinario');
    document.body.classList.add(user.tipo);
    let oscuro = localStorage.getItem('ps_dark') !== 'false';
    document.body.classList.toggle('modoclaro', !oscuro);
  },

  // alterna entre modo claro y oscuro
  toggleTheme: function() {
    let oscuro = localStorage.getItem('ps_dark') !== 'false';
    localStorage.setItem('ps_dark', oscuro ? 'false' : 'true');
    document.body.classList.toggle('modoclaro', oscuro);
  },

  requireAuth: function(tipo) {
    let user = this.getUser();
    let partes = window.location.pathname.split('/');
    let raiz = partes.length >= 4 ? '../../' : '../';
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

  notify: function(mensaje) {
    let notif = document.querySelector('.notif');
    if (!notif) {
      notif = document.createElement('div');
      notif.className = 'notif';
      document.body.appendChild(notif);
    }
    notif.textContent = mensaje;
    notif.classList.add('show');
    clearTimeout(notif._timer);
    notif._timer = setTimeout(function() {
      notif.classList.remove('show');
    }, 3200);
  },

  setTopbar: function() {
    let user = this.getUser();
    if (!user) return;
    let saludo = document.getElementById('topbar-greeting');
    if (saludo) {
      saludo.textContent = '';
      if (user.tipo === 'veterinario') {
        saludo.appendChild(document.createTextNode('Bienvenido, '));
        let strong = document.createElement('strong');
        strong.textContent = 'Dr./Dra. ' + user.nombre;
        saludo.appendChild(strong);
      } else {
        saludo.appendChild(document.createTextNode('Hola, '));
        let strong = document.createElement('strong');
        strong.textContent = user.nombre;
        saludo.appendChild(strong);
      }
    }
    let avatar = document.getElementById('topbar-avatar');
    if (avatar) {
      avatar.textContent = user.nombre ? user.nombre[0].toUpperCase() : 'U';
    }
  },

  init: function(tipo) {
    if (!this.requireAuth(tipo)) return;
    this.applyTheme();
  },

  getPlan: function() {
    return sessionStorage.getItem('ps_plan') || 'basico';
  },
  setPlan: function(plan) {
    sessionStorage.setItem('ps_plan', plan);
  }

};

// objeto
let Almacen = {
  clave: function(tipo) {
    let user = PetSpot.getUser();
    let id = user ? user.email.replace(/[^a-z0-9]/gi, '') : 'guest';
    return 'ps_' + tipo + '_' + id;
  },

  guardar: function(tipo, datos) {
    sessionStorage.setItem(this.clave(tipo), JSON.stringify(datos));
  },

  cargar: function(tipo) {
    let raw = sessionStorage.getItem(this.clave(tipo));
    if (raw) return JSON.parse(raw);
    return [];
  },

  borrar: function(tipo) {
    sessionStorage.removeItem(this.clave(tipo));
  }

};

const crearEl = function(tag, props) {
  let el = document.createElement(tag);
  if (!props) return el;
  for (let clave in props) {
    if (clave === 'className') {
      el.className = props[clave];
    } else if (clave === 'textContent') {
      el.textContent = props[clave];
    } else if (clave === 'style') {
      for (let prop in props[clave]) {
        el.style[prop] = props[clave][prop];
      }
    } else {
      el.setAttribute(clave, props[clave]);
    }
  }
  return el;
};

const ponerIcono = function(elemento, svgString) {
  if (!elemento) return;
  elemento.innerHTML = svgString;
};
