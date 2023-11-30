del ".\sqlite\dm_minimal_data_existing.sqlite"

sqlite3.exe .\sqlite\dm_minimal_data_existing.sqlite ".read ./sql/ai_scan_settings.sql"
sqlite3.exe .\sqlite\dm_minimal_data_existing.sqlite ".read ./sql/ai_scan_beosztas_form.sql"

exit