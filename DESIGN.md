# Suds & Snouts: design system

## The idea
The Snout Shot studio. Every dog that leaves the salon is photographed on a pink backdrop and the photo is texted to the owner. The site's first screen *is* that backdrop: the name set as a monument in two inks, with a freshly groomed dog (a real cut-out photo, not a drawing) standing on the floor of the sweep. The pink returns once more at the end as the footer, with the name across it.

## Colour
| Role | Value | Use |
| --- | --- | --- |
| Ground | `#f6f2f3` | Page background (bone, tinted toward the backdrop) |
| Tone | `#ece4e7` | One step from the ground: alternate sections, open FAQ rows, picker pills |
| Ink | `#2a1840` | All running text, dark buttons, contact section field |
| Soft ink | `#4a3a5c` | Secondary notes only |
| Pink | `#ff4f93` | The backdrop field, the footer, the one accent (primary action, price block) |
| Pink floor | `#ff6aa4` | The floor of the backdrop sweep (a flat step, never a gradient) |
| Pink ink | `#b0124f` | Inline links on the ground |
| Teal | `#13b5c8` | The Quiet Hour field and Quiet Hour markers only |

No gradients, no glows, no shadows on things at rest (only the mobile booking bar, a real overlay, casts one).

## Type
Fredoka (display) and Nunito (text), self-hosted. Five steps:
- XL monument: `clamp(96px, 15.5vw, 236px)`, weight 700, leading 0.84, tracking -0.045em. Name only.
- L statement: `clamp(40px, 6.6vw, 104px)`: the live price sentence, FAQ heading, the email.
- M heading: `clamp(26px, 2.5vw, 36px)` (23px on phones): section headings, FAQ questions.
- Body: 17px (16px on phones), leading 1.55, full ink.
- Small: 14px: captions, notes, form hints.
Headings never run past two lines at any width. No eyebrow labels, no uppercase tracked labels, no index numbers.

## Shape
- Photographs: square corners, real photos only.
- Buttons: one shape, pill, flat fill (pink with ink text, or ink with white text). Hover lifts 2px, press scales to 0.97.
- Tiles inside the booking interface: 18 to 28px radius, separated by fill, never by outlines. Form fields keep a 2px border.
- No 1px outlined boxes and no divider rules outside the price table.

## Layout
One 12-column grid, equal outer margins (`clamp(16px, 2.8vw, 40px)`), sections 96 to 184px apart. Each section has its own composition: narrow column plus photo (intro), one-size name index with a description panel (grooms), statement sentence (prices), photographs down a diagonal (visit), colour field (Quiet Hour), a row of small frames (Snout Shots), app-style form (booking), wide heading with indented questions (FAQ), the email as display type (contact).

## Motion
- Signature: on load, each line of the name rises from behind its own baseline (1000ms, second line +110ms); the dog rises and settles; the supporting line fades up.
- Each section's parts enter in order (heading, text, pictures), 70ms apart, rising 24px, once.
- The Quiet Hour photo drifts slowly (16s scale to 1.07).
- Everything respects `prefers-reduced-motion`; content is visible without JavaScript.

## Interaction
- Price sentence: pick a size and a groom and the sentence states the real price; "Book this groom" carries both choices into the booking form.
- Grooms index: hover (desktop) or tap (phone) a name to read its details.
- Booking: live estimate, Quiet Hour slots marked in teal, validation, confirmation screen.

## Known, intentional exceptions
- No video: no honest clip of the salon's world exists yet. Add a short muted loop of a real groom when one is filmed.
- The booking summary stays pinned beside the form on desktop because it updates as the visitor fills it in.
- The booking interface (date and time pickers, add-ons, summary) is marked `data-ui`: it follows app conventions, not page rules.
