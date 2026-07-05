# Product

## Register

product

## Users

Guild officers and loot council of a World of Warcraft guild — a small, trusted group. Most members open the tool to *read*: check statistics, per-player loot history, and priority tracking after a raid. Only the few authenticated officers *write*: they log in, add players, search Blizzard's item database, and record who looted which item. The context is post-raid or between raids, often on desktop but sometimes on a phone, deciding loot fairly and settling "who's next" disputes with data.

## Product Purpose

Penguin Loot Tracker records which player looted which item across a guild's raids, and turns that history into fairness signals: per-player loot counts, distribution charts, and a priority tracker. It exists to replace spreadsheets and memory with a shared, trustworthy record, so loot decisions are transparent and defensible. Success looks like: an officer can look up an item and assign it in seconds, and any member can answer "who got the most loot / who's due next" at a glance without asking.

## Brand Personality

Themed, with character — a guild tool that wears its World of Warcraft roots proudly. Voice is warm, a little playful, and in-world ("Preparing the loot vault…", "For the guild"). Three words: **epic, warm, trustworthy**. The dark torchlit-hall surfaces with loot-gold accent and item-quality colors (rare/epic) should feel like treasure, not like a generic SaaS dashboard. Personality lives in the moments (loading, empty states, success, copy) while the core task stays fast and legible.

## Anti-references

- Generic SaaS admin dashboards (the flat gray Bootstrap-admin look) — this is a guild tool, not an enterprise console.
- The hero-metric template: giant number + tiny label + gradient accent stat cards.
- Over-theming that hurts the task: gratuitous animation, decorative fantasy fonts in labels/data, or ornamentation that slows down assigning loot.
- Cold, clinical corporate tone in copy.

## Design Principles

1. **The record must be trustworthy at a glance.** Stats, counts, and priority are the product; they read clearly and honestly before any flourish.
2. **Reading is the common case; writing is the privileged case.** Optimize the view experience for everyone, and make the officer's write path (login → add player → search → assign) fast and unmistakable.
3. **Theme in the moments, not in the way.** Personality shows up in loading, empty states, success, and copy — never at the cost of legibility or speed on the core task.
4. **Earned familiarity.** Standard product affordances (nav, tables, modals, forms) behave exactly as officers expect from real tools; surprise is reserved for delight, not for basic controls.
5. **Fairness is visible.** The UI should make the "who's next / who got the most" answer obvious, because that's the argument the tool exists to settle.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**. Body text ≥4.5:1 and large text ≥3:1 against the dark surfaces (the muted "night" grays on charcoal need checking). Full keyboard operability for the officer write flow (search, assign, add player, modals dismissable via Esc). Visible focus indicators. Touch targets ≥44×44 for the mobile officer. Don't convey loot status or item quality by color alone — pair with label, icon, or text. Respect `prefers-reduced-motion` for the pop/enter transitions already in use.
