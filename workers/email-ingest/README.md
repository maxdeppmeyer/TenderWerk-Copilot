# Cloudflare Email Worker – TenderWerk Copilot

Dieser optionale Worker verarbeitet eingehende E-Mails an eine tokenisierte Adresse im Muster `eingang+<TOKEN>@deine-domain.de`. Er übermittelt zulässige Anhänge an die geschützte Supabase Edge Function `email-ingest`.

## Sicherheitsregeln

- `EMAIL_INGEST_SECRET` nur als Cloudflare Worker Secret setzen.
- Dasselbe Secret nur serverseitig in Supabase als Function Secret setzen.
- `SUPABASE_INGEST_ENDPOINT` verweist auf die deployte Function-URL.
- Anhänge über 25 MB oder nicht erlaubte Typen werden nicht übertragen.
- Ein unbekanntes Organisationstoken führt zur Quarantäne, nicht zur Zuordnung zu einem Mandanten.
- Der Worker startet keine KI-Analyse automatisch.

Die vollständige Einrichtung steht in `docs/SETUP_SCHRITT_FUER_SCHRITT.md`.
