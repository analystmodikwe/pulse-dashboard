require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Client created for:', supabaseUrl);


// fetching earthquake data
async function fetchEarthquakes() {
  const response = await fetch(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
  );
  const data = await response.json();
  console.log("Number of earthquakes:", data.features.length);

  const rows = data.features.map((feature) => ({
    id: feature.id,
    place: feature.properties.place,
    magnitude: feature.properties.mag,
    event_time: new Date(feature.properties.time).toISOString(),
    longitude: feature.geometry.coordinates[0],
    latitude: feature.geometry.coordinates[1],
    depth_km: feature.geometry.coordinates[2],
    url: feature.properties.url,
  }));

  // Send the transformed rows to Supabase.
  // .upsert() means: insert each row, but if a row with the same
  // value in the "id" column already exists, update it instead
  // of creating a duplicate — this is the UPSERT behaviour from the brief.
  const { data: upsertedData, error } = await supabase
    // target table
    .from("earthquakes") 

    // the column Postgres checks for "already exists"
    .upsert(rows, {
      onConflict: "id", 
    });

  // Always check for errors explicitly — a failed upsert won't throw
  // on its own, it just returns an error object you have to look for.
  if (error) {
    console.error("Upsert failed:", error.message);
  } else {
    console.log("Upsert succeeded. Rows sent:", rows.length);
  }
}

fetchEarthquakes();


// fetching weather

// Fixed list of locations to fetch weather for.
// No "get weather everywhere" endpoint exists, so we pick specific
// places and call the API once per location.
const locations = [
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 }
];

async function fetchWeather() {
  // Collect the transformed row for each location here.
  const rows = [];

  // Loop over every location and fetch its current weather one at a time.
  for (const location of locations) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    // Build the synthetic primary key ourselves, since Open-Meteo
    // doesn't give us a natural unique id like USGS does.
    // Combining location name + the reading's own timestamp means
    // re-running the script within the same minute updates this
    // row instead of creating a duplicate.
    const id = `${location.name}_${data.current.time}`;

    rows.push({
      id: id,
      location_name: location.name,
      latitude: location.lat,
      longitude: location.lon,
      observed_at: new Date(data.current.time).toISOString(),
      temperature_c: data.current.temperature_2m,
      weather_code: data.current.weather_code,
      wind_speed_kmh: data.current.wind_speed_10m
    });
  }

  console.log('Transformed weather rows:', rows);

  // Same upsert pattern as earthquakes, just targeting the weather table.
  const { error } = await supabase
    .from('weather')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Weather upsert failed:', error.message);
  } else {
    console.log('Weather upsert succeeded. Rows sent:', rows.length);
  }
}
fetchWeather();