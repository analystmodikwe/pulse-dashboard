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