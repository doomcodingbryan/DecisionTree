// E2E flow check: home → create → edit → undo/redo → back → reopen → reload → delete.
// Run: npm run build && npx vite preview --port 4173 & then: npx -y playwright install chromium (once), npm i --no-save playwright, node scripts/flow-check.mjs
import { chromium } from 'playwright';
import assert from 'node:assert';

const base = 'http://localhost:4173/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

// 1. fresh visit → home empty state
await page.goto(base);
await page.waitForSelector('text=No Plans Yet');
await page.screenshot({ path: 'home-empty.png' });

// 2. create from sample → canvas with the tree open
await page.click('text=Start from Sample');
await page.waitForSelector('.react-flow__node:has-text("Standing")');

// 2b. library categories are collapsed by default; expanding one reveals moves
assert.equal(await page.isVisible('aside button:text-is("Kimura")'), false);
await page.click('aside summary:has-text("Submissions")');
await page.waitForSelector('aside button:text-is("Kimura")');
await page.click('aside summary:has-text("Submissions")'); // re-collapse
assert.match(page.url(), /#\/t\/.+/, 'route should be #/t/<id>');
await page.waitForSelector('text=Sample Game Plan');

// 3. edit: add a node via toolbar, count should tick up
await page.click('button:text-is("Add")');
await page.waitForSelector('text=11 nodes');

// 3b. sidebar: search the library, click a move to add it
await page.fill('input[placeholder="Search moves…"]', 'kimura');
await page.click('aside button:text-is("Kimura")');
await page.waitForSelector('text=12 nodes');

// 3c. node popover: already-mapped children are not re-suggested, and an
// accepted suggestion auto-labels its edge from the target's category
await page.hover('.react-flow__node:has-text("Standing")');
await page.click('.react-flow__node button[title="Add connected move"]');
await page.waitForSelector('text=Suggested next');
assert.equal(
  await page.locator('.react-flow__node button:text-is("Arm Drag")').count(),
  0,
  'already-mapped child should be filtered from suggestions',
);
await page.click('.react-flow__node button:text-is("Double Leg")');
await page.waitForSelector('text=13 nodes');
await page.waitForSelector('button:text-is("takedown")'); // auto-labeled chip

// 3d. ghost suggestions: selecting a node shows dashed half-opacity picks;
// ✗ dismisses for the session, ✓ materializes the move
await page.click('.react-flow__node:has-text("Guard Pull")');
await page.waitForSelector('.react-flow__node:has-text("Open Guard")'); // ghost
await page
  .locator('.react-flow__node:has-text("Butterfly Guard") button[title="Dismiss suggestion"]')
  .click();
assert.equal(
  await page.locator('.react-flow__node:has-text("Butterfly Guard")').count(),
  0,
  'dismissed ghost should disappear',
);
await page
  .locator('.react-flow__node:has-text("Open Guard") button[title="Add this move"]')
  .click();
await page.waitForSelector('text=14 nodes'); // ghost became a real move

// 3d2. the third ghost is a pick-your-own card: type a move, Enter adds it
// (parent stays selected after the previous accept, so the card is visible)
await page.fill('input[placeholder="Type a move…"]', 'Mount');
await page.keyboard.press('Enter');
await page.waitForSelector('text=15 nodes');
// blur the input (undo shortcut defers to fields), then undo to keep counts stable
await page.click('.react-flow__pane', { position: { x: 40, y: 500 } });
await page.keyboard.press('ControlOrMeta+z');
await page.waitForSelector('text=14 nodes');

// 3e. undo via keyboard, redo via toolbar button
await page.keyboard.press('ControlOrMeta+z');
await page.waitForSelector('text=13 nodes');
await page.click('button:text-is("Redo")');
await page.waitForSelector('text=14 nodes');

// 3f. deleting a node cascades to its edges but undoes as ONE step
await page.click('.react-flow__node:has-text("Open Guard")');
await page.keyboard.press('Backspace');
await page.waitForSelector('text=13 nodes');
await page.keyboard.press('ControlOrMeta+z');
await page.waitForSelector('text=14 nodes');
await page.waitForSelector('text=11 links');

// 4. back to home → card with name, counts, updated date
await page.click('text=← All Plans');
await page.waitForSelector('text=Sample Game Plan');
await page.waitForSelector('text=14 moves · 11 links');
await page.screenshot({ path: 'home-list.png' });

// 5. reopen from card → edits persisted
await page.click('text=Sample Game Plan');
await page.waitForSelector('text=14 nodes');

// 6. survives reload (localStorage)
await page.reload();
await page.waitForSelector('text=14 nodes');

// 7. unknown tree id → redirected home
await page.goto(base + '#/t/nope');
await page.waitForSelector('text=Your Game Plans');

// 8. rename + delete from home
await page.hover('li:has-text("Sample Game Plan")');
await page.click('button[title="Rename"]');
await page.fill('li input', 'A-Game');
await page.keyboard.press('Enter');
await page.waitForSelector('text=A-Game');
page.on('dialog', (d) => d.accept());
await page.hover('li:has-text("A-Game")');
await page.click('button[title="Delete"]');
await page.waitForSelector('text=No Plans Yet');

await browser.close();
console.log('ALL CHECKS PASSED');
