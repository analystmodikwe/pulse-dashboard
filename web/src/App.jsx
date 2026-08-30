import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function magnitudeTier(mag) {
  if (mag >= 5) return { label: 'STRONG', color: '#C6572A' };
  if (mag >= 3.5) return { label: 'LIGHT', color: '#E2793D' };
  return { label: 'MINOR', color: '#8B96AC' };
}

function weatherLabel(code) {
  const map = {
    0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
    61: 'Rain', 63: 'Rain', 65: 'Rain', 71: 'Snow', 73: 'Snow', 75: 'Snow',
    80: 'Showers', 81: 'Showers', 82: 'Showers', 95: 'Storm',
  };
  return map[code] ?? '-';
}

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [weather, setWeather] = useState([]);
  const [minMagnitude, setMinMagnitude] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function loadEarthquakes() {
      const { data, error } = await supabase
        .from('earthquakes')
        .select('*')
        .order('event_time', { ascending: false });
      if (error) console.error('Failed to load earthquakes:', error.message);
      else setEarthquakes(data);
    }

    async function loadWeather() {
      const { data, error } = await supabase
        .from('weather')
        .select('*')
        .order('observed_at', { ascending: false });
      if (error) console.error('Failed to load weather:', error.message);
      else setWeather(data);
    }

    Promise.all([loadEarthquakes(), loadWeather()]).then(() => {
      setLastUpdated(new Date());
    });
  }, []);

  const filteredEarthquakes = earthquakes.filter((quake) => quake.magnitude >= minMagnitude);

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#E8ECF5]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4FA9C6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4FA9C6]"></span>
            </span>
            <span className="text-xs tracking-widest uppercase text-[#8B96AC]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {lastUpdated ? `Live - Updated ${lastUpdated.toLocaleTimeString()}` : 'Live'}
            </span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Pulse</h1>
          <p className="text-[#8B96AC] mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>what's happening on Earth right now</p>

          <div className="mt-6 h-10 overflow-hidden rounded border border-[#23314A] bg-[#121B2E]">
            <svg className="waveform-track h-full" width="200%" viewBox="0 0 800 40" preserveAspectRatio="none">
              <polyline fill="none" stroke="#4FA9C6" strokeWidth="1.5" points="0,20 20,20 30,8 40,32 50,20 90,20 100,14 110,26 120,20 180,20 190,4 200,36 210,20 260,20 270,16 280,24 290,20 340,20 350,10 360,30 370,20 400,20 420,20 430,8 440,32 450,20 490,20 500,14 510,26 520,20 580,20 590,4 600,36 610,20 660,20 670,16 680,24 690,20 740,20 750,10 760,30 770,20 800,20" />
            </svg>
          </div>
        </header>

        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#23314A]">
            <h2 className="text-xs tracking-widest uppercase text-[#8B96AC]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Seismic Activity</h2>
            <span className="text-xs text-[#8B96AC]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{filteredEarthquakes.length} / {earthquakes.length}</span>
          </div>

          <div className="flex items-center gap-4 mb-6 px-3 py-2 rounded border border-[#23314A] bg-[#121B2E]">
            <label className="text-xs text-[#8B96AC] shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>MIN MAGNITUDE</label>
            <input type="range" min="0" max="8" step="0.5" value={minMagnitude} onChange={(e) => setMinMagnitude(Number(e.target.value))} className="flex-1 accent-[#C6572A]" />
            <span className="text-sm w-10 text-right shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{minMagnitude.toFixed(1)}</span>
          </div>

          <div>
            {filteredEarthquakes.map((quake) => {
              const tier = magnitudeTier(quake.magnitude);
              return (
                <div key={quake.id} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 py-3 border-b border-[#23314A] first:border-t">
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', color: tier.color }} className="text-xl font-semibold">{quake.magnitude}</div>
                  <div>
                    <div className="text-sm">{quake.place}</div>
                    <div className="text-xs text-[#8B96AC]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{new Date(quake.event_time).toLocaleString()} - {tier.label}</div>
                  </div>
                  <a href={quake.url} target="_blank" rel="noreferrer" className="text-xs text-[#4FA9C6] hover:underline shrink-0">Details</a>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#23314A]">
            <h2 className="text-xs tracking-widest uppercase text-[#8B96AC]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Atmospheric</h2>
            <span className="text-xs text-[#8B96AC]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{weather.length} stations</span>
          </div>

          <div>
            {weather.map((reading) => (
              <div key={reading.id} className="grid grid-cols-[1fr_auto] items-center gap-4 py-3 border-b border-[#23314A] first:border-t">
                <div>
                  <div className="text-sm">{reading.location_name}</div>
                  <div className="text-xs text-[#8B96AC]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{weatherLabel(reading.weather_code)} - wind {reading.wind_speed_kmh} km/h</div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-xl font-semibold text-[#4FA9C6]">{reading.temperature_c} deg C</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;