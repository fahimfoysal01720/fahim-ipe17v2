# Portfolio upgrade — PDF reader fix + UX polish

Everything here replaces your old `index.html`, `styles.css` and `script.js`.
Folder names your links depend on (`pdfd/`, `pdfp/`, `pdfm/`, `pdft/`, `pdcn/`, `pdfc/`,
`Fahim Foysal Web cv/`, `Website/`, `1.png`, `whatsapp.jpg`) are unchanged, so you can drop
this in place of the current site and nothing else breaks.

---

## 1. Why the PDFs never showed up

The old project cards opened a **separate page** (`pdfd/index.html`, `pdfp/index.html`, …)
in a new tab. That pattern fails in a lot of real situations:

| What went wrong | Effect |
| --- | --- |
| The `pdfX/index.html` pages pointed at PDF files that were not at that path | blank page / 404 |
| Some of those pages embedded the PDF through Google Drive or an `<iframe>` that the host blocks | grey or empty frame |
| Browsers with *"Download PDF files instead of automatically opening them"* enabled | iframe stays empty |
| Phones (especially iOS) refuse to render a PDF inside a frame | empty box, no way to download |
| A new tab lost the visitor's place in the portfolio | high drop-off |

## 2. What the new reader does instead

Clicking **View documentation** now opens an in-page reader (no new tab, no page reload)
with a real PDF rendering engine bundled locally in `vendor/pdfjs/`:

* **Tier 1 — built-in renderer.** PDF.js draws every page as an image, so it works even when
  the browser's own PDF plugin is disabled, in iframes, and on iOS/Android. Includes zoom
  (50–300 %), fit-to-width, page jumping, scroll tracking and lazy page loading.
* **Tier 2 — browser fallback.** If PDF.js cannot load (very old browser, or a PDF that no
  longer exists), the reader hands the file to the browser's viewer instead.
* **Tier 3 — summary sheet.** If the file is genuinely missing, the reader shows a styled
  summary of the document (abstract, contents, topics) plus **Open PDF**, **Download** and
  **Original page** buttons — so a visitor never hits a dead end.

Finding the file is automatic. For each document the reader tries, in order:

1. a path you pinned yourself (see below),
2. `pdfX/documentation.pdf`,
3. the old `pdfX/index.html` page — any PDF link, Drive file or iframe inside it is followed,
4. `pdfX/Project Documentation.pdf`, `pdfX/<name>.pdf`.

**Download** uses a blob download (with a progress percentage in the button) and falls back
to opening the file in a tab if the browser blocks direct saving.

**Pin any file in 10 seconds:** if a document still says *"The PDF file was not found"*, the
reader shows a small field — paste the real path (e.g. `pdfd/Final Report.pdf` or a full
`https://` link) and press **Load**. It is remembered in that browser per document, so you
can verify a path without touching code. (Handy for checking your live site right now.)

## 3. Where to put the real PDFs

Simplest and recommended: one PDF per project folder, always named `documentation.pdf`.

```
pdfd/documentation.pdf     Pedal Powered Washing Machine
pdfp/documentation.pdf     Automatic Fan Control
pdfm/documentation.pdf     Nirr: E-Accommodation (MIS)
pdft/documentation.pdf     Undergraduate thesis
pdcn/documentation.pdf     Distribution network — additional documentation
pdfc/documentation.pdf     Covid-19 and FMCG stocks
```

Your download file names are set in `script.js` → `DOCS` (`fileName:`), so visitors get
readable names such as `Undergraduate-Thesis-Documentation.pdf`.
Every document also has a shareable deep link: `index.html#doc=thesis`.

> **The six PDFs currently in those folders are demo documents** generated for testing.
> Replace them with your real reports — same path, any content.

## 4. Run it locally

```bash
cd <this folder>
python3 -m http.server 8000     # or: npx serve .
# open http://localhost:8000
```

Opening `index.html` directly from disk (`file://`) disables the JS renderer (browsers block
module loading from disk) and the reader uses the fallback — always use a local server when
testing.

## 5. Deploy

Copy everything **inside** this folder to your repo root (keep the folder structure), commit,
push. Works unchanged on GitHub Pages, Netlify, Vercel or any static host.

## 6. Everything else that is new

**Reader / documents**
- Modal reader with blur backdrop, header (title, category, page count, size, path),
  prev/next document browsing, expand-to-fullscreen, copy-link button, `Esc` to close,
  `←`/`→` to browse, `PageUp`/`PageDown` or `j`/`k` to scroll, `+`/`-` to zoom.
- Swipe-down-to-close drawer on phones, safe-area padding, single-row compact toolbar.
- Loading skeleton, 404 handling, timeout notices, toasts for every success/failure.

**Interaction & feedback**
- Sticky nav with a sliding active pill, scroll-spy, reading-progress bar, circular
  scroll-to-top ring, ripple on buttons, cursor-following glow, 3D card tilt + spotlight.
- Project filter chips now show live counts; instant search over titles and skills
  (`/` focuses it); empty state that resets the filters.
- Contact form validates inline (name / email / message), shows a sending state, then opens
  the visitor's mail app with the message pre-filled — plus a **Copy email** button on the CV
  card.
- Deep links (`#doc=…`), theme memory, toast queue, keyboard focus trapping in the reader.

**Visuals**
- Custom SVG icon set — the Font Awesome + D3 CDN dependencies are gone (nothing to fail offline).
- Redrawn Lean tree (animated branch draw, hover focus) and Ishikawa diagram (tap a category
  to reveal real causes).
- Six Sigma belts rebuilt as a list that fits any screen; animated supply-chain flow.
- Light/dark theme rebuilt with proper contrast, animated sun/moon toggle, no flash on load.
- Hero: canvas supply-chain network with pointer parallax, gradient headline, floating chips.
- `prefers-reduced-motion` fully respected; skip-link, ARIA labels and keyboard paths everywhere.

**Files**
```
index.html            structure + inline SVG icon sprite (no CDN needed)
styles.css            design system, components, reader, responsive
script.js             interactions + document reader (DOCS table at the top of section 9)
vendor/pdfjs/         bundled renderer (pdf.min.mjs, pdf.worker.min.mjs)
tools/make_demo_pdfs.py   regenerates the six demo PDFs
pdfd/ pdfp/ pdfm/ pdft/ pdcn/ pdfc/   one folder per document
```

---

## 7. Contact form — visitors send you mail with only a name

**Yes, it works without the visitor entering an email.** A static HTML page cannot send email by
itself, so the form posts to a free relay that emails you. Nothing for the visitor to install:
they type **name + message**, press send, and it lands in your Gmail.

The form currently uses **FormSubmit** (free, no account needed):

```
endpoint: https://formsubmit.co/ajax/fahim.ruet.ipe17@gmail.com
```

### One-time activation (do this once, ~20 seconds)

1. Deploy the site (or open it locally through a server).
2. Send yourself one test message through the form.
3. Check **fahim.ruet.ipe17@gmail.com** — FormSubmit sends a *“Confirm your email”* mail.
   Click the link inside it.
4. From then on every message is delivered automatically. The visitor sees a green
   **“Message sent”** card.

Until you do step 3, the form shows an honest notice (“One activation step left”) and offers
**Open mail app / Copy message** so nothing is lost.

### What the visitor sees

| Field | Requirement |
| --- | --- |
| Your name | required (2+ characters) |
| Email | **optional** — labelled “Only if you want a reply” |
| Message | required (8–3000 characters, live counter) |

* If they leave email empty, the message still reaches you and is marked `(not provided)`.
* If they add an email, it is set as **reply-to**, so you just hit *Reply* in Gmail.
* Their message is auto-saved as a draft in their browser — a refresh or closed tab does not
  lose it.
* A honeypot field silently drops bot spam; `_captcha: false` keeps it friction-free.
* If the internet drops or the relay rejects the message, they get a warning with three
  buttons — **Open mail app**, **Copy message**, **Try again** — so a message is never lost.

### Switching providers (optional)

Everything sits in one place in `script.js`:

```js
const CONTACT = {
  endpoint: 'https://formsubmit.co/ajax/fahim.ruet.ipe17@gmail.com',
  accessKey: '',                 /* Web3Forms only */
  inbox: 'fahim.ruet.ipe17@gmail.com'
};
```

| Provider | endpoint | Notes |
| --- | --- | --- |
| FormSubmit | `https://formsubmit.co/ajax/YOUR@MAIL` | default; one confirmation click, unlimited, free |
| Formspree | `https://formspree.io/f/YOUR_ID` | free 50/month, dashboard, email verification |
| Web3Forms | `https://api.web3forms.com/submit` | free 250/month; put the key in `accessKey` |
| Google Apps Script | your deployed `/exec` URL | your own script + Gmail, no third party |

The code detects the provider from the URL and builds the right payload automatically; success,
failure and activation handling are identical for all of them. Setting `endpoint: ''` makes the
form skip the network and go straight to the mail-app fallback.

### Anti-spam tips

* FormSubmit filters known spam bots and hides your address from scrapers.
* The honeypot field (`_honey`) catches the rest without annoying real visitors.
* If spam ever gets through, flip `_captcha: 'true'` in `buildBody()` — no other change needed.

---

## 8. Adding a new document later

In `script.js`, add an entry to `DOCS` (copy an existing one) and list it in `DOC_ORDER`,
then add a card in `index.html` with `data-doc="<your-id>"` on the button. The reader picks
up the title, page count, download name and deep link automatically.

---
