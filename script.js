'use strict';

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}

function showPosition(position) {
    let latlon = '34.052235,150.644';

    $.ajax({
      type:"GET",
      url:"https://app.ticketmaster.com/discovery/v2/events.json?apikey=fT2v2tMRkaeYkQ34MZQVJbSWIGaPCHQG&latlong="+latlon,
      async:true,
      dataType: "json",
      success: function(json) {
                  console.log(json);
               },
      error: function(xhr, status, err) {
                  console.log(err);
               }
    });
}

function showEvents(json) {
    if(json.page.totalElements == 0) throw $("#js-error").append("No results found, please try a different search.");
    for(let i=0; i<json._embedded.events.length; i++) {
      $("#events").append("<li><a href='" + json._embedded.events[i].url + "' target='_blank'>" + json._embedded.events[i].name+"</a></li>");
    }    
}
  
let main_map = "undefined";
let bounds = "undefined";

function initMap(position, json) {
  let mapDiv = document.getElementById('map');
    main_map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 34.052235, lng: -118.243683},
          zoom: 8
        });
    bounds = new google.maps.LatLngBounds();
}

function addMarker(map, event) {
    let marker = new google.maps.Marker({
        position: new google.maps.LatLng(event._embedded.venues[0].location.latitude, event._embedded.venues[0].location.longitude),
        map: map
        });
        
        let markersArray = [];
        markersArray.push(marker);
        google.maps.event.addListener(marker,"click",function(){});

        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
        console.log(marker);
    bounds.extend(marker.position);

    let contentString = '<div id="content">'+'<div id="siteNotice">'+'</div>'+
    '<h1 id="firstHeading" class="firstHeading">'+event._embedded.venues[0].name+'</h1>'+
    '<div id="bodyContent">'+
    '<p>'+event._embedded.venues[0].address.line1+'</p>'+
    '<p>Get Tickets Below!'+
    "<p><a href='" + event.url + "' target='_blank'>" + event.name+"</a></p>"+
    '<p>'+event.dates.start.localDate+'</p>'+
    '</p>'+
    '</div>'+
    '</div>';

    let infoWindow = new google.maps.InfoWindow({
        content: contentString
    });
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });    
}

function sendInfo(event) {
    $("#events").empty();
    $("#js-error").empty();
    $("#next-button-holder").empty();
    
    initMap();
   
    event.preventDefault();
    console.log('event sent info');
    let searchText = $('#js-event').val();
    let searchLocation = $('#js-location').val();
    console.log(searchText, searchLocation);

    let latlon = '-34.397,150.644';
    $.ajax({
      type:"GET",
      url:"https://app.ticketmaster.com/discovery/v2/events.json?apikey=fT2v2tMRkaeYkQ34MZQVJbSWIGaPCHQG&city="+searchLocation+"&keyword="+searchText+"&sort=date,asc",
      async:true,
      dataType: "json",
      success: function(json) {
                  console.log(json);
                  console.log("success");
        
                  showEvents(json);
                
                    for(let i=0; i<json._embedded.events.length; i++) {
                      addMarker(main_map, json._embedded.events[i]);
                    }
                    main_map.fitBounds(bounds);
               },
      error: function(xhr, status, err) {
                  console.log(err);
                  alert("An error has occurred.");
               }
    });
}

function initializeEvents() {
    $('.js-form').on('submit', sendInfo);
}

$(initializeEvents);
