-- EARTHQUAKE TABLE

CREATE TABLE earthquakes (
  id         text primary key,   
  place       text        ,
  magnitude   numeric     ,
  event_time  timestamptz ,
  longitude   numeric     ,
  latitude    numeric     ,
  depth_km    numeric     ,
  url         text        ,
  fetched_at  timestamptz default now()    
);

-- policy for earthquake
ALTER TABLE earthquakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON earthquakes
FOR SELECT
USING (true);

-- //////////////////////////////////////////////////////////////////////////////////////////////////


-- weather table

CREATE TABLE weather (
  id             text primary key, 
  location_name  text        ,
  longitude      numeric     ,
  latitude       numeric     ,
  observed_at    timestamptz default now(),
  temperature_c  numeric     ,
  weather_code   numeric     ,
  wind_speed_kmh numeric     ,
  fetched_at     timestamptz default now()    
);

-- policy for weather
ALTER TABLE weather ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON weather
FOR SELECT
USING (true);