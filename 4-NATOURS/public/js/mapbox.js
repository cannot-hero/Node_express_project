/* eslint-disable */
// js run in client side

// console.log(locations)

export const displayMap = locations => {
    mapboxgl.accessToken =
        'pk.eyJ1Ijoic2h1c2h1YmlvIiwiYSI6ImNsN2QxZGdxdjE2aWYzd21pazFteGY3OGMifQ.fb3z0dSPrKhHjKu50zO-sg'
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/shushubio/cl7d1k2js003v14rpw4xxgiej',
        scrollZoom: false
        // center: [-118.113, 34.111],
        // zoom: 10
    })

    const bounds = new mapboxgl.LngLatBounds()

    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div')
        el.className = 'marker'
        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map)
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}}</p>`)
            .addTo(map)
        // extend map bounds to include the current location
        bounds.extend(loc.coordinates)
    })

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    })
}
