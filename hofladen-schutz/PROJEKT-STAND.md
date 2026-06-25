# Betriebsschutzgesetz (BSchG) – Projektstand

**Stand:** 25. Juni 2026
**Form:** Eigenständiges kantonales Spezialgesetz (Kanton St. Gallen)
**Live:** https://jonasstreule.ch/hofladen-schutz/

---

## Architektur

Multi-Kampagnen-Setup unter `jonasstreule.ch`, deployt via GitHub Actions → SSH →
`git pull` auf einem Hetzner-Server (Caddy als Reverse Proxy).

```
/                      → Hub-Startseite (index.html), listet alle Kampagnen
/hofladen-schutz/      → Kampagnenseite (hofladen-schutz/index.html)
/datenschutz.html      → gemeinsame Datenschutzerklärung
/shared/*.json         → geteilte Daten (Kantonsräte, PLZ→Wahlkreis)
/api/<campaign>/...    → Backend (Node/Express/Postgres, im Container)
liste.jonasstreule.ch  → Listmonk (Newsletter), Double-Opt-in
```

Das Frontend ist je eine in sich geschlossene HTML-Datei (CSS + JS inline),
mobile-first. Das Backend liegt unter `api/` (TypeScript, Migrations in
`api/migrations/`). Secrets stehen serverseitig in `/srv/jonasstreule/repo/api/.env`
(nicht in git).

---

## Gesetzestext – aktueller Stand (§§ 1–9)

Vollständig auf der Seite unter „Mitmachen" abgebildet (jeder Artikel ist dort
kommentierbar). Kernpunkte:

- **§ 2 Geltungsbereich:** Landwirtschaft (Hofläden, 24h-Läden, Automaten),
  Gewerbe (eigenes Gelände), Andachtsräume sowie sakrale Klein- und Flurdenkmäler
  (Wegkreuze, Bildstöcke, Feldkapellen) mit Denkmal-/Kulturwert
- **§ 3 Stufe 1 (eigenes Gelände):** bewilligungsfrei, gratis, 24/7,
  Selbstdeklaration bei der Kantonspolizei, Speicherung höchstens 30 Tage
  (verhältnismässige Höchstfrist), gesichert + automatische Löschung (§ 3 Abs. 3/4)
- **§ 4 Stufe 2 (öffentliche Flächen):** Kapo-Bewilligung, gratis, mit
  Genehmigungsfiktion (gilt als erteilt, wenn Kapo nicht innert 30 Tagen
  widerspricht); Beschränkung aufs Notwendige + Maskierung
- **§ 5 Zweckbindung:** nur Strafverfolgung/Sicherheit, KEINE permanente
  Visionierung (nur Sichtung im Anlassfall), keine Weitergabe, keine Gesichtserkennung
- **§ 6 Kennzeichnung:** ein Hinweis am Zugang genügt
- **§ 7 Zuständigkeit und Mittel:** Kantonspolizei; Abs. 3 verpflichtet den Kanton, die Kapo
  für die neue Aufgabe personell/finanziell/technisch ausreichend auszustatten
- **§ 8 Bundesrecht:** Vorbehalt, betriebsfreundliche Auslegung
- **§ 9 Aufsicht/Widerruf**

### Rechtliche Absicherung (im Text verankert – nicht entfernen)

- **§ 5 Abs. 2 (Visionierungsbeschränkung)** stützt sich auf das Urteil des
  Verwaltungsgerichts St. Gallen **B 2005/202 vom 9. Mai 2006**.
- **§ 4 (Maskierung/Beschränkung aufs Notwendige)** ist die Schutzklausel gegen
  die abstrakte Normenkontrolle.
- **§ 1 Abs. 3** verankert das Gesetz als kantonale Sicherheitsmassnahme im öffentlichen
  Interesse + DSG-Harmonisierung (Art.-6-ZGB-Anker gegen Bundesrechts-Kollision).
- **§ 3 Abs. 3/4** = 30 Tage als verhältnismässige Höchstfrist + Datensicherung/automatische
  Löschung (stützt sich auf BGE 133 I 77: Verhältnismässigkeit hängt an Zugriffsschutz).
  Hintergrund/Begründung dieser Härtungen: `recherche/Rechtslage-BSchG.md` (Teil F, lokal).

---

## Erledigt

- Hub + Kampagnen-Struktur, mobile-first Redesign
- Echte Kontaktdaten, Socials (Instagram/TikTok @jonasstreule), EDV.sg als Producer
- 120 echte Kantonsräte (ratsinfo.sg.ch) + PLZ→Wahlkreis-Finder
- Echtes Backend (Postgres) für Petition, Spende, Kontakt, VIP, Finder-Lead,
  Newsletter, Artikel-Feedback
- Datenschutzerklärung
- Listmonk-Newsletter (Double-Opt-in), Versand über `rundbrief@jonasstreule.ch`
  (Migadu); Website-Anmeldung wird an Listmonk weitergereicht
- IBAN/Bank/Empfänger + Twint-Deeplink eingetragen
- Mitmach-Feature: §§ 1–9 mit Artikel-Feedback
- SEO/Open-Graph-Tags + Favicon
- Twint-QR-Code eingebaut (echter Code aus Screenshot freigestellt → `twint-qr.png`)
- Gesetzes-PDF neu erzeugt: Entwurfs-/Arbeitsfassung mit Rückmelde-Hinweis
  (jonas.streule@gmail.com / 078 649 19 45), ohne Platzhalter „KANTON [X]",
  korrekte Domain jonasstreule.ch (per Chrome-Headless aus HTML-Vorlage gerendert)

### Sitzung 25. Juni 2026

- **§ 7** um Mittel-Klausel ergänzt (Abs. 3: Kanton stattet Kantonspolizei aus).
- **§§ 1/3 bundesrechtlich gehärtet** (siehe Absicherungs-Block oben): § 1 Abs. 3
  Sicherheits-/Art.-6-ZGB-Anker, § 3 Abs. 3 Höchstfrist, § 3 Abs. 4 Datensicherung +
  automatische Löschung. PDF jeweils neu gerendert.
- **Frontend/UX:** mobiles Hamburger-Menü; FAQ → „Oft gestellte Fragen" + neue Einwand-
  Frage („Parlament regelt das doch schon?"); Kantonsräte als 6er-Vorschau mit „Alle
  anzeigen"; §§ 1–9 im Mitmach-Bereich als Akkordeon; „Ansicht"-Leiste auf „Aa"-Launcher
  eingeklappt; schwebende Buttons auf Desktop ausgeblendet.
- **Anglizismen entfernt** (Jonas wünscht durchgängig Deutsch): Newsletter→Rundbrief,
  Updates→Neuigkeiten, Online-→digital, VIP→prominente Stimme, Link→Adresse,
  Button→Schaltfläche, optional→freiwillig.
- **Interne Rechtsrecherche:** `recherche/Rechtslage-BSchG.md` (Geltendes Recht, Praxis,
  Kompetenzordnung Bund/Kanton, Vollzugshürden, Risiko-Einschätzung). **Liegt bewusst
  lokal** (per `.gitignore` ausgeschlossen, weil das Repo öffentlich ist).
- **Live-Check** (echter Browser): keine Konsolenfehler, API gesund, alle neuen
  Funktionen verifiziert.

---

## Noch offen

1. **Staatsrechtliche Prüfung** des gesamten Texts vor der Unterschriftensammlung
   (zwingend) – v. a. Genehmigungsfiktion auf öffentlichem Grund, Kapo-Zuständigkeit.
2. **Offizieller Unterschriftenbogen:** kommt erst, wenn der Text final und vom
   Amt anerkannt ist (die Online-Unterstützungsbekundung läuft bereits).

Das Gesetzes-PDF ist als **Entwurfsfassung** online; bei Textänderungen muss es neu
gerendert werden (Quelle: §§ 1–9 im JS-Array `gesetzArtikel` in
`hofladen-schutz/index.html`, per Chrome-Headless aus einer HTML-Vorlage).
