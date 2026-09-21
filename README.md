# Vokabeltrainer

Eine Website (HTML/CSS/JavaScript-Frontend + schlanker Node/Express-Server) zum Erstellen und Üben
von Vokabeltests. Sie orientiert sich an dem im Englischunterricht beschriebenen Prinzip: Vokabeln
werden nicht als reine Wort-für-Wort-Übersetzung abgefragt, sondern im Kontext, durch
Synonyme/Antonyme, Umschreibungen und aktive Anwendung in ganzen Sätzen.

## Lokale Nutzung (ohne Docker)

```
npm install
npm start
```

Anschließend `http://localhost:3000` öffnen. Der Server legt seine Daten standardmäßig unter
`./data` ab (siehe `DATA_DIR` unten).

## Deployment mit Docker / Coolify

Das Repository enthält ein `Dockerfile` und eine `docker-compose.yml`. In Coolify genügt es, dieses
Repository als "Dockerfile"-Ressource hinzuzufügen:

1. Neue Ressource → Repository verbinden → Build-Pack **Dockerfile** wählen.
2. Einen **persistenten Volume-Mount auf `/data`** einrichten (z. B. Coolify-Volume
   `vokabeltrainer-data` → `/data`). Hier werden die veröffentlichten Vokabellisten gespeichert;
   ohne diesen Mount gehen sie beim nächsten Deploy verloren.
3. Port `3000` freigeben bzw. die von Coolify verwaltete Domain darauf zeigen lassen.
4. Optional Umgebungsvariablen setzen (siehe unten) – Standardwerte funktionieren bereits.
5. Deployen. Healthcheck läuft gegen `/healthz`.

Lokal lässt sich dasselbe Setup mit Docker Compose testen:

```
docker compose up --build
```

### Umgebungsvariablen

| Variable   | Standard | Bedeutung                                         |
|------------|----------|----------------------------------------------------|
| `PORT`     | `3000`   | Port, auf dem der Server lauscht                    |
| `DATA_DIR` | `/data`  | Verzeichnis für veröffentlichte Vokabellisten (JSON-Dateien pro Liste) |

## Bereiche

- **Vokabeln**: Vokabellisten mit deutschem Wort, englischem Wort, Beispielsatz (mit `{{word}}` als
  Lückenmarkierung), Synonymen, Antonymen und einer englischen Umschreibung. Mehrere Listen
  verwaltbar, JSON-Import/-Export zum Sichern oder Teilen zwischen Geräten.
- **Test**: erzeugt aus einer Vokabelliste einen Test mit Lückensätzen, Synonym-/Antonym-/
  Umschreibungsfragen (automatisch bewertet) sowie freien Sätzen (Selbst-/Fremdbewertung anhand
  eines Rubrik-Formulars). Tippfehler werden über eine Ähnlichkeitsheuristik von echten Fehlern
  unterschieden.
- **Spiel**: ungewertetes Memory-Spiel zum Üben (Englisch ↔ Deutsch).
- **Einstellungen**: Notenschlüssel (Fehlerquote → Note) frei anpassbar, Datenverwaltung.

## Vokabellisten teilen (Link pro Liste)

Im Bereich "Vokabeln" kann die aktive Liste über den Button **"Veröffentlichen & Link erstellen"**
auf den Server hochgeladen werden. Das erzeugt einen kurzen, eindeutigen Link
(`https://.../s/AbCd1234`), der beliebig geteilt werden kann (z. B. über iServ).

- Wer den Link öffnet, bekommt automatisch eine **eigene lokale Kopie** der Liste importiert und
  landet direkt im Testbereich. Alle Übungen, Testergebnisse und Noten bleiben ausschließlich im
  Browser der jeweiligen Person – es wird nichts an den Server zurückgemeldet oder zwischen
  Schüler:innen geteilt. Jede Person übt und wird für sich selbst bewertet.
- Öffnet dieselbe Person den Link erneut (z. B. nach einer Aktualisierung durch die Lehrkraft), wird
  ihre lokale Kopie aktualisiert statt dupliziert.
- Bearbeitet die Lehrkraft die Liste später und klickt erneut auf den (jetzt "Link aktualisieren"
  beschrifteten) Button, bleibt derselbe Link gültig und liefert beim nächsten Öffnen die
  aktualisierten Vokabeln.
- Veröffentlichte Listen sind nur über den (schwer zu erratenden) Link erreichbar; es gibt keine
  öffentliche Übersichtsseite aller Listen.

## Bewertungslogik

Wort-/Grammatikfehler zählen als ein ganzer Fehlerpunkt, Rechtschreibfehler als 1/3 Fehlerpunkt;
bei frei geschriebenen Sätzen sind maximal zwei Fehlerpunkte pro Satz möglich. Aus der Summe aller
Fehlerpunkte im Verhältnis zur maximal möglichen Punktzahl ergibt sich eine Fehlerquote, die über
den (frei editierbaren) Notenschlüssel in eine Note übersetzt wird.

## Architektur

```
public/        statisches Frontend (HTML/CSS/Vanilla-JS-Module), vom Server ausgeliefert
server/        Node/Express-Backend: API für veröffentlichte Vokabellisten + Healthcheck
Dockerfile     Container-Build für Coolify/Docker
```

Der Server speichert jede veröffentlichte Liste als eigene JSON-Datei unter `DATA_DIR/sets/`, dem
Editieren einer Liste ist über ein bei der Veröffentlichung erzeugtes, nur im Browser der Lehrkraft
gespeichertes Edit-Token vorbehalten. Es gibt keine Nutzerkonten und keine Authentifizierung
darüber hinaus – passend für den niedrigschwelligen Klassen-Einsatz, aber nicht für sensible Daten
gedacht.
