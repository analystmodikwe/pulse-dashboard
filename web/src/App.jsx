import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  // Holds the earthquake rows once fetched from Supabase.
  const [earthquakes, setEarthquakes] = useState([]);

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

    loadEarthquakes();
  }, []);

  return (
    <div>
      <h1>Pulse — Live World Snapshot</h1>
      {earthquakes.map((quake) => (
        <div key={quake.id}>
          <strong>{quake.place}</strong> — M{quake.magnitude}
          <br />
          {new Date(quake.event_time).toLocaleString()}
        </div>
      ))}
    </div>
  );
}

export default App;