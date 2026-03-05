mapboxgl.accessToken = "pk.eyJ1IjoiZHVuY2FuLXdhbjA0IiwiYSI6ImNta2U4Y3c1MTA0ZjczZW9mMXpqc2VidmoifQ.RxHABogPiEWD0gDBm5pA8w";

const map = new mapboxgl.Map({
    container: "my-map",
    style: "mapbox://styles/duncan-wan04/cmlgpvpnz000t01s32ah007xw",
    center: [-118, 41.5],
    zoom: 4.8,
});

/*--------------------------------------------------------------------
LOADING BASE DATA AND COLOR CODING
--------------------------------------------------------------------*/

map.on('load', () => {

    map.addSource('earthquakes', {
        type: 'geojson',
        data: "https://raw.githubusercontent.com/duncanwan04/ggr472-lab3/refs/heads/main/lab3_data/earthquakes_week.geojson"
    });

    // Visualize data layer on map
    map.addLayer({
        'id': 'earthquakes-layer',
        'type': 'circle',
        'source': 'earthquakes',
        'paint': {
            'circle-radius': ['*', 5, ['get', 'mag']],
            /// simple scaling of point size based on magnitude
            'circle-color': [
                "step",
                ['get', 'mag'],
                '#fee5d9', /// default color if mag < 0.5
                0.5, '#FFC2C2', /// between 0.5-1.0
                1.0, '#FFA6A6',
                1.5, '#FF8A8A',
                2.0, '#FC6060',
                2.5, '#FA3434',
                3.0, '#FC0808'
                /// anything bigger than 2.5
                ]
            }
    });

    map.setFilter('earthquakes-layer', [
    'within',
        {
        type: 'Polygon',
        coordinates: [[
            [-127.4, 31.8],
            [-106.2, 31.8],
            [-106.2, 49.1],
            [-127.4, 49.1],
            [-127.4, 31.8]
        ]]
        }
    ]);
    /// filters for just the Western part of the US, and some points in bordering 
    /// towns in Mexico
})

/*--------------------------------------------------------------------
SETTING UP SLIDER
--------------------------------------------------------------------*/
const slider = document.getElementById("slider");
const slider_input = document.getElementById("slider_input");

/// event listener, every time the input changes, this thing runs
slider_input.addEventListener('input', () =>{
    slider.value = slider_input.value
})

slider.addEventListener('input', () =>{
    slider_input.value = slider.value
})

function data_filter(){
    map.setFilter('earthquakes-layer', 
        ["all",
            ['>=', ['get', 'mag'], parseFloat(slider.value)],
            ['within',
                {
                type: 'Polygon',
                coordinates: [[
                    [-127.4, 31.8],
                    [-106.2, 31.8],
                    [-106.2, 49.1],
                    [-127.4, 49.1],
                    [-127.4, 31.8]
                ]]
                }]
        ]
    );
    /// because the slider.value returns a string, it won't compare or 
    /// work well with the inequality signs. parseFloat turns string to number

    /// had to include the filtering of coordinates again because it runs the
    /// latest filter 
}

slider.addEventListener('input', () => {
    data_filter();
});
/// updates the slider to match input value, and the same the other way


/*--------------------------------------------------------------------
ADD POP-UP
--------------------------------------------------------------------*/

map.on('click', 'earthquakes-layer', (e) => {
    const f = e.features[0].properties; /// to simplify code below

    new mapboxgl.Popup() // Declare new popup object on each click
        .setLngLat(e.lngLat) // Use method to set coordinates of popup based on mouse click location
        .setHTML(
            "<h1>Earthquake</h1>" +
            "Magnitude: " + f.mag.toFixed(2) + "<br>" + "<br>" +
            /// toFixed restricts the float to 2 dp
            "Location: " + f.place + "<br>" + "<br>" +
            "Significance of Earthquake: " + f.sig)
        .addTo(map); // Show popup on map
});

/*--------------------------------------------------------------------
MOUSE MOVE EVENT
--------------------------------------------------------------------*/

map.on('mousemove', 'earthquakes-layer', (e) => {
    const mag = e.features[0].properties.mag;
    document.getElementById("magnitude_update").innerHTML =
        "<h2>Magnitude (hover): </h2>" + mag.toFixed(2);
    /// innerHTML replaces the content of the div i specified with the ID
});

map.on('mouseleave', "earthquakes-layer", () => {
    document.getElementById("magnitude_update").innerHTML =
        "<h2>Magnitude (hover): </h2>";
});


/*--------------------------------------------------------------------
ADDING GEOCODER
--------------------------------------------------------------------*/
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        useBrowserFocus: true,
        mapboxgl: mapboxgl
    })
);

map.addControl(new mapboxgl.NavigationControl());

/* Return button */

document.getElementById('return_button').addEventListener('click', () => {
        // Fly to a random location
        map.flyTo({
            center: [-118, 41.5],
            zoom: 4.8,
        });
    });

