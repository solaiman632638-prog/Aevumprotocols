# Recreate this site as a single HTML file: Aevum — Evidence-First Peptide Protocols

You are an expert creative front-end developer. Produce a **single self-contained `index.html`** that reproduces the project below **exactly** — same layout, sections, visuals, motion, and interaction. Pure HTML/CSS/JS in one file: no build step, no framework, no bundler. Use ES modules with a CDN importmap for the one library actually used (Lenis smooth-scroll). Hardcode every value given here as a fixed constant. All the CSS below lives in one `<style>` block in `<head>`; the JS in one `<script type="module">` block before `</body>`. The spring / text-reveal animations from the original (react-spring + spring-text-engine) must be reproduced with **plain JS** — a tiny rAF spring helper and/or CSS transitions — achieving the same feel.

## What it is

A single-page, light-palette landing site for **"Aevum — Independent Peptide Research & Protocol Library"**. The page is built on a rem-based adaptive grid (the root font-size scales with the viewport), uses Google **Onest** as the only typeface, and reads as near-white surfaces (`#ffffff` page, `#f1f0ee` light fills) punctuated by deep near-black ink cards (`#0a0a0a`) and a single burnt-orange accent (`#b15f2c`). It opens with a **full-screen dark intro loader** that counts `000 → 100` and slides up; only then do the above-the-fold reveals play. The hero is a **full-bleed laboratory photograph with a "liquid" cursor-reveal** (moving the pointer paints a soft brush trail of a second image over the first), with a giant `AEVUM` watermark, a line-by-line headline, a carousel card, and an evidence-source grid. Below: a Method statement, a four-pill "Know / More / → / Risk Less" band, a 4-card Library section on black cards, a 4-row Services list with hover-fill rows, a black Stats panel with scroll-driven count-up numbers, and a black footer with a CTA, link columns, a compliance notice and a watermark. A header (Menu button + live local clock) overlays the hero; the Menu opens a full-screen dark overlay; every "Contact / Start tracking / Get early access" CTA opens a **request modal** (stubbed submit). All smooth-scrolling is driven by **Lenis**.

Sections in DOM order: **PageLoader** → **Header** (fixed overlay) → `main`{ **Hero** → **Method** → **CreateBand** → **Library** → **Services** → **Stats** } → **Footer** → **NavMenu** (overlay) → **RequestModal** (overlay).

> **Category rules that override any styling instinct (non-negotiable).** This is a health brand describing largely unapproved research compounds. The page must never state or imply that any compound is safe, effective, or appropriate for a reader; never show a dose, a dosing range, or a "recommended amount" anywhere in the marketing copy; never use body/physique before-and-after imagery, testimonials, star ratings, or results claims; and never imply that a cited source, regulator, or database endorses the brand. Every instruction below is written to respect this. If a design decision is ambiguous, choose the version that claims less.

## Page shell & libraries

### `<head>`

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Aevum — Evidence-First Peptide Protocols</title>
<meta name="description" content="Aevum is an independent library of peptide compounds, protocols, and the human evidence behind them — educational only, never medical advice, and never a dose we cannot stand behind." />
<meta name="theme-color" content="#0a0a0a" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Importmap + module entry (before `</body>`)

```html
<script type="importmap">
{ "imports": { "lenis": "https://unpkg.com/lenis@1.3.23/dist/lenis.mjs" } }
</script>
<script type="module"> /* all JS below */ </script>
```

Lenis import + raf loop (instantiate Lenis with smoothWheel, run a manual raf loop, reset scroll to top on load):

```js
import Lenis from 'lenis';
window.scrollTo(0, 0);
const lenis = new Lenis({ smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
```

**Scroll lock model.** A single boolean `scrollEnabled` gates everything. When something needs to lock scroll (loader, nav overlay, request modal) call a `stopScroll()` that does `lenis.stop()` and sets `html { position:relative; overflow:hidden; height:100% }`; `startScroll()` does `lenis.start()` and removes those three inline styles. The loader stops scroll on mount and starts it when its exit finishes.

**`scrollTo(id)` helper.** Smooth-scroll to an element by id: temporarily disable scroll-state, then after `50ms` `window.scrollTo({ top: <element top + pageYOffset>, behavior: 'smooth' })`, re-enable after `100ms`. Used by the logo, nav links (non-contact), and the hero "Browse compounds" button.

### Global CSS reset / base

```css
*{ box-sizing:border-box; margin:0; padding:0 }
html{ font-size:16px; -webkit-font-smoothing:antialiased }
body{ background:#ffffff; color:#111111; font-family:'Onest',sans-serif; overflow-x:hidden }
a{ color:inherit; text-decoration:none }
button{ font:inherit; color:inherit; background:none; border:none; cursor:pointer }
ul{ list-style:none }
img{ display:block }
.sr-only{ position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0 }
:focus-visible{ outline:2px solid #b15f2c; outline-offset:2px }
@media (prefers-reduced-motion: reduce){ *{ animation:none !important; transition:none !important } }
```

### The rem-based adaptive grid (CRITICAL — bake exactly)

The whole layout is sized in **rem**; the root font-size scales with the viewport so the design stays proportional. The design base is `FONT_BASE = 16px`. Reproduce these media queries verbatim (each = `16 * 100 / baseWidth` vw):

```css
@media (max-width:1920px){ html{ font-size:0.833333vw } }   /* base 1920 */
@media (max-width:1440px){ html{ font-size:1.111111vw } }   /* base 1440 */
@media (max-width:1024px){ html{ font-size:1.5625vw } }     /* base 1024 */
@media (max-width:640px){  html{ font-size:4.444444vw } }   /* base 360  */
```

**Scale-UP above 1920px** (runtime JS, mirrors the original `AdaptiveGrid`): on load + resize, set `html.style.fontSize` to an interpolated value so the layout keeps growing on large displays. Formula with damping `coef = 0.6666`:

```js
function applyAdaptiveGrid(){
  const FONT_BASE = 16, baseWidth = 1920, coef = 0.6666;
  const w = window.innerWidth;
  const widthReduction = ((baseWidth - w) / baseWidth) * 100;   // negative when w > baseWidth
  const size = FONT_BASE - (FONT_BASE * (widthReduction * coef)) / 100;
  if (size > FONT_BASE) document.documentElement.style.fontSize = size + 'px';
  else document.documentElement.style.removeProperty('font-size'); // let media queries drive
}
applyAdaptiveGrid(); addEventListener('resize', applyAdaptiveGrid);
```

Because everything is rem-based, **all sizes below are given in rem/px exactly as Tailwind emitted them** (Tailwind's default scale: `text-sm`=0.875rem, `text-base`=1rem, `text-lg`=1.125rem, `text-xl`=1.25rem, `text-2xl`=1.5rem, `text-3xl`=1.875rem, `text-4xl`=2.25rem, `text-5xl`=3rem, `text-6xl`=3.75rem, `text-7xl`=4.5rem; spacing unit `0.25rem`; `gap-3`=0.75rem etc.). Keep them in rem so the adaptive grid works.

### Shared spring helper (replace react-spring)

Implement one tiny critically-ish-damped spring stepper used for entrance reveals and hovers. react-spring configs are given as `{ tension, friction }`; map them to a stiffness/damping rAF integrator (mass = 1): `accel = tension*(target - x) - friction*v`, integrate at `dt≈1/60`, settle when `|target-x|<0.001 && |v|<0.001`. For entrance reveals you can instead use CSS transitions with the equivalent feel:

- `{ tension:210, friction:26 }` ≈ `cubic-bezier(.22,1,.36,1)` ~0.7s
- `{ tension:200, friction:24 }` / `{180,26}` ≈ `cubic-bezier(.16,1,.3,1)` ~0.8s
- `{ tension:320, friction:18 }` (hovers) ≈ snappy ~0.35s `cubic-bezier(.2,.8,.2,1)`

Either approach is acceptable as long as motion reads springy. Hovers are pointer-driven and disabled on touch.

### Text reveal helper (replace spring-text-engine)

Two reveal modes are used; both play **once** when the element scrolls into view (IntersectionObserver, `mode:"once"`), gated additionally on the intro loader being finished for hero text.

- **Line reveal** (`overflow` clip): split the heading into lines (wrap each line in a `span` with `overflow:hidden`; inner span translates `Y 100% → 0%` and `opacity 0 → 1`). Per-line stagger when given (`lineStagger`). Spring/curve ≈ `duration 900ms, easeOutCubic` → `cubic-bezier(0.215,0.61,0.355,1)`.
- **Word reveal** (Method statement): split into words; each word `translateY(24px→0)` + `opacity(0→1)`, stagger `35ms` per word, `duration 700ms, easeOutQuart` → `cubic-bezier(0.165,0.84,0.44,1)`.

For simplicity you may split by spaces and treat visual "lines" as the natural wrap; the important part is the staggered slide-up-from-clip feel.

## Fixed palette & tokens (bake these in)

```
--background:#ffffff   --foreground:#111111
--ink:#0a0a0a          (black cards / pills / overlays)
--muted:#8d8d8d        --subtle:#b6b6b6
--line:#e6e5e2         (hairline borders)
--surface:#f1f0ee      --surface-2:#e3e2df
--accent:#b15f2c       --accent-from:#cf8047   --accent-to:#97501f
--hero-from:#ecebe9    --hero-to:#c9c9c9   (hero section bg = hero-to #c9c9c9)
```

Radii: `--radius-pill:9999px`, `--radius-card:2rem`, `--radius-card-sm:1.25rem`, `--radius-control:0.875rem`.
Watermark size: `--text-watermark:13rem`.
Page container: `--container-shell:88rem` (use `max-width:88rem; margin-inline:auto` for `.shell`).
Font weights used: 400/500/600/700.

### SVG assets to inline (sized `1em`, `fill`/`stroke` = `currentColor`)

- **LogoMark** (brand 4-point spark), `viewBox="0 0 48 48"`, filled:
  `M24 2c2.2 13.8 7.9 19.6 22 22-14.1 2.4-19.8 8.2-22 22-2.2-13.8-7.9-19.6-22-22 14.1-2.4 19.8-8.2 22-22Z`
- **ArrowRight** `viewBox 0 0 24 24` stroke 2 round: `M5 12h14M13 6l6 6-6 6`
- **ArrowUpRight** stroke 2 round: `M7 17 17 7M8 7h9v9`
- **Globe** stroke 1.4: `<circle cx=12 cy=12 r=9.25/>` + `M12 2.75c2.6 2.3 4 5.8 4 9.25s-1.4 6.95-4 9.25c-2.6-2.3-4-5.8-4-9.25s1.4-6.95 4-9.25zM2.75 12h18.5`
- **X / close** stroke 2 round: `M4 4l16 16M20 4 4 20`
- **CircleDot** stroke 1.6: `<circle cx12 cy12 r9/>` + filled `<circle cx12 cy12 r3.2/>`
- **Grid / menu** (three lines) stroke 2 round: `M4 6h16M4 12h16M4 18h16`

> **Deliberately removed from the original icon set: the filled Star.** Star rows read as customer ratings or efficacy endorsements, which this category must not imply. Everywhere the original used a row of stars, use `CircleDot` instead (see Hero → evidence row).

---

## The loader / reveal (PageLoader)

A fixed full-screen panel on top of everything from first paint. `position:fixed; inset:0; z-index:120; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2rem; background:#0a0a0a; color:#fff; border-radius:0 0 2rem 2rem` (rounded bottom corners).

- Locks scroll on mount (`stopScroll()`).
- **Center content** (`gap:1.25rem`, centered text, `opacity 1`): a row `font-weight:600; font-size:1.5rem` (sm: 1.875rem) reading `[LogoMark, 1.875rem, color:#cf8047] Aevum`; below it a `max-width:24ch; font-size:0.875rem; color:rgba(255,255,255,.55)` paragraph: **"Evidence first. Hype never."**
- **Progress block** `width:min(22rem,72vw); gap:0.75rem`: a `height:1px` track `background:rgba(255,255,255,.15)` with an inner fill `height:100%; background:#cf8047; width:<progress>%; transition:width .1s ease-out`. Below it a row `justify-content:space-between; font-size:0.75rem; font-weight:500; text-transform:uppercase; letter-spacing:.05em; color:rgba(255,255,255,.45)` → left `Loading`, right a tabular-nums counter `color:rgba(255,255,255,.8)` showing the number **zero-padded to 3 digits** (`000`…`100`).
- **Count animation:** drive progress `0 → 100` over `FILL_MS = 1300ms`, eased with **easeInOutCubic** (`t<.5 ? 4t³ : 1-((-2t+2)³)/2`), `progress = round(ease(t)*100)`.
- **Exit:** when the count reaches 100, slide the whole panel up: `transform: translateY(0%) → translateY(-100%)` with spring feel `{tension:220,friction:30}` (~`cubic-bezier(.22,1,.36,1)`, ~0.7s); simultaneously fade the center content `opacity 1→0, translateY 0→-12px`. When the slide finishes: set the global **intro `ready` flag true**, `startScroll()`, and remove the loader from the DOM. All hero reveals are gated on `ready`.

---

## Layout & sections (in order)

A `.shell` wrapper = `max-width:88rem; margin-inline:auto`. Default horizontal padding `px-5`=1.25rem, `sm:px-8`=2rem (sm breakpoint = 640px). `lg` = 1024px.

### A skip link (first focusable)

`<a href="#main">Skip to content</a>` — visually hidden until focused, then `position:fixed; left:1rem; top:1rem; z-index:60; border-radius:.875rem; background:#0a0a0a; padding:.5rem 1rem; font-size:.875rem; color:#fff`.

---

### 1) Header (fixed overlay, entrance gated on `ready`)

`position:absolute; inset-inline:0; top:0; z-index:50`. Entrance: `opacity 0→1, translateY(-14px→0)`, spring `{210,26}`, delay `150ms` after `ready`.

Inner: `.shell` flex row, `align-items:center; justify-content:space-between; gap:1.5rem; padding:1.25rem` (sm: `2rem 2rem`).

- **Left — brand button** (`onClick → scrollTo('home')`): a hover-spring `span` (`scale 1→1.04`, `{320,18}`) `display:flex; align-items:center; gap:.5rem; font-size:1.125rem; font-weight:600; letter-spacing:-.01em` → `[LogoMark 1.25rem color:#b15f2c] Aevum`.
- **Center — primary nav** (`display:none` below `lg`, then `flex`): `ul` `gap:2rem; font-size:.875rem; font-weight:500`. Items (each a button; hover lifts the label `translateY(0→-2px)` + `opacity .8→1`, `{320,22}`): **Home** (current, `aria-current=page`), **Library**, **Protocols** (with a `▾` dropdown caret, `font-size:.75rem opacity:.6`), **Method**, **Journal**, **Contact**. Click routing: `Home→#home`, `Library→#library`, `Protocols→#services`, `Method→#method`, `Journal→#journal`, `Contact→opens request modal`. Non-contact links call `scrollTo(id)`.
- **Right — clock chip + Menu**:
  - Clock chip (`display:none` below `md`=768px, then `flex`): `border:1px solid rgba(230,229,226,.8); background:rgba(255,255,255,.4); backdrop-filter:blur(4px); border-radius:.875rem; padding:.5rem .75rem; gap:.75rem; font-size:.75rem; color:rgba(17,17,17,.7)`. Contents: muted label **"Local time"** (`color:rgba(17,17,17,.45)`), then a `min-width:3.5rem; tabular-nums; font-weight:500; color:#111` **live time** (e.g. `9:41am`), a `•` separator (`color:rgba(17,17,17,.3)`), then a `font-weight:500` **live date** (e.g. `12 March, 2026`).
  - **Live clock JS:** update every 1s. Time = `H:MM` + lowercase meridiem, no leading zero on hour (`hours%12||12`, minutes padded to 2). Date = `D Month, YYYY` (full month name). Until first tick, show fallbacks `9:41am` / `12 March, 2026`.
  - Menu button (`onClick → open NavMenu`): `border:1px solid rgba(230,229,226,.8); background:rgba(255,255,255,.4); backdrop-filter:blur(4px); border-radius:.875rem; hover bg:rgba(255,255,255,.7)`. Inner hover-spring span (`scale 1→1.05`): `padding:.5rem 1rem; font-size:.75rem; font-weight:500; text-transform:uppercase; letter-spacing:.05em` → `[GridIcon .875rem] Menu` (the word "Menu" hidden below `sm`).

---

### 2) Hero (`#home`) — full-bleed liquid reveal

`section#home`: `position:relative; isolation:isolate; overflow:hidden; border-radius:0 0 2rem 2rem; background:#c9c9c9` (hero-to).

**A) LiquidReveal full-bleed background** (`position:absolute; inset:0; z-index:0`). This is the signature effect — reproduce its mechanics exactly:

- A positioned container holds: (1) a `<img>` of the **base** image, `object-fit:cover`, `position:absolute; inset:0; width/height:100%` — always visible, the LCP image; (2) a `<canvas aria-hidden>` `position:absolute; inset:0; width/height:100%; pointer-events:none` that paints the **revealed** image along the cursor trail.
- **Subject matter (mandatory):** the two images are a **laboratory / bench-science pair of the same scene** — e.g. a rack of unlabelled vials under cool light as the base, and the same framing under warm light as the revealed layer. Any pair works as long as both frames show the *same* subject, so the effect reads as "looking closer at one thing," not as a change in outcome. **Never a person, a body, a physique, or any pair that could read as a before-and-after transformation** — that is a results claim and is out of bounds for this category regardless of how the effect is described.
- **Image mapping (preserve exactly):** `beforeSrc` = the always-shown base image; `afterSrc` = the brush-revealed image. Keep the two on their assigned layers and do not swap them.
- **Params:** `brushRadius = 143` (CSS px), `decay = 0.016` per frame, `dpr = min(devicePixelRatio, 2)`.
- **Canvas sizing:** size the main canvas to the container rect × dpr; keep CSS size = rect size. On resize (ResizeObserver on the container) re-measure. Build an offscreen **cover** canvas at canvas resolution and draw the revealed image into it with `object-fit:cover` math (scale to fill, center). `radius = brushRadius*dpr`; a **brush** offscreen canvas is `diameter = ceil(radius*2)` square.
- **Pointer trail:** listen to `pointermove` on `window`. Convert client coords to canvas space (×dpr). Ignore points more than `radius` outside the canvas (and reset `last`). Interpolate between the last point and the new point: `step = max(radius*0.3, 1)`, `n = min(ceil(dist/step), 60)` intermediate points pushed into a `points` array.
- **Per-frame tick (rAF):**
  - If there are queued points → `idle = 0`; else increment `idle` and bail once `idle > 120`.
  - Compute `fade = drawing ? decay : min(decay + idle*0.004, 0.5)`. Apply `globalCompositeOperation:'destination-out'; fillStyle = rgba(0,0,0,fade); fillRect(full)` so the existing trail decays.
  - If drawing: for each queued point **stamp** it, then clear the queue. If idle reaches 120 frames: `clearRect(full)` (hard clear so no residue lingers).
  - **stamp(x,y):** on the brush canvas, clear, `source-over`, draw a radial gradient centered (`addColorStop 0 → rgba(255,255,255,1)`, `0.55 → rgba(255,255,255,.82)`, `1 → rgba(255,255,255,0)`), fill the square. Then `source-in`, draw the matching region of the **cover** canvas (`drawImage(cover, x-c,y-c,diam,diam, 0,0,diam,diam)`) so only the revealed-layer pixels under the soft brush remain. Finally on the main canvas `source-over`, `drawImage(brush, x-c, y-c)`.
  - Honor `prefers-reduced-motion: reduce` → skip the canvas entirely, leave only the static base image.

**B) Legibility vignette** `position:absolute; inset:0; z-index:1; pointer-events:none; background:linear-gradient(to bottom, rgba(255,255,255,.35), transparent, rgba(255,255,255,.35))`.

**C) Brand watermark** (`pointer-events:none; position:absolute; inset-inline:0; bottom:7rem; z-index:1; text-align:center; user-select:none; font-weight:700; line-height:1; font-size:13rem; color:rgba(255,255,255,.4)`) text **AEVUM**. Reveal (gated on `ready`): `opacity 0→0.4, translateY(20px→0)`, `{120,30}`, delay `300ms`.

**D) Content grid** `.shell` `position:relative; z-index:20; display:flex; flex-direction:column; gap:2rem; padding:7rem 1.25rem 5rem` (sm px 2rem; lg: `display:grid; min-height:100lvh; grid-template-columns:repeat(12,1fr); gap:2.5rem; padding:9rem 2rem 7rem`).

- **Left column** (`lg:grid-column: span 7`), `display:flex; flex-direction:column; gap:1.75rem`:
  - **Eyebrow** (reveal `opacity/translateY(10px)`, delay 200ms): a `font-size:.875rem; font-weight:500; color:rgba(17,17,17,.7); display:inline-flex; align-items:center; gap:.5rem` with a leading `0.375rem` dot (`background:rgba(17,17,17,.5); border-radius:9999px`) → **"Independent Research"**.
  - **H1** (line reveal, gated on `ready`, delay 250ms, `lineStagger 120ms`, easeOutCubic 900ms, `overflow` clip): `max-width:18ch; font-size:2.25rem; font-weight:600; line-height:.98; letter-spacing:-.02em` (sm 3rem, md 3.75rem). Lines: **"Evidence first,"** / **"protocols second,"** / **"hype never"**.
  - **Evidence row** (reveal, delay 650ms): `display:flex; align-items:center; gap:.75rem`. A `color:#b15f2c` span with **5 CircleDot** icons (`font-size:1rem`) — *not stars* — then `font-size:.875rem; font-weight:500; color:rgba(17,17,17,.7)` text **"181 compounds, every source cited"**.
  - **CTA row** (reveal, delay 750ms): `display:flex; flex-wrap:wrap; gap:.75rem`. Two pill buttons: **"Start tracking"** (variant `dark`, with arrow → opens request modal) and **"Browse compounds"** (variant `outline` → `scrollTo('library')`).
- **Right column** (`lg:span 5`), `display:flex; flex-direction:column; align-items:flex-start; gap:2rem` (lg: `align-items:flex-end`):
  - **HeroCard** (carousel) — reveal `opacity/translateY(16px) scale(.96→1)`, `{200,24}`, delay 400ms. Card: `width:100%; max-width:24rem (lg width:19rem); border-radius:1.25rem; background:rgba(255,255,255,.7); padding:.5rem; box-shadow: sm; box-shadow ring 1px rgba(230,229,226,.7); backdrop-filter:blur(12px)`. Inside a clickable row (`display:flex; gap:.5rem; cursor:pointer; border-radius:.875rem`):
    - Left tile: `aspect-ratio:1; width:6rem; display:grid; place-items:center; border-radius:.875rem; background:#0a0a0a; font-size:1.875rem; color:#fff` containing a `LogoMark` in `color:#cf8047`.
    - Right panel: `flex:1; border-radius:.875rem; background:rgba(241,240,238,.7); padding:.75rem; display:flex; flex-direction:column; justify-content:space-between`. Top = a `position:relative; min-height:3.25rem` slot showing the active item: a `font-size:.65rem; font-weight:500; uppercase; letter-spacing:.05em; color:rgba(17,17,17,.45)` **caption** over a `max-width:8rem; font-size:.875rem; font-weight:500; line-height:1.35` **title**. Items (cycle): `{caption:"Evidence grading", title:"Graded, not guessed."}`, `{caption:"Interaction checks", title:"Flagged before you stack."}`, `{caption:"Site rotation", title:"Mapped, not remembered."}`. Bottom row: three dashes on the left (`height:.25rem; border-radius:9999px`; active = `width:1rem; background:rgba(17,17,17,.7)`, inactive = `width:.375rem; background:rgba(17,17,17,.2)`, `transition:all .3s`) and prev/next buttons on the right (`size:1.75rem; display:grid; place-items:center; border-radius:9999px; background:#fff; color:rgba(17,17,17,.7); ring 1px #e6e5e2; hover color:#111`, prev = ArrowRight rotated 180°, next = ArrowRight). **Behavior:** clicking the card or Next advances; Prev goes back; wraps around `(i+step+n)%n`. Swap animation: outgoing item fades/slides `translateY(±14px)`, incoming enters from `translateY(∓14px) → 0`, `{300,28}`.
  - **Evidence sources** (reveal `translateY(14px)`, `{200,24}`, delay 550ms): `width:100%; max-width:24rem (lg 19rem)`. A label `margin-bottom:.75rem; font-size:.75rem; font-weight:500; color:rgba(17,17,17,.45); text-align:left` (lg right) reading exactly **"Evidence drawn from"**. Then a `display:grid; grid-template-columns:repeat(4,1fr); column-gap:1rem; row-gap:.75rem` list; each item is a hover-spring span (`translateY(0→-2px)`, `opacity .7→1`, `{320,20}`) `display:flex; align-items:center; gap:.375rem; font-size:.75rem; color:rgba(17,17,17,.7)` → `[CircleDot .875rem color:rgba(17,17,17,.4)] <name>`. Names: **PubMed, ClinicalTrials.gov, FDA, EMA, DailyMed, Cochrane, WHO**.
    > **Wording matters here.** These are databases the library *cites*, not partners, clients, or endorsers. The label must stay "Evidence drawn from" — never "Trusted by", "Partners", "As seen in", or anything that implies a relationship or an endorsement by a regulator. Render the names as plain text, never as official logos or wordmarks.

**E) Bottom status bar** (reveal opacity only, delay 900ms): `.shell` `display:flex; align-items:center; justify-content:space-between; gap:.75rem; border-top:1px solid rgba(17,17,17,.1); padding:1.25rem; font-size:.75rem; font-weight:500; text-transform:uppercase; letter-spacing:.025em; color:rgba(17,17,17,.6)` (sm px 2rem). Left **"Independent since 2024"**; center **"Educational use only"** (hidden below sm); right `inline-flex; gap:.5rem` **"Scroll to explore"** + a `↓`.

---

### 3) Method (`#method`)

`section#method` `background:#fff`. `.shell` `display:grid; grid-template-columns:1fr; align-items:center; gap:3rem; padding:5rem 1.25rem` (sm px 2rem; lg: `grid-template-columns:1fr 1fr; padding-block:7rem`).

- **Left — globe block** `position:relative; min-height:14rem` (lg 20rem): a big background `Globe` icon `position:absolute; left:-1rem; top:50%; transform:translateY(-50%); font-size:12rem; color:rgba(17,17,17,.1)` (sm 16rem, lg `left:-1.5rem; 20rem`). Eyebrow **"The Method"** (`position:relative`). Bottom-left a reveal block (`translateY(12px)`) `display:flex; align-items:center; gap:.75rem; font-size:.875rem; color:rgba(17,17,17,.7)` → `[Globe 1.5rem color:#111] <span max-width:14rem>` **"An independent team reading the literature, in public, with sources attached."**
- **Right — statement** `display:flex; flex-direction:column; gap:2.5rem`:
  - **H2** (word reveal, `wordStagger 35ms`, easeOutQuart 700ms, `translateY 24px`): `font-size:1.5rem; font-weight:500; line-height:1.35; letter-spacing:-.01em` (sm 1.875rem). Text: **"We map compounds, protocols, and interactions to "** then in `color:#8d8d8d`: **"what the human evidence actually supports — and we say so plainly when it supports nothing at all."**
  - **Footer row** (reveal `translateY(12px)`, delay 200ms): `display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between; gap:1.5rem; border-top:1px solid #e6e5e2; padding-top:1.5rem`. Left: a `font-size:.875rem; color:rgba(17,17,17,.45)` label **"Find us online"** above a `display:flex; gap:.5rem` row of 3 social chips (`size:2.25rem; display:grid; place-items:center; border-radius:9999px; font-size:.875rem`; each inner icon hover-springs `scale 1→1.18`, `{320,16}`): **X / Twitter** = `background:#b15f2c; color:#fff` with the X icon; **Instagram** and **LinkedIn** = `background:#f1f0ee; color:rgba(17,17,17,.7)` with a CircleDot icon. Right: a pill button **"How we grade evidence"** (variant `outline`, withArrow, href `#method`).

---

### 4) CreateBand ("Know More → Risk Less")

`section` `background:#fff`. `ul` `.shell` `display:flex; flex-direction:column; gap:.75rem; padding:2.5rem 1.25rem` (sm: `flex-direction:row; gap:1rem; px 2rem`). Four `li flex:1`, each a reveal (`translateY(28px)`, `{200,22}`, delay `index*120ms`) wrapping a hover-spring tile (`scale 1→1.03`, `{300,18}`) `display:grid; place-items:center; height:6rem; border-radius:9999px; font-size:1.875rem; font-weight:500` (sm: `height:10rem; font-size:2.25rem`). Words/variants:

1. **"Know"** — variant `light`: `background:#f1f0ee; color:#111`.
2. **"More"** — variant `accent`: `background:linear-gradient(to bottom right,#cf8047,#97501f); color:#fff`.
3. (arrow) — variant `dark`: `background:#0a0a0a; color:#fff`, content = ArrowRight icon `font-size:2.25rem` (sm 3rem).
4. **"Risk Less"** — variant `ghost`: `background:rgba(241,240,238,.6); color:rgba(17,17,17,.35)`.

> Reads as "Know More → Risk Less". Note this is a claim about *information*, not outcomes: the band promises better-informed decisions, never a health result. Do not reword it into anything that promises an effect (no "Feel Better", "Recover Faster", "Perform Longer").

---

### 5) Library (`#library`)

`section#library` `background:#fff`. `.shell` `padding:2.5rem 1.25rem 5rem` (sm px 2rem; lg pb 7rem).

- **Eyebrow** (reveal, centered): an Eyebrow with extra `border:1px solid #e6e5e2; border-radius:9999px; padding:.375rem 1rem` → **"Library"**.
- **H2** (line reveal, easeOutCubic 900ms, delay 120ms, `overflow`, centered, `width:fit-content`): `font-size:2.25rem; font-weight:600; letter-spacing:-.02em` (sm 3rem) → **"What the evidence says"**.
- **Cards** `display:grid; grid-template-columns:1fr; gap:1.5rem` (md=768px: 2 cols). Each card is a reveal `li` (`translateY(48px)`, `{180,26}`, delay `index*90ms`) wrapping a link → hover-spring `article` (`translateY(0→-8px) scale(1→1.012)`, `{260,22}`): `position:relative; min-height:22rem; overflow:hidden; border-radius:2rem; background:#0a0a0a; padding:1.5rem; color:#fff; box-shadow ring 1px rgba(255,255,255,.05)` (sm `min-height:26rem; padding:2rem`).
  - Top meta row `display:flex; justify-content:space-between; font-size:.75rem; text-transform:uppercase; letter-spacing:.025em; color:rgba(255,255,255,.45)`: left `<class> — <evidence tier>`; right a hover-spring badge **triggered by the whole card** (`rotate 0→45deg, scale 1→1.08`, `{280,18}`) `size:2.75rem; display:grid; place-items:center; border-radius:9999px; background:rgba(255,255,255,.1); color:#fff; ring 1px rgba(255,255,255,.15)` containing ArrowUpRight.
  - Centered watermark: `position:absolute; inset:0; display:grid; place-items:center; pointer-events:none` → `[LogoMark font-size:4.5rem color:rgba(255,255,255,.9)]` with a tiny `® font-size:.75rem color:rgba(255,255,255,.6)`.
  - Bottom block `position:absolute; inset-inline:1.5rem; bottom:1.5rem` (sm 2rem): `h3 font-size:1.5rem; font-weight:500; letter-spacing:-.01em` (sm 1.875rem) = compound name; `p margin-top:.5rem; max-width:28rem; font-size:.875rem; color:rgba(255,255,255,.55)` = evidence summary; then a `margin-top:1.25rem; display:flex; flex-wrap:wrap; gap:.5rem` of tag chips (`display:inline-flex; border:1px solid rgba(255,255,255,.25); color:#fff; border-radius:9999px; padding:.5rem 1rem; font-size:.875rem`).
  - **Items — these describe evidence, never effects, and carry no numbers:**
    1. **Semaglutide** — GLP-1 — Best evidenced — "Approved human dosing, a large trial base, and a well-characterised side-effect profile including a class thyroid warning." — tags: Approved, Trial data, Prescription only.
    2. **Tesamorelin** — Growth axis — Reasonable evidence — "Approved for a narrow indication, with human trial data behind it and effects on growth signalling to weigh." — tags: Approved, Narrow indication.
    3. **BPC-157** — Repair — Limited evidence — "Widely discussed, almost entirely on animal data. No established human dosing exists, so no amount can be called safe." — tags: Research only, No established dosing.
    4. **IGF-1 LR3** — Growth signal — Most uncertain — "No established human dosing, a real hypoglycaemia hazard, and growth signalling that rules it out with a cancer history." — tags: Research only, Hazard flagged.
  - **Card copy rules:** every card states what is *known* and what is *missing*. No card may contain a dose, a range, a duration, a stack suggestion, or a benefit claim. The tier words — **Best evidenced / Reasonable evidence / Limited evidence / Most uncertain** — rank how much is known, never how safe anything is; if the design shows a legend for them, it must say so in that sentence.

---

### 6) Services (`#services`)

`section#services` `background:#fff`. `.shell` `padding:5rem 1.25rem` (sm px 2rem; lg py 7rem).

- **Eyebrow** (reveal) **"What Aevum does"**.
- **H2** (line reveal, easeOutCubic 900ms, delay 120ms, overflow): `margin:1.25rem 0 3rem; max-width:16ch; font-size:2.25rem; font-weight:600; letter-spacing:-.02em` (sm `margin-bottom:3.5rem; font-size:3rem`) → **"Built to reduce exposure"**.
- **Rows** `ul`. Each row is a reveal `li` (`translateY(24px)`, `{200,24}`, delay `index*80ms`) `border-top:1px solid #e6e5e2` (first row no top border) wrapping a link → a **hover-spring row** that fills on hover: `from { background:rgba(241,240,238,0); padding-left:1.5rem; padding-right:1.5rem }` → `to { background:rgba(241,240,238,1); padding-left:2rem; padding-right:1.25rem }`, `{240,26}`; base `display:flex; align-items:center; gap:1rem; border-radius:1.25rem; padding-block:1.5rem` (sm `gap:1.5rem; padding-block:2rem`). Cells: index `width:1.75rem; font-size:.875rem; font-weight:500; color:rgba(17,17,17,.4)` (sm `width:2.5rem`); `h3 flex:1; font-size:1.5rem; font-weight:500; letter-spacing:-.01em` (sm 1.875rem, md 2.25rem) = title; a description `p` (hidden below lg) `max-width:20rem; font-size:.875rem; color:rgba(17,17,17,.55)`; a trailing badge — hover-spring **triggered by the row** (`translateX 0→5px`, `{300,18}`) `size:2.5rem; display:grid; place-items:center; border-radius:9999px; background:#0a0a0a; color:#fff` (sm `size:3rem`) with ArrowUpRight.
  - **01 Compound monographs** — "Mechanism, evidence grade, and safety file for every compound in the register."
  - **02 Protocol references** — "Reported exposure and schedules as published — never a dose we invent."
  - **03 Interaction checks** — "Warnings when what you run works against itself, or against your medication."
  - **04 Daily tracking** — "Check-ins, trends, and injection-site rotation, stored under your own account."

---

### 7) Stats (black panel, scroll count-up)

`section` `background:#fff`. `.shell` `padding:0 1.25rem 5rem` (sm px 2rem; lg pb 7rem). Inside, a reveal panel (`translateY(40px) scale(.99→1)`, `{180,26}`): `border-radius:2rem; background:#0a0a0a; padding:3rem 1.5rem; color:#fff` (sm `padding:4rem 2rem`, md `padding-inline:4rem`).

- **Eyebrow** tone `light` (`color:rgba(255,255,255,.7)`, dot `rgba(255,255,255,.6)`) **"By the numbers"**.
- **H2** (line reveal, easeOutCubic 900ms, delay 120ms, overflow): `margin-top:1rem; max-width:20ch; font-size:1.875rem; font-weight:500; letter-spacing:-.01em` (md 2.25rem) → **"Proof in the evidence, not the marketing."**
- **Grid** `margin-top:3.5rem; display:grid; grid-template-columns:repeat(2,1fr); column-gap:2rem; row-gap:3rem` (lg 4 cols). Each stat is a reveal `li` (`translateY(20px)`, `{200,24}`, delay `index*90ms`): a `font-size:3rem; font-weight:600; letter-spacing:-.02em` number (sm 3.75rem, md 4.5rem) followed by `<suffix>`, then `margin-top:.75rem; font-size:.875rem; color:rgba(255,255,255,.55)` label.
  - **Count-up:** drive each number with a scroll-progress trigger from **`start:"top bottom"` → `end:"center center"`** (progress 0 when the element's top hits viewport bottom, 1 when its center hits viewport center); display `round(progress * value)`. Throttle ~30ms.
  - Stats: **181** "Compounds catalogued" (no suffix), **43** "With protocol models" (no suffix), **14** "Injection sites mapped" (no suffix), **100%** "Sources cited".
  - **Every number here is a count of the library, never an outcome.** Do not add a stat about results, satisfaction, users helped, or anything a reader could take as evidence that the compounds work. Whoever fills this in must verify each figure against the live register before shipping.

---

### 8) Footer (black, CTA + columns + compliance + watermark)

`footer` `position:relative; overflow:hidden; border-radius:2rem 2rem 0 0; background:#0a0a0a; color:#fff`. Inner `.shell` `position:relative; z-index:10; padding:5rem 1.25rem 2.5rem` (sm px 2rem; lg pt 6rem).

- **CTA row** `display:flex; flex-direction:column; gap:2rem; border-bottom:1px solid rgba(255,255,255,.1); padding-bottom:4rem` (lg: `flex-direction:row; align-items:flex-end; justify-content:space-between`):
  - **H2** (line reveal, `lineStagger 100ms`, easeOutCubic 900ms, overflow): `max-width:16ch; font-size:2.25rem; font-weight:600; letter-spacing:-.02em` (sm 3rem, md 3.75rem) → **"Running something? Track it properly."**
  - Pill button **"Start tracking"** (variant `light`, withArrow, arrow `up-right` → opens request modal).
- **Columns** `display:grid; grid-template-columns:1fr; gap:3rem; padding-block:4rem` (md 2 cols, lg 4 cols):
  - Brand col: `[LogoMark 1.25rem] Aevum` (`font-size:1.125rem; font-weight:600`) over `max-width:20rem; font-size:.875rem; color:rgba(255,255,255,.55)` tagline **"An independent library of peptide compounds, protocols, and the human evidence behind them."**
  - **Project:** Method (#method), Sources (#sources), Journal (#journal), Contact (#contact).
  - **Library:** Compounds (#library), Protocols (#services), Interactions (#interactions), Calculator (#calculator).
  - **Social:** X / Twitter, Instagram, LinkedIn, Email.
  - Column titles: `font-size:.75rem; text-transform:uppercase; letter-spacing:.025em; color:rgba(255,255,255,.4)`. Links: `font-size:.875rem`, each an **AnimatedLink** = hover-spring span (`translateX 0→4px, opacity .65→1`, `{320,22}`).
- **Compliance notice** — *added for this category, sits between the columns and the legal bar*: `border-top:1px solid rgba(255,255,255,.1); padding-top:2rem; max-width:60ch; font-size:.75rem; line-height:1.6; color:rgba(255,255,255,.45)` reading verbatim:
  **"Educational only, and not medical advice. Most compounds described here are research chemicals that are not approved for human use, and for those no amount can be called safe. Aevum publishes reported exposure from the literature; it does not recommend doses. Dosing and treatment decisions belong with a licensed clinician."**
- **Legal bar** `display:flex; flex-direction:column; align-items:center; justify-content:space-between; gap:1rem; border-top:1px solid rgba(255,255,255,.1); padding-top:2rem; font-size:.75rem; color:rgba(255,255,255,.45)` (sm row): left **"© 2026 Aevum. All rights reserved."**; right a `gap:1.5rem` row of AnimatedLinks (`translateX 0→3px, opacity .7→1`) **Disclaimer** (#disclaimer), **Privacy** (#privacy), **Terms** (#terms).
- **Watermark** `position:absolute; inset-inline:0; bottom:-1.5rem; z-index:0; text-align:center; pointer-events:none; user-select:none; font-weight:700; line-height:1; font-size:13rem; color:rgba(255,255,255,.05)` → **AEVUM**.

---

### 9) NavMenu (full-screen overlay)

Opened by the header Menu button (and not present until opened). `position:fixed; inset:0; z-index:115; display:flex; flex-direction:column; background:#0a0a0a; color:#fff`. Open/close = fade `opacity 0↔1`, `{280,32}`. On open: `stopScroll()`, listen for `Escape` to close; on close: `startScroll()`.

- **Top bar** `.shell` `display:flex; align-items:center; justify-content:space-between; padding:1.25rem` (sm `1.5rem 2rem`): left `[LogoMark 1.25rem color:#cf8047] Aevum` (`font-size:1.125rem; font-weight:600`); right a **Close** button `display:inline-flex; gap:.5rem; border:1px solid rgba(255,255,255,.15); border-radius:.875rem; padding:.5rem 1rem; font-size:.75rem; font-weight:500; text-transform:uppercase; letter-spacing:.05em; color:rgba(255,255,255,.7); hover border:rgba(255,255,255,.4) color:#fff` → `[X .875rem] Close`.
- **Nav** `.shell` `flex:1; display:flex; flex-direction:column; justify-content:center`. `ul gap:.25rem`. Each item a full-width button (`display:flex; gap:1rem; padding-block:.5rem; text-align:left; font-size:2.25rem; font-weight:600; letter-spacing:-.02em`, sm 3.75rem) that **staggers in** on open: `transition:all .5s ease-out; transition-delay:<index*45 + 80>ms`; entered state = `translateY(0) opacity 1`, initial = `translateY(1rem) opacity 0`. Each contains a small index `0<n>` (`font-size:1rem; font-weight:400; color:rgba(255,255,255,.3)`, group-hover → `color:#cf8047`) and the label (`color:rgba(255,255,255,.7)`, group-hover → `#fff`, `transition .3s`). Items: **Home, Library, Protocols, Method, Journal, Contact** (same routing as header; Contact opens the request modal; clicking any item closes the menu first).
- **Bottom bar** `.shell` `display:flex; flex-direction:column; gap:.75rem; border-top:1px solid rgba(255,255,255,.1); padding:1.5rem 1.25rem; font-size:.75rem; text-transform:uppercase; letter-spacing:.025em; color:rgba(255,255,255,.45)` (sm row, justify-between, px 2rem): left **"Local time — <live time>"** (fallback just "Local time"); right a button **"Start tracking →"** (`color:rgba(255,255,255,.7); hover underline + #fff`) → closes menu + opens request modal.

---

### 10) RequestModal (stubbed submit)

Opened by any "Contact / Start tracking / Get early access" CTA. Backdrop: `position:fixed; inset:0; z-index:110; display:flex; align-items:flex-end; justify-content:center; padding:1rem; background:rgba(17,17,17,.3); backdrop-filter:blur(16px)` (sm `align-items:center`), `role=dialog aria-modal=true`. Click the backdrop to close; `Escape` closes; on open `stopScroll()`, on close `startScroll()`. Enter/exit: panel `opacity 0↔1` + `translateY(28px → 0 → 18px)`, `{260,30}`.

Panel: `position:relative; width:100%; max-width:32rem; overflow:hidden; border-radius:2rem; background:#fff; padding:1.5rem; box-shadow:2xl; ring 1px #e6e5e2` (sm padding 2rem). `stopPropagation` on panel click. Top-right Close button `position:absolute; right:1rem; top:1rem; size:2.25rem; display:grid; place-items:center; border-radius:9999px; background:#f1f0ee; color:rgba(17,17,17,.6); hover bg:#e3e2df color:#111` with X icon.

**Default (form) state:**

- Heading block `margin-bottom:1.5rem; gap:.375rem`: a `inline-flex; gap:.5rem; font-size:.875rem; font-weight:500; color:rgba(17,17,17,.6)` row with a `.375rem` accent dot (`background:#b15f2c`) + **"Get early access"**; then `h2 font-size:1.5rem; font-weight:600; letter-spacing:-.01em` (sm 1.875rem) → **"Tell us what you're tracking."**
- Form `display:flex; flex-direction:column; gap:1rem`. Three fields, each a `label` with a `font-size:.75rem; font-weight:500; uppercase; letter-spacing:.025em; color:rgba(17,17,17,.5)` caption above the control. Controls: `width:100%; border:1px solid #e6e5e2; background:rgba(241,240,238,.5); border-radius:.875rem; padding:.75rem 1rem; font-size:.875rem; outline:none; transition; focus → border:rgba(17,17,17,.3) background:#fff`.
  - **Name** (text, required, placeholder "Your name")
  - **Email** (email, required, placeholder "you@example.com")
  - **What you'd want answered** (textarea, 4 rows, required, `resize:none`, placeholder "What you're trying to understand, and what Aevum would need to answer it.")
- **Health-data rule for this form:** do not add fields asking for conditions, medications, symptoms, lab results, weight, or anything else that would make this a collection of personal health information. Three fields, exactly as listed. The placeholder must not invite people to describe a medical history.
- Bottom row `margin-top:.5rem; display:flex; align-items:center; justify-content:space-between; gap:1rem`: a `font-size:.75rem; color:rgba(17,17,17,.45)` note **"We reply within one business day. Never medical advice."** and a pill button **"Send request"** (variant `dark`, withArrow, arrow `up-right`, `type=submit`; while submitting label = "Sending…").
- **Submit is a no-op/stub:** prevent default, briefly show "Sending…", then switch to the **success** state (no network call).

**Success state** (centered, `padding-block:2rem; gap:1rem`): a `size:3.5rem; display:grid; place-items:center; border-radius:9999px; background:#0a0a0a; color:#cf8047; font-size:1.5rem` LogoMark badge; `h2 font-size:1.5rem; font-weight:600` **"You're on the list"**; `max-width:32ch; font-size:.875rem; color:rgba(17,17,17,.6)` **"Thanks for reaching out — we'll get back to you within one business day."**; a pill button **"Close"** (variant `dark`) that closes the modal. Reset the form ~300ms after the modal closes.

---

## Shared component recipes

**PillButton** — `inline-block`, wraps a hover-spring scale (`scale 1→1.04`, `{320,18}`, triggered by the root). Inner pill = `inline-flex; align-items:center; gap:.75rem; border-radius:9999px; font-size:.875rem; font-weight:500`. Variants: `dark` = `background:#0a0a0a; color:#fff`; `light` = `background:#f1f0ee; color:#111`; `outline` = `border:1px solid #e6e5e2; background:transparent; color:#111`. Padding: with arrow = `.375rem .375rem .375rem 1.5rem`; without arrow = `.875rem 1.75rem`. With arrow: append a `size:2.25rem; display:grid; place-items:center; border-radius:9999px; font-size:1rem` badge (dark variant badge = `background:#fff; color:#0a0a0a`; other variants = `background:#0a0a0a; color:#fff`) whose icon hover-springs (triggered by the button root): `right` arrow shifts `translate(3px,0)`, `up-right` arrow shifts `translate(2px,-2px)`, `{320,18}`. Icon = ArrowRight or ArrowUpRight per `arrow`.

**Eyebrow** — `inline-flex; align-items:center; gap:.5rem; font-size:.875rem; font-weight:500`. Leading `.375rem` round dot. `dark` tone: text `rgba(17,17,17,.7)`, dot `rgba(17,17,17,.5)`. `light` tone: text `rgba(255,255,255,.7)`, dot `rgba(255,255,255,.6)`.

**TagChip** — `inline-flex; border:1px solid; border-radius:9999px; padding:.5rem 1rem; font-size:.875rem`. `light` tone (on dark cards) = `border:rgba(255,255,255,.25); color:#fff`.

**AnimatedLink** — `inline-flex` link wrapping a hover-spring span (default `translateX 0→4px, opacity .65→1`, `{320,22}`; footer legal links override to `translateX 0→3px, opacity .7→1`).

**Hover behavior note** — all hover springs are disabled on touch/mobile (no pointer:hover). On desktop they spring to the `to` state on `mouseenter` and back to `from` on `mouseleave` (a few are triggered by a parent element rather than self — noted inline above).

---

## Assets

Supply two images of the **same laboratory scene** under different lighting and host them at a public base URL:

| Role | Layer | Requirement |
|---|---|---|
| base / LCP image | `beforeSrc` — always visible | Same subject, cool light |
| revealed image | `afterSrc` — painted on the cursor trail | Same subject and framing, warm light |

Both must be the same framing so the brush reads as a change in light, not a change in outcome. **No people, no bodies, no physiques, no before-and-after transformations.** If only one image is available, ship the static base image and skip the canvas entirely — an honest single image beats a reveal that implies a result.

---

## Fixed parameters (bake these in)

- **Colors:** `#ffffff #111111 #0a0a0a #8d8d8d #b6b6b6 #e6e5e2 #f1f0ee #e3e2df #b15f2c #cf8047 #97501f #ecebe9 #c9c9c9`. theme-color `#0a0a0a`.
- **Font:** Google **Onest**, weights 400/500/600/700. Fallback `sans-serif`.
- **Radii:** pill `9999px`, card `2rem`, card-sm `1.25rem`, control `.875rem`. Watermark font-size `13rem`. Shell max-width `88rem`.
- **Breakpoints:** sm `640px`, md `768px`, lg `1024px`; adaptive-grid base widths `1920/1440/1024/360`, scale-up base `1920`, coef `0.6666`, FONT_BASE `16`.
- **Loader:** `FILL_MS = 1300ms`, easeInOutCubic count, counter zero-padded to 3 digits, exit slide `translateY 0→-100%` `{220,30}`, content fade `{260,26}`, progress track `1px`, fill `#cf8047`.
- **LiquidReveal:** `brushRadius 143`, `decay 0.016`, dpr `min(dpr,2)`, fadeFrames `120`, idle fade ramp `+idle*0.004` capped `0.5`, brush gradient stops `1 / 0.82 / 0` at `0 / 0.55 / 1`, step `max(radius*0.3,1)`, max interp points `60`.
- **Reveal easings:** lines `easeOutCubic`≈`cubic-bezier(.215,.61,.355,1)` 900ms; words `easeOutQuart`≈`cubic-bezier(.165,.84,.44,1)` 700ms (`wordStagger 35`); hero line `lineStagger 120`, footer CTA `lineStagger 100`.
- **Entrance delays (ms after `ready`):** header 150, hero eyebrow 200, hero H1 250, hero card 400, evidence sources 550, evidence row 650, CTAs 750, status bar 900, watermark 300. CreateBand `index*120`, Library cards `index*90`, Services rows `index*80`, Stats `index*90`.
- **Spring configs (tension/friction):** header `210/26`; hovers (logo/menu/badges/pills) `320/18`; nav-item & link lifts `320/22`; social icon `320/16`; source item `320/20`; create tile `300/18`; service row fill `240/26`, service arrow `300/18`; library card `260/22` + badge `280/18`; library reveal `180/26`; create/sources/heroCard/stats-item reveal `200/24`; stats panel `180/26`; hero card carousel `300/28`; nav overlay fade `280/32`; modal `260/30`.
- **Stats count-up trigger:** `start "top bottom"`, `end "center center"`, value = `round(progress*target)`, throttle ~30ms.
- **Clock:** updates every 1s; time `H:MMam/pm` (no leading hour zero, minutes padded), date `D Month, YYYY`; fallback `9:41am` / `12 March, 2026`.
- **Copy / labels (verbatim):** brand "Aevum"; loader tagline "Evidence first. Hype never."; status chip "Local time" / time / date; nav Home/Library/Protocols/Method/Journal/Contact; hero eyebrow "Independent Research", watermark "AEVUM", heading "Evidence first," / "protocols second," / "hype never", evidence row "181 compounds, every source cited", CTAs "Start tracking" / "Browse compounds", hero card items + evidence sources + hero footer ("Independent since 2024" / "Educational use only" / "Scroll to explore") as listed; Method all copy as listed; CreateBand Know/More/→/Risk Less; Library "Library" / "What the evidence says" + 4 compounds; Services "What Aevum does" / "Built to reduce exposure" + 4 rows; Stats "By the numbers" / "Proof in the evidence, not the marketing." + 4 stats; Footer CTA "Running something? Track it properly." + "Start tracking", tagline, 3 link columns, the compliance notice verbatim, legal "© 2026 Aevum. All rights reserved." + Disclaimer/Privacy/Terms; modal "Get early access" / "Tell us what you're tracking." / fields / "We reply within one business day. Never medical advice." / "Send request" / success "You're on the list" / "Thanks for reaching out — we'll get back to you within one business day."

---

## Final check before you call it done

Search the finished file for: a number followed by `mg` or `mcg`; the words `safe`, `effective`, `proven`, `results`, `boost`, `cure`, `treat`, `transformation`; any star icon; any testimonial; any "Trusted by". Each one is either a mistake or needs the qualifying sentence that already exists in the spec. The page sells **information about evidence** — never an outcome.
