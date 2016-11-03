var map;
var markers = [];
var places = [];
var completes = [];
var allInputs = $('input');


//Function for button to close popup
function closePopup() {
    var btn = $('button');
    var popupWindow = $('div.popupWindow');
    btn.one('click', function() {
        btn.parent().prev().hide();
        btn.parent().hide();
        btn.hide();
    });
}
closePopup();

//Adds new field to add new place
function addOrDeleteInput() {
    var form = $('form');
    var i = $('form div.inputField').size() + 1;
    $('form').on('click', '.plus', function() {

        var newInput = $('<div class="inputField"><div class="icon minus"><i class="icon fa fa-minus-circle" aria-hidden="true"></i></div><input type="text" name="place' + i + '"" id="place' + i + '" placeholder="Następne miejsce" required/><div class="icon plus"><i class="icon fa fa-plus-circle" aria-hidden="true"></i></div></div>');


        form.children('.inputField').last().after(newInput);
        i++;

        newInput.find('input').one('click', callback);

        return false;
    });

    $('form').on('click', '.minus', function() {
        if (i > 3) {
            $(this).parents('.inputField').remove();
            i--;
        }
        return false;
    });
};
addOrDeleteInput();


//Initialize google maps on page
function initMap() {
    setStartMap();
    google.maps.event.addDomListener(window, 'load', startAutocomplete);
    var btn = $('div.buttonCalculateRoute');
    btn.on('click', function() {
        drawRoute(map);
    });
}

//Setting map on page. Start position and zoom
function setStartMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: 8
    });
}

function callback() {
    var input = this;
    console.log(this);
    var autocomplete = new google.maps.places.Autocomplete(input);
    completes.push(autocomplete);

    console.log('działa');
    var infowindow = new google.maps.InfoWindow();

    // Event for changing places
    autocomplete.addListener('place_changed', function() {
        setMapOnAll(map);
        markers = [];
        places = [];
        for (var i = 0; i < completes.length; i++) {
            var place = completes[i].getPlace();

            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            places.push(place.geometry.location);

            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }

            var marker = new google.maps.Marker({
                map: map,
                anchorPoint: new google.maps.Point(0, -29)
            });
            marker.setVisible(false);
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    // (place.address_components[1] && place.address_components[2].short_name || ''),
                    // (place.address_components[2] && place.address_components[2].short_name || '') // You can uncomment if you want more values
                ].join(' ');
            }

            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
            infowindow.open(map, marker);

            markers.push(marker);

        }
    });
}

//Autocomplete function
function startAutocomplete() {
    allInputs.one('click', callback);
}

// Set the map on all markers in the array.
function setMapOnAll() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

//This function iniciate route drawing. If you want to use put in your function with var map.
function drawRoute(map) {
    console.log('drawRoute działa');
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);

    calculateAndDisplayRoute(directionsService, directionsDisplay);

}

// It calculate and display route.
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    setMapOnAll(map);
    var waypts = [];
    var inputArray = document.querySelectorAll('input');
    for (var i = 1; i < inputArray.length; i++) {
        if (inputArray[i].value != '') {
            waypts.push({
                location: inputArray[i].value,
                stopover: true
            });
        }
    }

    directionsService.route({
        origin: document.querySelector('#place1').value,
        destination: document.querySelector('#place1').value,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
            var route = response.routes[0];
            var summaryPanel = document.querySelector('.route');
            var distanceDiv = document.querySelector('div.distance');
            var timeDiv = document.querySelector('div.time');
            var totalDistance = 0;
            var totalDuration = 0;
            summaryPanel.innerHTML = '';
            summaryPanel.innerHTML += '<ul>';
            distanceDiv.innerHTML = '';
            timeDiv.innerHTML = '';
            // For each route, display summary information.
            for (var i = 0; i < route.legs.length; i++) {
                summaryPanel.innerHTML += '<li>';
                summaryPanel.innerHTML += route.legs[i].start_address + ' do ';
                summaryPanel.innerHTML += route.legs[i].end_address + ' ';
                summaryPanel.innerHTML += route.legs[i].distance.text + '</li>';
                totalDistance += route.legs[i].distance.value;
                totalDuration += route.legs[i].duration.value;
            }
            distanceDiv.innerHTML += Math.round(totalDistance / 1000) + ' KM';
            displayDuration(totalDuration, timeDiv);
            summaryPanel.innerHTML += '</ul>';

        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}


function displayDuration(totalDuration, timeDiv) {
    var hours = Math.floor(totalDuration / 3600);
    var minutes = Math.floor((totalDuration - 3600 * hours) / 60);
    timeDiv.innerHTML += hours + " H " + minutes + "MIN";
};
