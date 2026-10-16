<div align="center">

# Task Ledger

**A weekly task and gold tracker for Dragon Nest players with multiple characters and accounts.**

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Dependencies](https://img.shields.io/badge/runtime%20dependencies-0-lightgrey)
![Storage](https://img.shields.io/badge/storage-local%20browser-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## Overview

Task Ledger keeps track of everything your characters clear each week, the rewards they earn, and the gold you make. It is plain HTML, CSS and JavaScript with no framework, no server and no account. Your data stays in your own browser.

The source is split into small files under `src/`. A tiny build script embeds them into **one self-contained HTML file** (`docs/index.html`) that you can open directly or host anywhere.

> **Note:** Task Ledger is an unofficial fan-made tool and is not affiliated with or endorsed by Nexon, Eyedentity Games or any Dragon Nest publisher. *Dragon Nest* is the property of its respective owners.

## Features

| Area | What it does |
| --- | --- |
| **Dashboard** | Weekly progress, clears, gold earned, reset countdown, per-task and per-account completion, gold per game week, and a recent activity feed. |
| **Weekly Tracker** | A grid of characters against weekly tasks. Mark tasks as done, pick a difficulty or floor, or log multiple runs for ARK and EFM. Filter by account or search by IGN or class. |
| **Reports** | Daily, weekly and monthly breakdowns of clears, gold, reward totals, per-task and per-character results, plus a gold trend chart. |
| **Manage** | Add accounts, characters and classes. Choose which tasks to track. Edit rewards for every difficulty. |
| **Shiny Hero Coin conversion** | Tick one checkbox on the dashboard to convert all of this week's Shiny Hero Coins into gold. The gold is added to *Gold this week*. |
| **Talisman bonus** | Erosion (EFM) runs with the talisman box ticked earn a configurable gold bonus. |
| **Class dropdown** | Pick each character's class from a built-in list of all classes. Add or rename custom classes under **Manage → Classes**. |
| **Import and export** | Export the rewards table and the class list as JSON or CSV, edit them in a spreadsheet, and import them back. |
| **Backup** | Export and import your data as JSON, by file or by copy and paste. |
| **Themes** | Follows your system light or dark preference. |
| **Responsive** | Works on desktop and phone screens. |

### Supported weekly tasks

ARK, EFM, NM, RCR, Cube Awaken, Decaying Root, Paradox FrDN (Light and Normal), GoDNZ, GoDN, GoDN HC, Bone (L, N, HC), BDN (L, HC), DDN and GUDN HC.

ARK, EFM, NM, RCR and Decaying Root ship with reward tables. Tasks without a table can be given rewards under **Manage → Tasks & rewards**.

## Getting started

### Just use it

Open `docs/index.html` in any modern browser, pick the tasks you want to track, then add your first account and character.

### Host it on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and the **`/docs`** folder, then save.
4. Your app will be live at `https://<your-username>.github.io/<repository-name>/`.

## Project structure

```text
task-ledger/
├── src/
│   ├── index.html            # Page shell and file includes
│   ├── css/
│   │   ├── tokens.css        # Colours, type and light/dark themes
│   │   ├── base.css          # Reset, typography, shared primitives
│   │   ├── layout.css        # Sidebar and page layout
│   │   ├── components.css    # Buttons, cards, KPI tiles, form controls
│   │   ├── tracker.css       # Weekly grid, pills, runs, coin chips
│   │   ├── data.css          # Tables, charts, activity feed
│   │   ├── manage.css        # Manage page, tabs, switches
│   │   ├── overlays.css      # Dialog, chips, toast
│   │   └── responsive.css    # Breakpoints and motion preferences
│   ├── js/
│   │   ├── config.js         # Constants
│   │   ├── icons.js          # SVG icon set
│   │   ├── utils.js          # Formatting, dates, weekly reset
│   │   ├── data.js           # Default tasks and reward tables
│   │   ├── state.js          # App state and migrations
│   │   ├── storage.js        # IndexedDB / localStorage persistence
│   │   ├── mutations.js      # Changing state (clears, coin conversion)
│   │   ├── aggregation.js    # Totals for dashboard and reports
│   │   ├── charts.js         # Bar chart rendering
│   │   ├── views/            # shell, tracker, dashboard, reports, manage, setup
│   │   ├── render.js         # Render loop
│   │   ├── events.js         # Click and change handlers
│   │   ├── backup.js         # JSON backup export and import, file saving
│   │   ├── transfer.js       # Rewards table and class list: JSON / CSV import and export
│   │   └── app.js            # Weekly clock and boot
├── examples/                 # Sample rewards and classes files (JSON and CSV)
├── docs/
│   └── index.html            # Built single-file app (served by GitHub Pages)
├── Build.java                # Embeds CSS and JS into one HTML file
├── LICENSE
└── README.md
```

## Development

There are no packages to install. Building needs a JDK, version 11 or newer, and runs straight from source with no compile step.

```bash
# Edit files under src/, then rebuild the single-file app (run from the repository root)
java Build.java

# Or write it somewhere else
java Build.java dist/task-ledger.html
```

You can also open `src/index.html` directly in a browser while developing. It loads the CSS and JS files as they are, so you only need to rebuild before publishing.

**How the build works:** `Build.java` reads `src/index.html`, replaces each local `<link rel="stylesheet">` with one combined `<style>` block, and joins every local `<script src>` in the order listed into a single `<script>` wrapped in a function scope. External links, such as Google Fonts, are left untouched.

Script order matters because the files share one scope. If you add a file, list it in `src/index.html` after the files it depends on.

## How it works

### Weekly reset

The game week resets every **Saturday at 09:00 local time**. All weekly progress, totals and the countdown follow that schedule. Past weeks stay in your history and are available in Reports.

### Shiny Hero Coin to gold

Clearing an NM floor awards Shiny Hero Coins. On the dashboard, the **Gold this week** card shows the total as `Shiny Hero Coins ×N` with a checkbox.

- Ticking it converts every coin earned this week into gold at **10,000g per coin** by default.
- Unticking restores the coins.
- Change the rate under **Manage → Settings & data → Gold per Shiny Hero Coin**. Coins that were already converted keep the rate they were converted at.

### Import and export rewards and classes

Open **Manage → Settings & data → Rewards table & classes**. The same buttons also appear on the **Tasks & rewards** and **Classes** tabs. Each has **JSON**, **CSV** and **Import** buttons. Sample files are in [`examples/`](examples/).

**Rewards table, CSV** (one row per reward):

```csv
task_id,task,difficulty,item,qty,qty_text
ark,ARK,Ark of Transcendence [Past] 1F,Lunar Eclipse Fragment (6 Types),150,
root,Decaying Root,Golden · Ascension 5F,Deeply Rooted Fragment of Longing,8,8 - 24
root,Decaying Root,Golden · Ascension 5F,Contaminated Will,0,1 (probability)
```

- `task_id` or `task` identifies the task, `difficulty` is the floor, `qty` is the number counted in totals, and `qty_text` is optional display text such as a range.
- A floor with no rewards is a row with an empty `item`.
- Excel and LibreOffice files work, including semicolon-separated CSV and a UTF-8 byte order mark.

**Rewards table, JSON:** a `tasks` list, each with `id`, `name`, and `difficulties`, which hold `name` and a `rewards` list of `{ "item", "qty", "qtyText" }`.

**Classes:** a CSV with one `class` column, or JSON with a `classes` list. A plain text file with one class per line also works.

**How importing behaves**
- Rewards are matched to your tasks by `task_id`, then by task name. Tasks that don't match are skipped and counted.
- For every matching task, the file's floors and rewards **replace** the current ones. Clears you already logged keep the rewards they were saved with.
- Importing classes replaces the list. Any class a character still uses is kept so nothing is lost.
- Files are checked before anything changes. A bad file shows an error and leaves your data as it was.

Export a backup first if you are unsure.

### Gold format

Gold is stored in gold units, with decimals for silver and copper. For example, `28333.2775` is displayed as 28,333g 27s 75c.

## Data and privacy

- Everything is saved in your browser using IndexedDB, with `localStorage` as a fallback.
- Nothing is uploaded or sent to any server.
- Clearing your browser data removes your records, so **export a backup regularly** from *Manage → Settings & data*.
- To move to another device, export the JSON file and import it there.

## Customising

- **Class list:** the default classes are in `CLASSLIST` in `src/js/data.js`.
- **Reward tables:** the defaults live in `src/js/data.js` (`ARKDATA`, `NMDATA`, `EFMGOLD`, `RCRFRAG`, `ROOTGROUPS` and `defaultTasks()`). Update them when a patch changes rewards, or edit them in the app.
- **Colours and theme:** change the tokens in `src/css/tokens.css`.
- **Fonts:** the interface uses [Inter](https://fonts.google.com/specimen/Inter) and [Nunito](https://fonts.google.com/specimen/Nunito), loaded from Google Fonts. Without a connection it falls back to the system font.

## Browser support

Any current version of Chrome, Edge, Firefox, Safari or Brave.

## Contributing

Issues and pull requests are welcome, especially for patch reward updates and additional tasks.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/my-change`.
3. Edit files under `src/` and run `java Build.java`.
4. Commit the source changes together with the rebuilt `docs/index.html`, then open a pull request.

## License

Released under the [MIT License](LICENSE).

## Acknowledgements

- Dragon Nest is a trademark of its respective owners.
- Typefaces: Inter by Rasmus Andersson and Nunito by Vernon Adams.
