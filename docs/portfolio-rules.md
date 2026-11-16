# Portfolio rules and site guide

Public copy of the working rules for shanymo.com. Internal details (the case-file address, the lock key, staging) are kept out of this file.

## Standing rules
1. **No AI vendor names** anywhere: pages, copy, file names, git history. Describe tools generically (for example "AI agent plugin"). Commits are authored as Shany Mo.
2. **Discuss → test → build** after Shany's OK. Keep variations side by side.
3. **Do not redraw** original design files; show them live.
4. **Privacy:** no phone number, personal email or CV on the site; redact personal details in screenshots; no company names on About.
5. **Never type passwords or keys.**
6. **Check every change** at 1512 × 982, 1512 × 860, 1470 × 830, 1024, 834, 390 and 360 before it ships.
7. **The design canvas mirrors the site.**
8. **Only real facts.** No invented numbers, dates, quotes or results; unknowns stay `[to confirm]`.

## Site map
Menu: Home · Work · Playground · About · Contact.
- Work `/work/`, with Inventory as a sub-page at `/work/inventory/`.
- Playground `/playground/` (replaced Lab; `/lab/` and `/inventory/` redirect).
- About `/about/`, Contact `/contact/`.

## Typography (`/assets/type.css`, linked last on every page)
- Scale: 11 · 13 · 15 · 17 · 22 · 30 · 44 · 64, plus one headline size.
- Headline: clamp(2.4rem, 5.6vw, 4.75rem), line-height .96, letter-spacing −.025em.
- Sentences have no letter spacing; uppercase labels keep +.06em.
- Reading text 17px / 1.5; dense rows 15px; nothing below 11px; paragraphs about 68 characters.
- Heros for text, IBM Plex Mono for code and technical labels.

## Layout and spacing
- Content column max 1320px; gutter 32px (16px on phones).
- Header and top line sit at the same pixel on every page.
- Spacing scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96.
- Edge-to-edge bands use `width:100vw; margin-left:calc(50% - 50vw)`, text aligned to the page grid.

## Components
- Highlighted headline words: gradient band, `background-size: 100% 74%` at 64%, inside the h1 only.
- Chip: white, 1px #CFCFCF, pill, 44px, uppercase. Main button: 2px rainbow border, Heros bold uppercase, 56px.
- Arrow ↗ is a drawn icon, never the text character.
- Footer on every page: rolling banner, then the copyright line.
- Ask Mo, "your concierge", on every page; answers only from the published record.

## Playground
- Edge-to-edge book. Left: Problem · For · Value · Proof · Stack, then "Try it in 30 seconds". Right: a light code editor with ▶ Run and log / output / JSON.
- Code projects get the editor; UI-led projects get an app view. Only Shany's own work.
