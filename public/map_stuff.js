"use strict";
let map;
let marker;
let mapOptions;
let mapCanvas;
let mapBig;

google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
    mapCanvas = document.getElementById('mapModal');
    mapOptions = {
        center: new google.maps.LatLng(44.5403, -78.5463),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    map = new google.maps.Map(mapCanvas, mapOptions)
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(44.5403, -78.5463),
        map: map,
    });

    const mapCanvasBig = document.getElementById('map');
    const mapOptionsBig = {
        center: new google.maps.LatLng(44.5403, -78.5463),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    mapBig = new google.maps.Map(mapCanvasBig, mapOptionsBig);

    google.maps.event.addListener(mapBig, 'click', function(event) {
        const markerBig = new google.maps.Marker({
            position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
            map: mapBig
        });
        document.getElementById("inputLocationX").value = event.latLng.lat();
        document.getElementById("inputLocationY").value = event.latLng.lng();
    });
}

function openModalWindow(element) {
    console.log(element);
    const image = document.getElementById("modalImage");
    image.src = $(element).data('image');


    const x = $(element).data('coordinates-x');
    const y = $(element).data('coordinates-y');

    marker.setMap(null);
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(x, y),
        map: map
    });
    google.maps.event.trigger(map, "resize");
    map.setCenter(new google.maps.LatLng(x, y));

    $('#contact').on('shown.bs.modal', function() {
        google.maps.event.trigger(map, "resize");
        map.setCenter(new google.maps.LatLng(x, y));
    });
}

$('#mapModal').hover((event) => {
    $(event.currentTarget).animate({
        width: 300,
        height: 300,
    }, 200, () => {
        let currCenter = map.getCenter();
        google.maps.event.trigger(map, 'resize');
        map.setCenter(currCenter);
    });
}, (event) => {
    $(event.currentTarget).animate({
        width: '150px',
        height: '150px',
    }, 200, () => {
        let currCenter = map.getCenter();
        google.maps.event.trigger(map, 'resize');
        map.setCenter(currCenter);
    });
});

$('#createUpdateLink').click((event) => {
    setTimeout(() => {
        let currCenter = mapBig.getCenter();
        google.maps.event.trigger(mapBig, 'resize');
        mapBig.setCenter(currCenter);
    }, 100);
});