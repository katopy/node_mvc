(function() {

    const lat = 13.7194162;
    const lng = -89.2199982;
    const map = L.map('map').setView([lat, lng ], 12);
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


})()