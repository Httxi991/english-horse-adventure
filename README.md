# English Horse Adventure

A complete, responsive English-learning horse game made with HTML, CSS, and vanilla JavaScript. All menus, questions, hints, instructions, and results are in English. No application server, API keys, build step, external fonts, or runtime libraries are needed.

## Play locally

1. Download and extract the project.
2. Open `index.html` in a modern browser.
3. Choose your horse and difficulty, then select **Play**.

For consistent local saving and browser testing, serve the folder as static files (Python is optional):

```sh
cd english-horse-adventure
python -m http.server 8080
```

Open `http://localhost:8080`. This is only a local static-file server, not a game backend. Storage behavior under `file://` varies between browsers; an HTTP origin is recommended for reliable saved progress.

## Controls

| Action | Desktop | Phone / tablet |
| --- | --- | --- |
| Ride forward | Right arrow or D | Hold right arrow |
| Ride backward | Left arrow or A | Hold left arrow |
| Move across the trail | Up/down arrows or W/S | Hold up/down arrows |
| Pause | Pause button or Escape | Pause button |
| Hear pronunciation | Listen in a question | Tap Listen |

Choose from Maple, Cloud, Midnight, and Honey. They have identical movement and scoring rules.

## Game rules

- Each stage randomly selects **five distinct questions** from the selected level.
- **Beginner, Intermediate, Advanced** each contain 12 questions: **36 total**.
- Content covers vocabulary, colors, numbers, animals, grammar, and sentence formation. Advanced questions focus on more complex language.
- The horse automatically stops at each of the five checkpoints. A checkpoint barrier spans every lane, and even a large movement step is clamped to the next checkpoint.
- Wrong answers show **Try again!** and a simple hint. There is no attempt limit or game-over penalty. An incorrect option is disabled for the current question view.
- Correct answers show **Well done!**. The player must press **Continue Riding** to proceed. Repeated clicks cannot award more points.
- A cleared checkpoint does not ask its question again, even if the player rides backward.
- All five checkpoints must be cleared before the finish can be reached.
- Earn **100 points** on the first try, **60** on the second, and **40** on any later try. Maximum score: **500**.
- Stars depend on first-try answers: **3 stars** for 4–5, **2 stars** for 2–3, **1 star** for 0–1. Completing the trail always earns at least one star.
- Play Again creates a fresh random stage. Questions can recur across separate stages, but never inside one stage.

## Saved progress and accessibility

Progress, the current five question IDs, attempts, score, checkpoint state, difficulty, chosen horse, personal bests, sound preference, and motion preference are stored locally under `english-horse-adventure-v1`.

**Continue Adventure** resumes the saved trail. Refreshing during a question or after a correct answer preserves its state. Play asks before replacing an unfinished trail. Pausing, leaving the tab, or losing window focus clears held movement controls. Invalid saved game records are discarded safely. If browser storage is blocked, the game remains playable and reports the limitation.

The game uses native focus-trapped dialogs, labeled controls, keyboard focus indicators, live feedback, responsive wrapping, and a reduced-animation option. It respects the system's reduced-motion preference initially. The canvas includes a descriptive label; it is a visual movement game rather than a fully nonvisual game.

Pronunciation uses the browser's built-in **SpeechSynthesis** API with an English voice. Before answering, Listen reads the question; after answering, it reads the example or word. Voices and offline availability depend on the browser and device. Missing speech support produces a message without blocking play. Mute disables pronunciation and synthesized feedback tones. The game itself sends no questions or progress to an application server and contains no analytics.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Start screen, game screen, shared dialog |
| `css/style.css` | Responsive layout, mobile controls, readable options |
| `js/questions.js` | Editable 36-question bank |
| `js/engine.js` | Movement barriers, answer validation, scoring, save validation |
| `js/game.js` | Canvas renderer, animated horse, input, UI, speech, persistence |
| `assets/meadow.png` | Original generated meadow illustration |
| `assets/favicon.svg` | Simple game favicon |
| `tests/engine.test.cjs` | Dependency-free rule and persistence tests |
| `tests/browser.test.cjs` | Desktop/mobile browser integration tests (Playwright required) |
| `docs/pages-workflow.example.yml` | Optional Actions workflow example (not active) |
| `ASSETS.md` | Artwork and sound provenance |
| `QA.md` | Verification performed and limits |

## Add new questions

Append an object to `window.QUESTION_BANK` in `js/questions.js`:

```js
{
  id: 'b13', // unique across the whole bank
  level: 'Beginner', // Beginner, Intermediate, or Advanced
  category: 'Vocabulary',
  prompt: 'Which word is the opposite of “hot”?',
  options: ['Cold', 'Tall', 'Quick', 'Loud'],
  answer: 0, // zero-based index: 0 means the first option
  hint: 'Think of ice and snow.',
  speak: 'Hot. Cold.'
}
```

Provide exactly four distinct options and one unambiguous correct answer. Keep all text in English. Keep at least five questions per level. Preserve existing IDs so saved stages can be restored. The renderer expects trusted, locally authored content; do not load untrusted HTML into the bank. Update the bank-size assertions in the test if you expand it.

## Tests

Rules (Node.js 18+; no npm installation needed):

```sh
node --test tests/engine.test.cjs
```

Optional browser integration tests:

```sh
npm install --no-save playwright
npx playwright install chromium
# Start a static server from the parent folder on port 8080 in a separate terminal.
node tests/browser.test.cjs
```

`GAME_URL` can override the test URL, which defaults to `http://127.0.0.1:8080/english-horse-adventure/`.

## Publish to GitHub Pages

The repository uses GitHub Pages branch publishing from **main / (root)**.

1. Push the static files to the `main` branch, keeping `index.html` at the root.
2. In **Settings → Pages → Build and deployment**, select **Deploy from a branch**.
3. Select **main** and **/ (root)**, then save.
4. Wait for the Pages deployment to finish, then open **Visit site**.

The root `.nojekyll` file disables Jekyll processing. All runtime paths are relative, supporting `/english-horse-adventure/` without special configuration.

An optional Actions workflow example is provided in `docs/pages-workflow.example.yml`. To use it instead of branch publishing, move it to `.github/workflows/pages.yml` and select **GitHub Actions** as the Pages source. Use only one deployment method.

## References

- [GitHub: Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [MDN: SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

## License

Project code and original bundled assets are supplied under the MIT license. See `LICENSE` and `ASSETS.md`.
