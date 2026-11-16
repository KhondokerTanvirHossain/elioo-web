# Videos

Drop Remotion exports here. The site picks them up by name; until a file exists the slot shows its placeholder.

| File | Where | Size | Budget |
|---|---|---|---|
| `hero.webm`, `hero.mp4`, `hero.jpg` | Home hero | 16:9, 1920×1080 | ≤ 4 MB per video file |
| `<slug>.webm`, `<slug>.mp4`, `<slug>.jpg` (`medioo`, `bolo`, `finioo`, `intellidrugs`) | Product card and product page | 16:10, 1728×1080 | ≤ 3 MB per video file |

Muted, loops cleanly, under 20 seconds. The `.jpg` is the poster (first frame). `npm run check` fails if a video is over budget.
