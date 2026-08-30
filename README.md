# Pulse — Live World Snapshot Board

## Design Rationale

This project stores two independent, live datasets: earthquakes from the USGS
GeoJSON feed and current weather readings from Open-Meteo, both pulled into
Supabase by a fetch script and displayed on a single dashboard page. The
earthquakes table uses a plain `text` primary key (`id`) taken directly from
USGS's own stable event identifier, which is what makes UPSERT possible, the
fetch script can run repeatedly and Postgres will recognize an earthquake it
has already seen and update that row instead of inserting a duplicate. The
weather table needed a different approach, since Open-Meteo returns no
natural unique identifier at all: instead, the fetch script builds a
synthetic key itself by combining the location name with the reading's own
observed timestamp, which keeps a time-series of readings per location while
still preventing duplicate rows if the script runs twice within the same
minute. The two tables are kept fully decoupled, with no foreign key between
them, because an earthquake and a weather reading are independent facts about
the world rather than a fixed one-to-one relationship combining them (as in
the stretch goal) happens at query time by proximity, not through a permanent
schema-level link. Finally, both tables have Row Level Security enabled with
a single public `SELECT` policy, so the frontend (using Supabase's
publishable/anon key) can only ever read data; all writes happen exclusively
through the fetch script, which uses the secret/service-role key that
bypasses RLS, keeping the write path and the public-facing key strictly
separated.