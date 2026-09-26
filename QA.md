# Verification report

Date: September 26, 2026

## Passed

### Rules: 8 automated Node.js tests

- 36 unique question IDs; 12 questions per difficulty; four unique options and one valid correct-answer index per question.
- Five different, difficulty-matched questions in each generated stage.
- Oversized movement and lane changes cannot bypass a checkpoint.
- Wrong answers block travel. Repeated correct-answer clicks cannot increase the score twice.
- Riding backward over a cleared station does not repeat its question.
- All five answers plus riding to the finish are required to complete a stage.
- First, second, and later attempt scoring; star thresholds.
- Pause, wrong-attempt persistence, feedback-state restoration, and rejection of invalid saves.

### Browser integration: Chromium 153 / Playwright

- Complete desktop playthrough at 1440 × 1000.
- WASD movement, arrow-key movement, lane movement, automatic stop, pause/resume, and returning home.
- Wrong-answer hint, correction, rapid repeat-click protection.
- Reload after an answer, resume with the correct option locked, and continue without adding points again.
- A run with one second-try answer and four first-try answers ended with **460 points**, **4 / 5 first-try answers**, and **3 stars**.
- Horse choice, mute preference, and personal best survive reload.
- Mobile emulation at 390 × 844 with actual CDP touch start/end events on the direction button.
- Opening a question releases the held touch control, preventing unintended movement after answering.
- Page, modal, and answer-option overflow checks at widths of 320, 390, and 768 pixels.
- Advanced sentence options wrap inside the dialog.
- The site loads under `/english-horse-adventure/`, matching a repository subpath.
- No browser JavaScript errors or failed HTTP asset responses in the full integration run.
- Desktop home/game/question/results and mobile home/game/question screenshots inspected. Mobile hero spacing and HUD layout were refined after inspection, then checked again at 320, 390, and 768 pixels.

## Limits and deployment status

- Mobile coverage is browser emulation, not a physical iPhone/Android device test.
- Device speech output was not acoustically verified. The game uses the browser's English voice; availability varies by OS/browser.
- This repository was created under Httxi991. GitHub Pages deployment verification is recorded separately from the local QA above.
- The workflow in `docs/pages-workflow.example.yml` is optional and inactive; branch publishing is the chosen deployment method.

Run `node --test tests/engine.test.cjs` to reproduce the rules checks. See README for browser test setup.
