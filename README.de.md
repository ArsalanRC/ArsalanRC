<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/header-dark.svg">
  <img alt="Arsalan Khadim, Softwarearchitekt und Full-Stack-Engineer" src="./assets/header-light.svg" width="100%">
</picture>

<a href="https://github.com/ArsalanRC">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/badge-github-dark.svg">
    <img alt="GitHub" src="./assets/badge-github-light.svg" height="40">
  </picture>
</a>
<a href="https://www.linkedin.com/in/muhammad-arsalan-khadim-b87550259/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/badge-linkedin-dark.svg">
    <img alt="LinkedIn" src="./assets/badge-linkedin-light.svg" height="40">
  </picture>
</a>

[English](./README.md) · **Deutsch**

---

**Softwarearchitekt und Full-Stack-Engineer.** Aktuell Software Development Manager, das heißt: Ich verantworte die Systeme und die Roadmap und schreibe nebenbei einen ordentlichen Teil der Commits selbst.

Der Großteil meiner Arbeitszeit geht in die unglamouröse Hälfte der Softwareentwicklung: Systeme, die nie dafür gebaut wurden, zuverlässig miteinander reden zu lassen. Jeden Tag, ohne dass es jemandem auffällt. Lagerverwaltung, ERP-Integrationen, Logistik-APIs. Code, bei dem ein stiller Fehler jemanden eine Sendung kostet.

Die Repos hier sind die andere Hälfte. Dort darf ich etwas von Grund auf entwerfen und die Architektur ernst nehmen.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/components/stats-dark.de.svg">
  <img alt="6 öffentliche Repos, 144 Tests grün, 0 Abhängigkeiten, 100% Community Standard, 16 gemergte Pull Requests" src="./assets/components/stats-light.de.svg" width="100%">
</picture>

---

## Portfolio

### [arsalanrc.github.io](https://arsalanrc.github.io)

Alles an einem Ort, die Projekte in einer 3D-Szene, die sich mit der Maus steuern lässt. Englisch und Deutsch, hell und dunkel.

---

## Ein Rätsel, weil meine Schach-Engine gerade nichts zu tun hatte

<!-- PUZZLE:START -->

<img src="./assets/puzzle/board.svg" width="470" alt="Schachstellung, Weiß am Zug, Matt in eins">

**Weiß am Zug. Matt in eins.** Wähle einen Zug und sieh nach, ob er funktioniert.

<details>
<summary><code>Ra1-a8</code> &nbsp; Turm nach a8</summary>

**Richtig. Schachmatt.** Der schwarze König ist von den eigenen Bauern auf f7, g7 und h7 eingemauert. Ein Turm, der die Grundreihe erreicht, beendet die Partie deshalb sofort: nichts kann dazwischenziehen, nichts den Turm schlagen, und der König hat kein Feld.

</details>

<details>
<summary><code>Bc4xb5</code> &nbsp; Läufer schlägt auf b5</summary>

**Gewinnt Material, verpasst den Sieg.** Schwarz bekommt 8 legale Züge und die Partie geht weiter. Eine Figur geschenkt zu nehmen ist meistens richtig. Genau deshalb ist der Zug verlockend, und genau deshalb ist er hier falsch.

</details>

<details>
<summary><code>Bc4xf7</code> &nbsp; Läufer schlägt auf f7</summary>

**Schach, aber kein Matt.** Schwarz hat 3 legale Antworten, der Angriff läuft also ins Leere. Schach geben ist nicht dasselbe wie die Partie beenden, und genau darum geht es hier.

</details>

<!-- PUZZLE:END -->

Jede Antwort oben wurde gegen [`chess-engine`](https://github.com/ArsalanRC/chess-engine)
geprüft statt von Hand geschrieben. Das Rätsel kann also nichts behaupten, dem die Engine
widerspricht. Zwei unsaubere Entwürfe hat sie vorher aussortiert.

**Lieber eine echte Partie?** [Gegen die Engine im Browser spielen](https://arsalanrc.github.io/chess-engine/):
Sie antwortet sofort, ganz ohne Formulare.

---

## Direkt ausprobieren

Keine Installation, keine Anmeldung, nichts herunterzuladen. Beides läuft direkt im Browser.

| | |
|---|---|
| ▶︎ **[Gegen meine Schach-Engine spielen](https://arsalanrc.github.io/chess-engine/)** | Ein Minimax-Bot mit Alpha-Beta-Pruning, und daneben die Innenansicht der Engine in Echtzeit |
| ▶︎ **[integration-patterns erklärt](https://arsalanrc.github.io/integration-patterns/)** | Animiert Schritt für Schritt: ein doppelter Webhook wird abgefangen, ein Retry-Sturm wirft einen Dienst um |
| ▶︎ **[recon beim Abgleich zusehen](https://arsalanrc.github.io/recon/)** | Sechs Zeilen und ein Schalter für die Toleranzen. Dieselben Zeilen, sechs Funde oder vier |

---

## Ausgewählte Projekte

<a href="https://github.com/ArsalanRC/recon">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/components/card-recon-dark.de.svg">
    <img alt="recon: zwei Systeme widersprechen sich, welche Widersprüche davon wirklich zählen" src="./assets/components/card-recon-light.de.svg" width="480">
  </picture>
</a>
<a href="https://github.com/ArsalanRC/chess-engine">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/components/card-chess-dark.de.svg">
    <img alt="chess-engine: alle FIDE-Regeln und ein Minimax-Bot mit Alpha-Beta-Pruning" src="./assets/components/card-chess-light.de.svg" width="480">
  </picture>
</a>
<a href="https://github.com/ArsalanRC/integration-patterns">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/components/card-patterns-dark.de.svg">
    <img alt="integration-patterns: Idempotenz und Retry mit Full Jitter" src="./assets/components/card-patterns-light.de.svg" width="480">
  </picture>
</a>
<a href="#game-arena">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/components/card-arena-dark.de.svg">
    <img alt="Game Arena: 28 Spiele, eine Codebasis, Spiellogik fasst React nie an" src="./assets/components/card-arena-light.de.svg" width="480">
  </picture>
</a>

---

## Game Arena

Eine Spieleplattform, gebaut um herauszufinden, wie weit sich eine strikte Architekturgrenze treiben lässt. 28 Spiele, eine Codebasis, **940 Tests**.

Eine Regel hat alles andere geprägt: Spiellogik fasst React niemals an. Jede Engine ist reines TypeScript, also deterministische Funktionen, keine Seiteneffekte, keine Framework-Importe. Der State liegt in Zustand-Stores, die ausschließlich als Brücke dienen, und die UI-Schicht rendert nur.

```mermaid
graph TD
    UI["UI-Schicht<br/>React · SVG · Framer Motion"]
    Store["State-Brücke<br/>28 Zustand-Stores"]
    Engine["Engine-Schicht<br/>reines TypeScript · kein React"]
    DB["Supabase<br/>Postgres · Auth · Realtime"]

    UI <--> Store
    Store <--> Engine
    Store <--> DB

    style Engine fill:#1f6feb,stroke:#58a6ff,color:#fff
    style DB fill:#238636,stroke:#3fb950,color:#fff
```

Diese Grenze hat sich immer wieder ausgezahlt. Engines sind trivial testbar, weil nichts gerendert, nichts gemockt und kein DOM aufgebaut werden muss. Dieselbe Schach-Engine läuft im Browser, im Test-Runner und in der Suchschleife eines Bots, ohne eine einzige Änderung. Und das Beste: Ein Bug liegt immer auf genau einer Seite der Grenze.

<details>
<summary><b>Was drinsteckt</b></summary>

<br/>

**Spiele.** Schach, Dame, Backgammon, Ludo, Reversi, Vier gewinnt, Poker (Heads-up Hold'em), Sea Strike, Estate Tycoon mit 6 Spielbrett-Varianten, Sudoku, Solitär, Snake, Tetris- und Pac-Man-Varianten und mehr. Jeweils mit Bot-Gegnern in drei Stufen sowie lokalem Wechselspiel.

**Bots.** Die KI passt zum Spiel statt ein einziger Universallöser zu sein: Minimax mit Alpha-Beta-Pruning für Schach, Dame und Vier gewinnt; Positions- und Mobilitätsheuristiken für Reversi; Pot-Odds-Bewertung für Poker; Gedächtnis-Tracking für Memory.

**Online-Mehrspieler.** Auf Supabase Realtime, jeder Zug serverseitig validiert. Bei Sea Strike wird der Spielfeldzustand über `SECURITY DEFINER`-Funktionen partitioniert, sodass keiner der beiden Spieler die Schiffsaufstellung des Gegners aus der Datenbank lesen kann, auch nicht mit gültiger Session.

**Sicherheit.** Row Level Security auf jeder Tabelle, keinerlei anonymer Zugriff, Rechteänderungen nur über die Service-Rolle.

**Internationalisierung.** 23 Sprachen, davon drei von rechts nach links, mit sprachbewusstem Routing.

**Responsive.** Ein Layoutsystem für Smartphone, Tablet, Desktop und TV, inklusive Safe-Area-Handling für Geräte mit Notch.

</details>

<br/>

*Der Quellcode ist privat. Über die Architektur spreche ich gern im Gespräch.*

---

## Wie ich an Software herangehe

**Grenzen vor Features.** Die Schichtaufteilung ist die eine Entscheidung, die sich später nicht mehr billig zurücknehmen lässt. Also verdient sie die Zeit. Alles andere ist verhandelbar.

**Reinheit dort, wo sie zählt.** Fachlogik ohne Framework-Abhängigkeit lässt sich wirklich testen, wiederverwenden und durchdenken. Seiteneffekte gehören an den Rand, die Mitte bleibt sauber.

**Sicher by default, nicht durch Review.** RLS ist aktiv, bevor die Tabelle Zeilen hat, und Policies verweigern im Zweifel. Ein Recht, das nie vergeben wurde, kann auch nicht das sein, das leakt.

**Aufschreiben.** Zu jedem Projekt, das ich verantworte, gehören Architekturdokumente und Konventionen, die ein neuer Entwickler (oder ein LLM) kalt lesen und innerhalb einer Stunde nutzen kann. Je mehr Leute den Code anfassen, desto wichtiger wird das.

---

## Stack

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/components/stack-dark.de.svg">
  <img alt="Stack: TypeScript, Python, JavaScript, Node.js, PostgreSQL, React, Next.js im Einsatz; Python, SQL, Bash, Supabase, REST, Webhooks im Beruf; Java, Rust, C++, C, C# als Nächstes geplant" src="./assets/components/stack-light.de.svg" width="100%">
</picture>

---

## Kontakt

- **LinkedIn** · [muhammad-arsalan-khadim](https://www.linkedin.com/in/muhammad-arsalan-khadim-b87550259/)
