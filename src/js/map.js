(function() {

    const lat = 13.7194162;
    const lng = -89.2199982;
    const map = L.map('map').setView([lat, lng ], 10);
    let marker;

    // Use Provider and Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Pin
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
    .addTo(map)

    // Get the info of the marker (lat and lng)
    marker.on('moveend', function(e){
        marker = e.target
        const position = marker.getLatLng()
        // Center based where the user left the pin
        map.panTo(new L.LatLng(position.lat, position.lng))

        // Name of street
        geocodeService.reverse().latlng(position, 13).run(function(error, result){
        marker.bindPopup(result.address.LongLabel)
        })

    })

    
})()