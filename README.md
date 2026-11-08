# Bliss Narrower

Type a sentence in English and get the Blissymbols you **actually** mean.

Most Bliss tools match English words to symbols and stop there. But an English word often fits several Bliss symbols. *You* can be one person or a group. *They* can be people or things. *Drink* can be something you do or something in a glass. Bliss has a separate symbol or marker for each of these, so a tool that never asks can't know which one you meant.

Bliss Narrower starts from every symbol your words *could* mean, then asks short questions in plain language, each with an everyday example, until only one meaning is left:

| It asks | With examples like | (Grammar name) |
|---|---|---|
| Who do you mean? | "Just me: *I am hungry*" / "Me and others: *We are hungry*" | singular / plural |
| How many people are you talking to? | "*Sam, are you coming?*" / "*Are you all coming?*" | 2nd person sing. / pl. |
| People or things? | "*They (my friends) laughed*" / "*They (the boxes) fell*" | personal / impersonal |
| How many? | "one apple" / "lots of apples" | plural indicator |
| When does it happen? | "I eat" / "I ate" / "I will eat" / "I would eat" / "Eat!" | tense indicators |
| Is it a doing word or a thing? | "to drink" / "a drink" | verb / noun / adjective |
| Which meaning? | pick from the symbol pictures | word sense |

Each symbol in your sentence is colour-coded:

- **Red:** the program couldn't work out the meaning on its own. Tap it and a small pop-up asks only that word's questions. *Next red word ›* jumps straight to the next one.
- **Yellow:** the program filled in the meaning from your English (like *we*, *apples* or *ate*). Tap it to check, then change it or press *Looks right ✓*.
- **Green:** you set or confirmed the meaning yourself.

On phones the pop-up opens as a sheet from the bottom of the screen. A counter shows how many meanings are still possible, e.g. *"From 96 possible meanings → exactly 1 ✓"*.

## Features

- English → Bliss with question-by-question narrowing
- Plural, past, future, conditional and command indicators are placed on the symbols. A new indicator replaces the original one in the same spot, over the classifier.
- Optional male/female pronoun forms (turned off by default, as most Bliss users don't mark gender)
- Multi-word entries such as *thank you*
- Words with no match get a search box. Pick a close symbol, or leave the word as text.
- **Sigil art:** press *Make sigil* to turn the current sentence into a single drawing, read from top to bottom. Only symbols made entirely of straight lines are used; ones with curves, circles or letters (like the heart) are skipped, and the list shows which were used and which were skipped. Options:
  - *Overlap:* how much each symbol overlaps the one above it.
  - *Line weight:* thickness of the lines.
  - *Mirror:* reflects the drawing so it is symmetrical.
  - *Centre line:* a vertical line running through the whole sigil.
  - *Start / end marks:* a diamond at the top and a crossbar at the bottom.
  It exports as SVG or PNG.
- Searchable dictionary of all 6,182 BCI-AV symbols, colour-coded by word type
- Export as SVG or PNG, with a live preview, in two layouts:
  - **Plain strip:** the symbols in a row.
  - **Text art (.txt):** each symbol is drawn onto a 1-bit pixel grid, then filled pixels become `o` and empty pixels become spaces, so the sentence can be read in any plain text viewer. It works in strip or box layout (boxes use `+---+` borders), with four detail levels (16, 24, 32 or 48 lines tall) and a choice of fill character (`o # @ X █`). Text cells are about twice as tall as they are wide, so each cell samples a 1:2 area of the symbol. The pen is a little thinner than the printed stroke so that nearby lines stay separate.
  - **Boxes (communication board):** equal square boxes with a border, each with its word above the symbol (or below, or no label). Boxes can be tinted by word type using BCI's colour codes (thing, action, describing, person, small word, expression), and you can set how many boxes go in each row.
- Link to a sentence directly: `index.html?q=we will eat`
- Type `#12345` (a BCI-AV ID) to put in a specific symbol. The dictionary's "Add to my sentence" button does this for you.

## Run it

**Offline, one file:** open `bliss-narrower.html` by double-clicking it. Everything is inside it (styles, code and all 6,182 symbols, about 2 MB), so it needs no server and no internet. You can copy it to a USB stick or email it. After editing the source files, rebuild it with `python3 tools/make_single.py`.

**As a website:** it's a static site with no build step and no dependencies.

**GitHub Pages:** push this folder to a repo, then go to *Settings → Pages → Deploy from branch → main / root*.

**Locally:** browsers block `fetch()` from `file://`, so start a small server:

```
python3 -m http.server 8000
# open http://localhost:8000
```

## Files

```
index.html        page
style.css         styles
app.js            all logic (tokenizer, guessing, questions, SVG rendering)
data/bliss.json   6,182 symbols: id, English glosses, word type, derivation, compact SVG
tools/build.py        rebuilds data/bliss.json from the official BCI downloads
tools/make_single.py  builds the offline single-file bliss-narrower.html
bliss-narrower.html   the whole app in one file (generated)
```

`data/bliss.json` is about 2 MB, and GitHub Pages serves it gzipped. Each symbol's SVG is stored in two parts: the body, and (when the derivation mentions an indicator) the indicator band (`top`) with its x-centre (`tx`). Keeping them apart lets the app swap indicators.

To rebuild after a new BCI-AV release:

```
pip install pandas xlrd
python3 tools/build.py path/to/bliss_svg_id path/to/BCI-AV_derivations.xls data/bliss.json
```

## Limitations

- This is a helper, not an official translator. The English parsing uses simple rules: it lemmatizes words, drops articles, and treats *will / would / did* as tense markers. Unusual grammar can confuse it.
- Indicators are placed over the original indicator position, or centred when the symbol had none. Bliss has finer placement rules for some compounds.
- Only English glosses are loaded. The spreadsheet also has 17 other languages that could be added.

## Licence and credits

Blissymbols and the BCI Authorized Vocabulary (BCI-AV) are © Blissymbolics Communication International (BCI), www.blissymbolics.org, and are used under the Creative Commons Attribution-ShareAlike licence (CC BY-SA 4.0). Check BCI's licensing page for the current terms. This includes `data/bliss.json`, which is derived from BCI-AV, so it must keep that attribution and stay under the same licence.

This is not an official BCI product.

The app code (`index.html`, `style.css`, `app.js`, `tools/`) can use any licence you choose. MIT is a common choice.
