// Checks the YouTube id parser. Run: node scripts/video-check.mjs
import assert from 'node:assert/strict';
import { parseYouTubeId } from '../src/video.ts';

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

console.log('OK: parseYouTubeId handles the common youtube url shapes');
