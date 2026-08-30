import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  // Holds the earthquake rows once fetched from Supabase.
  const [earthquakes, setEarthquakes] = useState([]);

  // Tracks the minimum magnitude the user wants to see.
  // Starts at 0 so nothing is filtered out initially.
  const [minMagnitude, setMinMagnitude] = useState(0);

  // Holds the weather rows once fetched from Supabase.
  const [weather, setWeather] = useState([]);

  // useEffect with an empty dependency array runs once,
  // right after the component first renders — the standard
  // pattern for "fetch data when the page loads."
  useEffect(() => {
    async function loadEarthquakes() {
      const { data, error } = await supabase
        .from('earthquakes')
        .select('*')
        .order('event_time', { ascending: false }); // newest first

      if (error) {
        console.error('Failed to load earthquakes:', error.message);
      } else {
        setEarthquakes(data);
      }
    }

    async function loadWeather() {
      const { data, error } = await supabase
        .from('weather')
        .select('*')
        .order('observed_at', { ascending: false }); // newest first

      if (error) {
        console.error('Failed to load weather:', error.message);
      } else {
        setWeather(data);
      }
    }

    loadEarthquakes();
    loadWeather();
  }, []);

  // Derive the filtered list on every render, rather than storing
  // it as its own state — this way it always stays in sync with
  // both the full earthquake list and the current filter value.
  const filteredEarthquakes = earthquakes.filter(
    (quake) => quake.magnitude >= minMagnitude
  );

  return (
    <div>
      <h1>Pulse — Live World Snapshot</h1>

      <h2>Earthquakes</h2>

      <div>
        <label>
          Minimum magnitude: {minMagnitude}
          <br />
          <input
            type="range"
            min="0"
            max="8"
            step="0.5"
            value={minMagnitude}
            onChange={(e) => setMinMagnitude(Number(e.target.value))}
          />
        </label>
      </div>

      <p>
        Showing {filteredEarthquakes.length} of {earthquakes.length} earthquakes
      </p>

      {filteredEarthquakes.map((quake) => (
        <div key={quake.id}>
          <strong>{quake.place}</strong> — M{quake.magnitude}
          <br />
          {new Date(quake.event_time).toLocaleString()}
        </div>
      ))}

      <h2>Weather</h2>

      {weather.map((reading) => (
        <div key={reading.id}>
          <strong>{reading.location_name}</strong> — {reading.temperature_c}°C
          <br />
          Wind: {reading.wind_speed_kmh} km/h
          <br />
          {new Date(reading.observed_at).toLocaleString()}
        </div>
      ))}
    </div>
  );
}

export default App;