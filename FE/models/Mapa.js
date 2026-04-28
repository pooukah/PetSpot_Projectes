export class Mapa {
  #map;
  #latInit;
  #longInit;

  constructor(latInit, longInit) {
    this.#latInit = latInit;
    this.#longInit = longInit;

    this.#map = L.map('map').setView([latInit, longInit], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
  }

  // Obtener la ubicación del usuario (sin popup automático)
  obtenirPosicio() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        // Solo centra el mapa, no añade marcador
        this.#map.setView([latitude, longitude], 13);
      },
      (error) => {
        console.log("No se pudo obtener la ubicación:", error);
        this.#map.setView([this.#latInit, this.#longInit], 13);
      }
    );
  }

  // Pintar un marcador con popup
  pintarPunt(lat, long, desc) {
    L.marker([lat, long]).addTo(this.#map).bindPopup(desc).openPopup();
  }

  // Centrar el mapa en una posición
  posicionarMapa(lat, long) {
    this.#map.setView([lat, long], 16);
  }

  // Borrar todos los marcadores
  borrarPunts() {
    this.#map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.#map.removeLayer(layer);
      }
    });
  }
}