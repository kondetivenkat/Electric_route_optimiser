document.getElementById('routeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const battery = document.getElementById('battery').value;
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const range = document.getElementById('range').value;
    const capacity = document.getElementById('capacity').value;

    console.log('Form Data:', { battery, start, end, range, capacity });

    const data = {
        battery: battery,
        start: start,
        end: end,
        range: range,
        capacity: capacity
    };

    planRoute(data);
});

function planRoute(data) {
    const apiKey = '5b3ce3597851110001cf6248c3b2c4e402f0401084838b8c39436d3a'; // Replace with your ORS API key
    const startLocation = data.start;
    const endLocation = data.end;

    // Log the start and end locations
    console.log('Start Location:', startLocation);
    console.log('End Location:', endLocation);

    // Geocode the start and end locations
    Promise.all([
        geocodeLocation(startLocation, apiKey),
        geocodeLocation(endLocation, apiKey)
    ])
    .then(locations => {
        const startCoords = locations[0];
        const endCoords = locations[1];

        // Log the coordinates
        console.log('Start Coordinates:', startCoords);
        console.log('End Coordinates:', endCoords);

        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords}&end=${endCoords}`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(result => {
                console.log('Route Result:', result);
                displayOutput(result);
            })
            .catch(error => {
                console.error('Fetch error:', error);
                displayError(`Failed to fetch data: ${error.message}`);
            });
    })
    .catch(error => {
        console.error('Geocoding error:', error);
        displayError(`Failed to geocode locations: ${error.message}`);
    });
}

function geocodeLocation(location, apiKey) {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(location)}`;
    console.log('Geocode URL:', url);

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Geocode response:', data); // Log the response
            if (data && data.features && data.features.length > 0) {
                const coords = data.features[0].geometry.coordinates;
                return `${coords[0]},${coords[1]}`;
            } else {
                throw new Error('No geocoding results found');
            }
        })
        .catch(error => {
            console.error('Geocode fetch error:', error);
            throw new Error('Failed to fetch geocoding data');
        });
}

function displayOutput(result) {
    const outputDiv = document.getElementById('output');
    const route = result.features[0];

    // Check if the route and its segments exist
    if (route && route.properties && route.properties.segments && route.properties.segments.length > 0) {
        const segments = route.properties.segments[0];
        
        outputDiv.innerHTML = `
            <h2>Optimal Route</h2>
            <p>Distance: ${(segments.distance / 1000).toFixed(2)} km</p>
            <p>Duration: ${(segments.duration / 3600).toFixed(2)} hours</p>
            <h3>Steps</h3>
            <ul>
                ${segments.steps.map(step => `
                    <li>
                        ${step.instruction}
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        outputDiv.innerHTML = '<p class="error">No route details available.</p>';
    }
}

function displayError(error) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = `<p class="error">${error}</p>`;
}
