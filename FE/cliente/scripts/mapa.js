import { Mapa } from "../../models/Mapa.js";

PetSpot.init('cliente');
buildClienteLayout('mapa');

var mapaInstance = null;    
var marcadores = [];      
var clinicas = [];
var clinicasFiltradas = [];   
var filtroActivo = 'todas'; 

async function cargarClinicas(){
  const API_URL = "https://localhost:443/clinicas";
  console.log('1. Iniciando fetch...');
  try{
    const resposta = await fetch(API_URL, {
      method: 'GET',
      headers: {'Accept': 'application/json'}
    });
    console.log('2. Respuesta recibida, status:', resposta.status);
    if(!resposta.ok){
      throw new Error("No se han podido cargar las clinicas");
    }
    clinicas = await resposta.json();
    console.log('3. Clinicas recibidas:', clinicas);
    aplicarFiltro('todas', null);
    console.log('4. clinicasFiltradas:', clinicasFiltradas);
  }catch(error){
    console.error('ERROR en cargarClinicas:', error);
    PetSpot.notify("ERROR: al cargar clinicas");
  }
}

function iniciarMapa(){
  const bcn = { lat:41.3874, lng:2.1686 };
  mapaInstance = new Mapa(bcn.lat, bcn.lng);
  mapaInstance.obtenirPosicio();

  if (clinicasFiltradas.length > 0) {
    actualizarMarcadores();
  }
}

// Devuelve el estilo oscuro o claro del mapa según el tema actual
function obtenerEstiloMapa() {
  var oscuro = localStorage.getItem('ps_dark') !== 'false';
  if (!oscuro) return []; 
  return [
    { elementType: 'geometry',              stylers: [{ color: '#1e2535' }] },
    { elementType: 'labels.text.stroke',    stylers: [{ color: '#1e2535' }] },
    { elementType: 'labels.text.fill',      stylers: [{ color: '#8a91a8' }] },
    { featureType: 'road', elementType: 'geometry',        stylers: [{ color: '#161b26' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f1117' }] },
    { featureType: 'water', elementType: 'geometry',       stylers: [{ color: '#0f1117' }] },
    { featureType: 'poi',   elementType: 'geometry',       stylers: [{ color: '#1e2535' }] }
  ];
}

function aplicarFiltro(tipo, chipEl) {
  filtroActivo = tipo;

  const chips = document.querySelectorAll('.filter-chip');
  for(let i=0; i<chips.length; i++){
    chips[i].classList.remove('active');
  }
  if(chipEl) chipEl.classList.add('active');

  clinicasFiltradas = [];
  for(let i=0; i<clinicas.length; i++){
    const c = clinicas[i];
    let mostrar = false;
    if(tipo==='todas') mostrar = true;
    if(tipo==='24h') mostrar = c.tiene_24h === 1 || c.tiene_24h === true;
    if(tipo==='urgencias') mostrar = c.tiene_urgencias === 1 || c.tiene_urgencias===true;
    if(mostrar) clinicasFiltradas.push(c);
  }
  renderListaClinicas();
  actualizarMarcadores();
}

function actualizarMarcadores() {
  if (!mapaInstance) return;
  
  mapaInstance.borrarPunts();
  
  for (let i = 0; i < clinicasFiltradas.length; i++) {
    const c = clinicasFiltradas[i];
    const popupContent = `
      <h3>${c.nombre}</h3>
      <p>${c.direccion}</p>
      <p>⭐ ${c.valoracion || 0}/5</p>
      ${c.tiene_24h ? '<p>🕐 24h</p>' : ''}
      ${c.tiene_urgencias ? '<p>🚨 Urgencias</p>' : ''}
    `;
    mapaInstance.pintarPunt(c.latitud, c.longitud, popupContent);
  }
}

function renderListaClinicas() {
  const lista = document.getElementById('clinicas-list');
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  if (clinicasFiltradas.length === 0) {
    lista.appendChild(crearEl('p', {
      textContent: 'No hay clinicas con este filtro',
      style: { textAlign: 'center', color: 'var(--text3)', padding: '24px', fontSize: '13px' }
    }));
    return;
  }

  for (let i = 0; i < clinicasFiltradas.length; i++) {
    lista.appendChild(crearCardClinica(clinicasFiltradas[i], i));
  }
}

function seleccionarClinica(idx) {
  const cards = document.querySelectorAll('.clinic-card');
  for (let i = 0; i < cards.length; i++) {
    cards[i].classList.toggle('active', parseInt(cards[i].dataset.idx) === idx);
  }
  if (cards[idx]) {
    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  if (mapaInstance && clinicasFiltradas[idx]) {
    mapaInstance.posicionarMapa(clinicasFiltradas[idx].latitud, clinicasFiltradas[idx].longitud);
  }
}

function crearCardClinica(c, idx) {
  const card = crearEl('div', { className: 'clinic-card' });
  card.dataset.idx = idx;

  const nombreEl = crearEl('div', { className: 'clinica-name', textContent: c.nombre });
  card.appendChild(nombreEl);

  const dirRow = crearEl('div', { className: 'clinica-addr' });
  const pinSpan = document.createElement('span');
  pinSpan.style.display = 'flex';
  pinSpan.style.width   = '13px';
  pinSpan.style.height  = '13px';
  ponerIcono(pinSpan, Icons.pin);
  dirRow.appendChild(pinSpan);
  dirRow.appendChild(document.createTextNode(' ' + c.direccion));
  card.appendChild(dirRow);

  const metaRow = crearEl('div', { className: 'clinica-meta' });
  const rating = c.valoracion || 0;
  let stars = '';
  for (let s = 1; s <= 5; s++) {
    stars += s <= Math.floor(rating) ? '★' : '☆';
  }
  const starsEl = crearEl('span', { textContent: stars, style: { color: '#ffa500', fontSize: '13px' } });
  const ratingEl = crearEl('span', { textContent: rating.toFixed(1), style: { fontSize: '12px', color: 'var(--text2)', marginLeft: '4px' } });
  metaRow.appendChild(starsEl);
  metaRow.appendChild(ratingEl);

  if (c.tiene_24h === 1 || c.tiene_24h === true) {
    metaRow.appendChild(crearEl('span', { className: 'badge badge-blue', textContent: '24h', style: { marginLeft: '6px' } }));
  }
  if (c.tiene_urgencias === 1 || c.tiene_urgencias === true) {
    metaRow.appendChild(crearEl('span', { className: 'badge badge-orange', textContent: 'Urgencias', style: { marginLeft: '4px' } }));
  }
  card.appendChild(metaRow);
  card.addEventListener('click', () => seleccionarClinica(idx));
  return card;
}

document.addEventListener('DOMContentLoaded', async function() {
  await cargarClinicas();
  iniciarMapa();

  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.removeAttribute('onclick');
    const tipo = chip.textContent.trim();
    let filtroTipo = 'todas';
    if (tipo === '24h') filtroTipo = '24h';
    if (tipo === 'Urgencias') filtroTipo = 'urgencias';
    if (tipo === 'Todas') filtroTipo = 'todas';
    chip.addEventListener('click', () => aplicarFiltro(filtroTipo, chip));
  });
});
