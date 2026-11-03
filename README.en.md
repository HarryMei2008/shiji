# SHIJI 拾季

Seasonal produce subscription site · Interactive single-page website · Chinese & English

[简体中文](README.md) · **English**

## Live site

- Chinese: https://harrymei2008.github.io/shiji/
- English: https://harrymei2008.github.io/shiji/?lang=en
- Or use the **EN / 中** button next to the "拾季" brand in the nav — your choice is remembered

## What this is

A fictional "subscribe to the season" brand demo: 12 seasonal ingredients each
quarter, from tomatoes in Yuangmou, Yunnan to grapes in Turpan, Xinjiang —
48 hours from farm to table. This is a course project; the brand and all data
are for demonstration only. No real transactions take place.

## How to use

1. **Hero** — scroll down, or click "Build tonight's dinner" to jump straight to the core feature
2. **Twelve in Season (3D)** — drag to rotate the planet, click an ingredient to see its name and origin
3. **Pantry calculator (the core)** —
   ① pick the dishes you want to cook (6 available) → ② check the ingredients you already have →
   ③ the ring shows live how many items are missing and the total price → ④ missing items are collected into a list →
   ⑤ click "Add to this week's box" to build your subscription box
4. **Six dishes** — each with full step-by-step instructions, expandable in an accordion
5. **Subscription** — choose weekly / biweekly / monthly; the price animates as you switch
6. **Account & checkout** — sign-up, login and ordering are all **local demos**: data is stored
   only in your own browser (localStorage) and never reaches any server

## Technical notes

A pure static site: no framework, no build step, no external CDN dependencies.

- HTML / CSS / vanilla JavaScript
- Three.js r149 (self-hosted in `vendor/`)
- Hero video: H.264 / 720p / 763 KB / 5-second loop / no audio track
- Bilingual approach: a hand-written zero-dependency i18n layer (static copy via
  `data-en` attributes + dynamic copy via a dictionary in `js/i18n.js`,
  falling back to Chinese when a key is missing)

## Project structure

```
index.html           single-page entry (8 sections)
css/site.css         design system and all component styles
js/site.js           scroll effects, pantry calculator, menu, account system
js/i18n.js           bilingual engine (dictionary + data-en)
js/orbit.js          3D "Twelve in Season" (drag damping + Raycaster picking)
vendor/three.min.js  Three.js r149
assets/hero-loop.mp4 hero background video
refs/                visual references and design tokens
```

## Local preview

```bash
python -m http.server 8000
```

Then open http://127.0.0.1:8000

Do not open `index.html` directly by double-clicking — under the `file://`
protocol the browser restricts localStorage, so the account features cannot persist.

## Deployment

Push your changes and GitHub Actions redeploys automatically:

```bash
git add -A
git commit -m "Update docs"
git push
```

Live in about a minute.

## Version

🔒 Current version **v2330** (git tag, frozen on 2026-11-02).
