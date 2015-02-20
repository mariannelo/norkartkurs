var Norkart = {}; //definerer et "namespace" som vi kan holde oss innenfor

//JQuery-funksjon. Sørger for at koden 
//inne i funksjonen kjører først _etter_ at 
//alt er lastet inn i nettleseren.
$(document).ready(function() {
    console.log("ready!");

    //starter kartmotoren (Leaflet med Norkart sine tilpasninger) 
    //lagrer referanse til objektet i Norkart.map
    Norkart.map = new WebatlasMap('kart', {
        customer: "WA_studentkurs" //ved kommersiell bruk send epost til alexander.nossum@norkart.no
    });

    //endrer senterpunkt til koordinatene og setter zoomnivå til 5
    Norkart.map.setView(new L.LatLng(64.0, 11.0), 5);

    /*** Asynkron innlasting av en geojson-fil *
    $.getJSON('test.geojson', function(data) {
        //vi har fått data tilbake fra AJAX-requesten
        //oppretter et geojson-lag fra Leaflet som vi lagrer i namespacet vårt
        Norkart.geojsonLag = L.geoJson(data, {
            style: {
                weight: 2,
                opacity: 0.1,
                color: 'black',
                fillOpacity: 0.7
            }
        }).addTo(Norkart.map);

    });
    /**/


    /*** Asynkron innlasting av en ekstern geojson-fil med dynamiske farger og dynamisk popup*
    var url = 'https://gist.githubusercontent.com/alexanno/aa59a4ec377658c6eada/raw/ab6005fb6ca8104266f61b6a538c6bdeed5d36b2/map.geojson';
    $.getJSON(url, function(data) {
        //vi har fått data tilbake fra AJAX-requesten
        //oppretter et geojson-lag fra Leaflet som vi lagrer i namespacet vårt
        Norkart.geojsonLag = L.geoJson(data, {
            style: lagStyle,
            onEachFeature: hverFeature
        }).addTo(Norkart.map);

        function lagStyle(feature) {
            return {
                weight: 2,
                opacity: 0.1,
                color: 'black',
                fillOpacity: 0.7,
                fillColor: lagFyll(feature.properties.kategori)
            }
        }

        function lagFyll(kat) {
            if (kat === 1) {
                return '#FF0000';
            }

            if (kat === 3) {
                return '#00FF00';
            }

            return '#0000FF';

            // alternativ
            //return kat === 1 ? '#FF0000' :
            //    kat === 3 ? '#00FF00' :
            //    '#0000FF';
            
        }

        function hverFeature(feature, layer) {
            layer.on('click', function(e) {
                console.log("CLICK!");
                console.log(this);
                console.log(e);
            })
        }
    });
    /**/


    /*** Legge til markør  *
    //Lager en markør på et koordinatpar og legger til kartet. Dette kan "chaines" som er litt mer hendig
 	var minMarker = L.marker(new L.LatLng(65.0, 10.0));
    minMarker.addTo(Norkart.map);

    //chainet blir det:
    //L.marker(new L.LatLng(65.0, 10.0)).addTo(Norkart.map);
/**/


    /*** GeoLocation *
    //trigger HTML5 GeoLocation via Leaflet
    Norkart.map.locate({
        setView: false,
        maxZoom: 16
    });


    //definerer funksjon som skal kjøres ved event nedenfor
    function onLocationFound(e) {
        var radius = e.accuracy / 2;

        //Lager en ny markør med koordinater (latlng) som fått igjennom "locationfound"-eventet
        L.marker(e.latlng).addTo(Norkart.map)
            .bindPopup("Du er innenfor " + radius + " meter av dette punktet.").openPopup();

        //lager en sirkel med senter i koordinaten og radius = nøyaktighet/2
        L.circle(e.latlng, radius).addTo(Norkart.map);
    }
    //definerer funksjon som skal kjøres ved event nedenfor
    function onLocationError(e) {
        alert(e.message);
    }

    //setter opp "eventlisteners" 
    Norkart.map.on('locationfound', onLocationFound);
    Norkart.map.on('locationerror', onLocationError);

/**/

    /*** CartoDB *
    Norkart.map.on('click', function(e) {
        var latlng = e.latlng;

        //Asynkron request til CartoDB sitt SQL-api. Merk at tabellen er offentlig tilgjengelig
        var cartodb_endpoint = 'http://alexanno.cartodb.com/api/v2/sql?format=geojson&q=';
        var sql = 'SELECT * FROM seiltur';
        var sql = 'SELECT * FROM seiltur ORDER BY knots DESC LIMIT 20';

        //finne de 20 nærmeste punktene - uavhengig av avstanden (KNN = K-nearest-neighbor)
        //var pointSQL = 'ST_SetSRID(ST_MakePoint(' + latlng.lng + ',' + latlng.lat + '),4326)';
        //var pointSQL3857 = 'ST_Transform(ST_SetSRID(ST_MakePoint(' + latlng.lng + ',' + latlng.lat + '),4326),3857)';
        //var sql = 'SELECT ST_Distance('+pointSQL3857+',the_geom_webmercator) avstand, * FROM seiltur ORDER BY the_geom_webmercator <-> '+ pointSQL3857 +' LIMIT 20';

        var url = cartodb_endpoint + sql;

        $.getJSON(url, function(data) {
            //vi har fått data tilbake fra AJAX-requesten
            console.log(Norkart.geojsonlag);

            //fjerner det forrige geojsonlaget hvis det eksisterer
            if (typeof Norkart.geojsonLag === 'object') {
                Norkart.map.removeLayer(Norkart.geojsonLag);
            }


            //oppretter et geojson-lag fra Leaflet som vi lagrer i namespacet vårt
            Norkart.geojsonLag = L.geoJson(data, {
                style: {
                    weight: 2,
                    opacity: 0.1,
                    color: 'black',
                    fillOpacity: 0.7
                },
                onEachFeature: bindPopup
            }).addTo(Norkart.map);

            function bindPopup(f, layer) {
            	layer.on('click', function(e) {
            		console.log(this);
            	});
            }
        });
    });

    /**/


    /**/

});