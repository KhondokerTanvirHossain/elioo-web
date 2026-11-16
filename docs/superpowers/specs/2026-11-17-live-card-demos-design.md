# Live product demos in the cards, design (short)

Date: 2026-11-17. Extends `2026-11-17-elioo-studio-redesign-design.md` (Video slots, Motion).

## Intent

The cards feel static because every product slot shows a mascot in an empty box. Each slot instead plays a short scripted demo of the product doing its job, built in HTML/CSS with that product's own tokens, type and motion rules. Visitors see what each product does, not a picture of it. Approved by the owner from the Medioo and Bolo prototype on 2026-11-17.

## Approaches

1. **Scripted HTML demos (chosen).** A few KB each, sharp at any size, real text, pause under reduced motion, and the same scripts can drive the owner's Remotion videos later.
2. Screenshots as posters. Cheaper, but static; rejected as the main answer.
3. Wait for Remotion videos. Megabytes per card and not ready yet; videos still replace a demo when a file exists in `public/video/`.

## The four demos

Each follows its product's design-system rules. All data is fictional example data, labelled as an example for screen readers.

- **Medioo:** the patient line and the THIS_WEEK banner are static from the first frame (Medioo never animates urgency). The "Medioo-র কথা" speech card types its Bangla explanation (no digits, condition or medicine names, ends "আমি ডাক্তার নই।"). Then the OUTSIDE value row rises: "HbA1c 8.4 %", the "▲ সীমার বেশি" chip, and the paper crop wiping in, labelled "কাগজে লেখা".
- **Bolo:** the three-step dusk sky, star dust, exactly two twinkling four-point stars, and the sun lowering slowly behind the hills. The Buddy caption plate appears, the violet waveform moves while "Oh nice, what was the bug doing?" types, then the mustard mic rises with "Your turn".
- **Finioo:** a light card in Finioo's tokens. The hero figure "Runway 7.2 mo" rolls its digits up to "8.4 mo" (Finioo's digit-roll rule), then a change card appears: "Done. 2 changes. Runway 7.2 → 8.4 mo" with **Undo**. The fox's glasses do their "glance" state. Ember appears once, as the change card's Apply fill.
- **IntelliDrugs:** the interaction checker, with the live product's real output for a common Bangladeshi pair (checked on drugdb.eliooo.org, 2026-11-17). "Napa" types into the search and is added (Napa · Acetaminophen 500 mg tablet), then "Warfarin" (G Warfarin · Warfarin 5 mg tablet), each with its "Not yet reviewed by a pharmacist" pill. The summary line appears ("2 medicines · 1 of 1 pair checked · 1 with an interaction listed"), then the result card: the ◆ Moderate severity chip, "Napa + G Warfarin", "From DDInter 2.0", "Acetaminophen + Warfarin. Action: synergy", and the management text truncated as the product shows it ("…caution is recommended during concomitant therapy… Closer monitoring of INR may be advisable."). Cobalt is the only accent; severity colours are the product's own.

## Behaviour

- Starts when 40% of the slot is in view; replays every 14 s while visible; stops when off screen.
- Typing works on grapheme clusters, so Bangla conjuncts never break; a newer run cancels an older one.
- Reduced motion, or no JavaScript: the finished final frame is shown, still.
- A video in `public/video/<slug>.*` replaces the demo for that product.
- Demos are decorative for assistive technology (`aria-hidden`), with one visually hidden sentence describing what the demo shows.
- Mascots stay still, except Finioo's glasses state, which its design system defines.

## Out of scope

Real per-card usage numbers (separate change; needs real figures), the stack-under-nav fix, film grain.
