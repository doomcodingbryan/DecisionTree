// Checks the YouTube id parser + import merge. Run: node scripts/video-check.mjs
import assert from 'node:assert/strict';
import { mergedVideos, parseYouTubeId } from '../src/video.ts';

const ID = 'dQw4w9WgXcQ';
assert.equal(parseYouTubeId(`https://www.youtube.com/watch?v=${ID}`), ID);
assert.equal(parseYouTubeId(`https://youtu.be/${ID}`), ID);
assert.equal(parseYouTubeId(`https://www.youtube.com/embed/${ID}`), ID);
assert.equal(parseYouTubeId(`https://youtube.com/shorts/${ID}`), ID);
assert.equal(parseYouTubeId(`https://www.youtube.com/watch?v=${ID}&t=42s`), ID);
assert.equal(parseYouTubeId(`  ${ID}  `), ID, 'bare id, trimmed');
assert.equal(parseYouTubeId('https://example.com/not-a-video'), null);
assert.equal(parseYouTubeId('just some words'), null);
assert.equal(parseYouTubeId(''), null);

// import merge: fills gaps, never clobbers an existing pick, drops junk
const ID2 = 'abcdefghijk';
const { next, added } = mergedVideos(
  { Armbar: ID },
  { Armbar: ID2, Kimura: ID2, Guillotine: 'not-a-link' },
);
assert.equal(added, 1, 'only the new valid gap is added');
assert.equal(next.Armbar, ID, 'existing pick is never clobbered');
assert.equal(next.Kimura, ID2, 'a gap gets filled');
assert.equal(next.Guillotine, undefined, 'invalid id is skipped');
assert.equal(mergedVideos({}, {}).added, 0, 'empty merge is a no-op');

console.log('OK: parseYouTubeId parses urls, mergedVideos fills gaps safely');
