// E2E flow check: landing → plans → edit → notes → ghosts → undo/redo → reopen → reload → delete.
// Run: npm run build && npx vite preview --port 4173 & then: npx -y playwright install chromium (once), npm i --no-save playwright, node scripts/flow-check.mjs
import { chromium } from 'playwright';
import assert from 'node:assert';

const base = 'http://localhost:4173/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

// 1. fresh visit → landing page, then into the empty plans library
await page.goto(base);
await page.waitForSelector('text=Try the Sample');
await page.click('a:text-is("Start Building — Free")');
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

// 3. edit: add a node from the sidebar, count should tick up
await page.fill('input[placeholder="Search moves…"]', 'armbar');
await page.click('aside button:text-is("Armbar")');
await page.waitForSelector('text=11 nodes');

// 3b. sidebar: search the library, click a move to add it
await page.fill('input[placeholder="Search moves…"]', 'kimura');
await page.click('aside button:text-is("Kimura")');
await page.waitForSelector('text=12 nodes');

// 3c. hovering a node shows only the pick-your-own card; the AI button
// reveals the two recommendation cards, minus already-mapped children;
// an accepted move auto-labels its edge from the target's category
await page.click('.react-flow__node:has-text("Standing")'); // hovers + pans ghosts into view
await page.waitForSelector('input[placeholder="Type a move…"]');
assert.equal(
  await page.locator('button[title="Add this move"]').count(),
  0,
  'AI cards should stay hidden until the AI button is clicked',
);
await page.click('.react-flow__node:has-text("Standing") button:text-is("AI")');
await page.waitForSelector('button[title="Add this move"]');
// the pick-your-own card yields while the AI cards are up
await page.waitForSelector('input[placeholder="Type a move…"]', {
  state: 'detached',
});
assert.equal(
  await page.locator('.react-flow__node-ghost:has-text("Arm Drag")').count(),
  0,
  'already-mapped child should be filtered from suggestions',
);
// toggle AI off → hovering brings the pick-your-own card back
await page.click('.react-flow__node:has-text("Standing") button:text-is("AI")');
await page.waitForSelector('button[title="Add this move"]', {
  state: 'detached',
});
await page.click('input[placeholder="Type a move…"]');
await page.waitForSelector('text=Suggested next');
await page.click('.react-flow__node-ghost button:text-is("Ankle Pick")');
await page.waitForSelector('text=13 nodes');
await page.waitForSelector('button:text-is("takedown")'); // auto-labeled chip

// 3d. AI cards: dashed half-opacity picks for the clicked node;
// ✗ dismisses for the session, ✓ materializes the move
await page.click('.react-flow__node:has-text("Guard Pull")');
await page.click('.react-flow__node:has-text("Guard Pull") button:text-is("AI")');
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

// 3d2. pick-your-own card: toggle AI off (card yields to AI cards), then
// type a move — Enter adds it under the still-hovered parent
await page.click('.react-flow__node:has-text("Guard Pull") button:text-is("AI")');
await page.waitForSelector('button[title="Add this move"]', {
  state: 'detached',
});
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

// 3g. notes: double-click under the name, type, blur to save
await page.click('.react-flow__controls-fitview'); // earlier pans may have moved it offscreen
await page.waitForTimeout(400);
await page.dblclick('.react-flow__node:has-text("Snap Down") p');
await page.keyboard.type('Fake the snap, shoot double');
await page.click('.react-flow__pane', { position: { x: 40, y: 300 } });
await page.waitForSelector('text=Fake the snap, shoot double');

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

// 7b. folders: modal create → drag onto the folder box → folder page →
// all-flows page → modal rename → delete keeps the plan
await page.click('button:text-is("+ New Folder")');
await page.fill('input[placeholder="e.g. Guard Play"]', 'Guard Play');
await page.fill('textarea', 'Closed guard attack chains');
await page.click('button:text-is("Create")');
await page.waitForSelector('h2:has-text("Guard Play")');
await page.waitForSelector('text=0 flows');
await page.dragAndDrop(
  'li:has-text("Sample Game Plan")',
  'li:has-text("Guard Play")',
);
await page.waitForSelector('text=1 flow'); // filed into the box
await page.screenshot({ path: 'home-folders.png' });

// folder page shows its name, info, and the filed plan
await page.click('h2:has-text("Guard Play")');
await page.waitForSelector('h1:has-text("Guard Play")');
await page.waitForSelector('text=Closed guard attack chains');
await page.waitForSelector('li:has-text("Sample Game Plan")');
await page.screenshot({ path: 'folder-page.png' });
await page.click('text=← All Plans');

// all-flows page lists every plan, filed or not
await page.click('a:text-is("All Flows")');
await page.waitForSelector('h1:has-text("All Flows")');
await page.waitForSelector('li:has-text("Sample Game Plan")');
await page.click('text=← All Plans');

// rename via the edit modal
await page.hover('li:has-text("Guard Play")');
await page.click('button[title="Edit folder"]');
await page.fill('input[placeholder="e.g. Guard Play"]', 'Guard Game');
await page.click('button:text-is("Save")');
await page.waitForSelector('h2:has-text("Guard Game")');

// delete the folder — its plan returns to unfiled
page.once('dialog', (d) => d.accept());
await page.hover('li:has-text("Guard Game")');
await page.click('button[title="Delete folder"]');
await page.waitForSelector('h2:has-text("Guard Game")', { state: 'detached' });
await page.waitForSelector('li:has-text("Sample Game Plan")');

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
