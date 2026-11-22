// Round 3 — "VICE CITY AIRLINES boarding pass" (Node 22, standard library only).
// This entry's meme is a fake boarding pass: LOS SANTOS, departed 17 Sep 2013,
// to VICE CITY, arriving 19 Nov 2026, stamped "4,811 DAYS LATE". The passenger
// is "ONE VERY PATIENT GAMER"; the pink stub carries the make.fun ghost and the
// line "PAID BY MY AI AGENT with a bounty payout it won on make.fun". The joke
// is the thirteen-year wait turned into travel paperwork — a flight booked in
// 2013 that only boards today, paid for with real money the agent won.
//
// The program hands the gate two things: POST.json (the X post's address) and
// meme.png (the boarding-pass picture), both copied from the repository root
// to /output, where the gate reads them. The entry is the post itself: the
// meme was posted on X from a public account with make.fun written out and/or
// a tag of @makefunai and the play code in its text, POST.json names the post,
// and the house reads the post from X (its first picture and its text) and
// hands that to the judge. Nothing this program writes about the post is judged.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate only accepts a real X post, so check the post reference before
// anything is copied: POST.json must exist, parse as JSON, and name a live
// post URL — an https address on x.com with a numeric status id in the path.
const postPath = join(BOT_DIR, 'POST.json');
let postJson: unknown;
try {
  postJson = JSON.parse(readFileSync(postPath, 'utf8'));
} catch (err) {
  console.error(`POST.json could not be read or parsed at ${postPath}: ${(err as Error).message}`);
  process.exit(1);
}
const postUrl = (postJson as { url?: unknown } | null)?.url;
if (typeof postUrl !== 'string' || !/^https:\/\/x\.com\/[^/]+\/status\/\d+/.test(postUrl)) {
  console.error(
    `POST.json must carry a valid post URL (https://x.com/<account>/status/<id>), got: ${JSON.stringify(postUrl)}`,
  );
  process.exit(1);
}
console.log(`Submitting GTA 6 meme post: ${postUrl}`);

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// Read both copies back and compare their bytes, so a truncated or mangled
// write is caught here instead of silently reaching the gate.
const sourceBytes = readFileSync(join(BOT_DIR, 'POST.json'));
const copiedBytes = readFileSync(join(OUTPUT_DIR, 'POST.json'));
if (!sourceBytes.equals(copiedBytes)) {
  console.error(
    `Copied POST.json does not match the source (${copiedBytes.length} bytes written, ${sourceBytes.length} expected)`,
  );
  process.exit(1);
}
console.log(`Verified /output/POST.json matches POST.json (${copiedBytes.length} bytes)`);

// The meme is the boarding pass itself, so hand the gate the picture too:
// copy meme.png to /output and prove the copy is byte-identical. First check
// it is really a PNG (magic bytes 89 50 4E 47 0D 0A 1A 0A) and not a truncated
// or misnamed file, so a bad image is caught here instead of reaching the gate.
const memePath = join(BOT_DIR, 'meme.png');
let memeBytes: Buffer;
try {
  memeBytes = readFileSync(memePath);
} catch (err) {
  console.error(`meme.png could not be read at ${memePath}: ${(err as Error).message}`);
  process.exit(1);
}
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (memeBytes.length < PNG_MAGIC.length || !memeBytes.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC)) {
  console.error(`meme.png is not a valid PNG (first bytes ${memeBytes.subarray(0, 8).toString('hex')})`);
  process.exit(1);
}
try {
  copyFileSync(memePath, join(OUTPUT_DIR, 'meme.png'));
} catch (err) {
  console.error(`meme.png could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
const copiedMeme = readFileSync(join(OUTPUT_DIR, 'meme.png'));
if (!memeBytes.equals(copiedMeme)) {
  console.error(
    `Copied meme.png does not match the source (${copiedMeme.length} bytes written, ${memeBytes.length} expected)`,
  );
  process.exit(1);
}
console.log(`Verified /output/meme.png matches meme.png (${copiedMeme.length} bytes, boarding pass)`);
