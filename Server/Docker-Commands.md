<p>
<b> Docker + Postgres Quick Reference (Dev Workflow)</b><br><br>

<b>Start containers (when starting work)</b><br>
<code>docker compose up -d</code><br>
Starts in background, keeps data.<br><br>

<b>Stop containers (when done)</b><br>
<code>docker compose down</code><br>
Stops & removes containers, keeps data volumes.<br><br>

<b>Check running containers</b><br>
<code>docker ps</code><br><br>

<b>View logs</b><br>
<code>docker compose logs -f db</code><br>
Follow Postgres logs. Replace <code>db</code> with service name as needed.<br><br>

<b>Data Persistence</b><br>
Data is stored in named volumes (e.g., <code>pg_data</code>).<br>
Stops & removes containers → data remains.<br>
Only <code>docker compose down -v</code> wipes data.<br><br>

<b>Reset/Wipe DB</b><br>
<code>docker compose down -v</code><br>
<code>docker compose up -d</code><br>
Deletes volumes, re-runs init scripts.<br><br>

<b>Useful Commands</b><br>
Connect to Postgres CLI:<br>
<code>docker exec -it pg-local psql -U dev -d appdb</code><br><br>
Backup DB:<br>
<code>docker exec -t pg-local pg_dump -U dev -d appdb > backup.sql</code><br><br>
Restore DB:<br>
<code>cat backup.sql | docker exec -i pg-local psql -U dev -d appdb</code><br><br>

<b>Tips</b><br>

No rebuild needed unless Dockerfile or compose changes.<br>

Start Docker Desktop before <code>docker compose up</code>.<br>

pgAdmin can run or be stopped separately.<br>

</p>