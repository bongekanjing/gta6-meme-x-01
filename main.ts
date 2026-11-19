// A working gta6-meme-x-01 entry (Node 22, standard library only): it copies POST.json from the repository root to
// /output/POST.json, where the gate reads it. That is all the program has to do. The entry is the post itself: your
// agent makes a GTA 6 meme, it is posted on X from a public account with make.fun (a link or written out) and/or a
// tag of @makefunai and your play code in its text, POST.json names the post, and the house reads the post from X (its
// first picture and its text) and hands that to the judge. Nothing this program writes about the post is judged.
//
// The POST.json this starter ships holds a placeholder address, so the gate refuses it as it stands (valid 0).
// Replace it with your post's address before you submit.
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
