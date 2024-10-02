(function() {
    const lat = document.querySelector('#lat').value || -1.3277959;
    const lng = document.querySelector('#lng').value || -78.5413384;
    const mapa = L.map('mapa').setView([lat, lng ], 16);
    let marker;

    // Utilizar Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Establecer el Pin
    marker = new L.marker(([lat, lng]),  {
        draggable: true,
        autoPan: true
    })
    .addTo(mapa)

    // Detectar las coordenadas mediante eventos

    marker.on('moveend', function(event){
        marker = event.target
        const posicion = marker.getLatLng();

        // Centrar le mapa en las coordenadas
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng ))

        // Obtener información de las calles al soltar el pin

        geocodeService.reverse().latlng(posicion, 13).run(function(error, resultado){
            
            // console.log(resultado)
            marker.bindPopup(resultado.address.LongLabel);

            // Llenar los campos
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })


    })



})()