# CLAUDE.md

Kontext für Claude-Code-Sitzungen in diesem Repo. Bei Projektstand-Fragen
zusätzlich `hofladen-schutz/PROJEKT-STAND.md` lesen.

## Was das ist

Multi-Kampagnen-Website unter **jonasstreule.ch** (Inhaber: Jonas Streule).
Erste Kampagne: **Betriebsschutzgesetz (BSchG)** – eine kantonale Volksinitiative
St. Gallen für ein einfaches, kostenloses Recht auf Videoüberwachung für Hofläden,
Gewerbe und schützenswerte Kulturstätten. Producer-Credit: EDV.sg (Jonas' IT-Firma).

Grundprinzip bei Inhalten: **nur echte Daten, nichts erfinden** – besonders keine
erfundenen Zitate/Positionen realer Politiker. Offene/ausstehende Dinge ehrlich
als solche kennzeichnen.

## Struktur

```
index.html                 Hub-Startseite (listet Kampagnen)
hofladen-schutz/index.html Kampagnenseite (CSS+JS inline, mobile-first, ~1600 Z.)
datenschutz.html           gemeinsame Datenschutzerklärung
shared/*.json              geteilte Daten: 120 Kantonsräte SG, PLZ→Wahlkreis
favicon.png, og-image.png  Hub-Assets (Kampagne hat eigene in hofladen-schutz/)
api/                       Backend: Node + TypeScript + Express + Postgres
  src/main.ts              App, Campaign-Allowlist, Rate-Limit, trust proxy
  src/routes/campaign.ts   alle Endpunkte unter /api/:campaign/...
  src/listmonk.ts          Newsletter-Weiterleitung an Listmonk
  src/validate.ts          Eingabe-Validierung
  migrations/*.sql         werden beim Start automatisch ausgeführt (db.ts)
```

Frontend ist je eine in sich geschlossene HTML-Datei (CSS + JS inline). Beim
Bearbeiten den vorhandenen Stil/Idiom beibehalten. JS-Syntax nach Edits prüfen:
`node -e "new Function(require('fs').readFileSync('hofladen-schutz/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1])"`

## API

- Multi-Tenant über Pfad: `/api/:campaign/...`. Erlaubte Slugs per **Allowlist**
  (`CAMPAIGNS`-Env, Default `hofladen-schutz`) – unbekannte → 404.
- Endpunkte: POST petition, spende, contact, vip, finder-lead, article-feedback,
  newsletter; GET petition, spende, vip; GET /api/health.
- Newsletter schreibt in Postgres **und** reicht an Listmonk weiter (Double-Opt-in,
  Fehler nicht fatal).
- Rate-Limit 30/15min pro IP (läuft hinter Caddy, daher `trust proxy: 1`).
- `cd api && npx tsc --noEmit` muss vor jedem Commit sauber durchlaufen.

## Deploy

Push auf `main` → GitHub Actions (`.github/workflows/deploy.yml`) → SSH auf den
Server → `git pull` + `docker compose -f docker-compose.prod.yml up -d --build`.
Das Skript hat `set -e` (Fehler sind laut). **Nur committen/pushen, wenn der
Nutzer es will.** Nach dem Push den Action-Lauf abwarten und live verifizieren.

## Server (Hetzner)

- Zugang: `ssh -i ~/.ssh/hetzner root@204.168.255.134` (Helsinki, hostname
  `ubuntu-4gb-hel1-1`). Key liegt nur auf Jonas' Mac.
- Repo auf dem Server: `/srv/jonasstreule/repo`. Secrets serverseitig in
  `/srv/jonasstreule/repo/api/.env` (nicht in git).
- Reverse Proxy: Caddy, modular via `import /srv/*/caddy.conf`, automatisches HTTPS.
- Container: `api-app-1` + `api-postgres-1` (DB `jonasstreule_api`, User `jonasapi`,
  **nicht** nach außen exponiert). Newsletter: **Listmonk** unter
  `liste.jonasstreule.ch` (eigener Container + Postgres), Versand über Migadu-SMTP
  (`rundbrief@jonasstreule.ch`). Auf dem Server laufen noch weitere, fremde Projekte
  (immerdra, viehschau, parresia, edv, jonas-site) – **nicht anfassen**.
- DB-Zugriff: `docker exec api-postgres-1 psql -U jonasapi -d jonasstreule_api`.
- Beim Testen gegen die Live-DB einen Marker (z.B. `ZZTEST`) nutzen und Testdaten
  danach wieder löschen.

## Offene Punkte (Stand Juni 2026)

1. Staatsrechtliche Prüfung des Gesetzestexts vor der Unterschriftensammlung.
2. Offizieller Unterschriftenbogen kommt erst, wenn der Text final/amtlich ist
   (Online-Unterstützungsbekundung läuft schon).

Gesetzes-PDF (`hofladen-schutz/Betriebsschutzgesetz_BSchG.pdf`) ist als
**Entwurfsfassung** online (Rückmelde-Hinweis auf E-Mail/Handy). Bei Textänderungen
neu rendern: Quelle ist das JS-Array `gesetzArtikel` in `hofladen-schutz/index.html`,
per Chrome-Headless aus HTML-Vorlage. Twint-QR-Code ist eingebaut
(`hofladen-schutz/twint-qr.png`).
