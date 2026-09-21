# Vokabeltrainer

Eine reine Client-Website (HTML/CSS/JavaScript, keine Abhängigkeiten, kein Server) zum Erstellen
und Üben von Vokabeltests. Sie orientiert sich an dem im Englischunterricht beschriebenen Prinzip:
Vokabeln werden nicht als reine Wort-für-Wort-Übersetzung abgefragt, sondern im Kontext, durch
Synonyme/Antonyme, Umschreibungen und aktive Anwendung in ganzen Sätzen.

## Nutzung

Die Seite braucht keinen Build-Schritt. Einfach `index.html` in einem Browser öffnen, oder lokal
z. B. mit `python3 -m http.server` bereitstellen und `http://localhost:8000` aufrufen. Alle Daten
(Vokabellisten, Notenschlüssel) werden ausschließlich lokal im Browser gespeichert (`localStorage`).

## Bereiche

- **Vokabeln**: Vokabellisten mit deutschem Wort, englischem Wort, Beispielsatz (mit `{{word}}` als
  Lückenmarkierung), Synonymen, Antonymen und einer englischen Umschreibung. Mehrere Listen
  verwaltbar, JSON-Import/-Export zum Sichern oder Teilen.
- **Test**: erzeugt aus einer Vokabelliste einen Test mit Lückensätzen, Synonym-/Antonym-/
  Umschreibungsfragen (automatisch bewertet) sowie freien Sätzen (Selbst-/Fremdbewertung anhand
  eines Rubrik-Formulars). Tippfehler werden über eine Ähnlichkeitsheuristik von echten Fehlern
  unterschieden.
- **Spiel**: ungewertetes Memory-Spiel zum Üben (Englisch ↔ Deutsch).
- **Einstellungen**: Notenschlüssel (Fehlerquote → Note) frei anpassbar, Datenverwaltung.

## Bewertungslogik

Wort-/Grammatikfehler zählen als ein ganzer Fehlerpunkt, Rechtschreibfehler als 1/3 Fehlerpunkt;
bei frei geschriebenen Sätzen sind maximal zwei Fehlerpunkte pro Satz möglich. Aus der Summe aller
Fehlerpunkte im Verhältnis zur maximal möglichen Punktzahl ergibt sich eine Fehlerquote, die über
den (frei editierbaren) Notenschlüssel in eine Note übersetzt wird.
