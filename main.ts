// gta6-meme-x-01 entry program (Node 22, standard library only).
//
// The work this entry enters with is the X post itself: one GTA 6 meme picture
// with make.fun's ghost in it, posted from a public account with make.fun and
// the entrant's play code in its text. All this program does is hand the post's
// address to the grader: it reads POST.json from the repository root (/bot in
// the grader's container), validates that it names an X post, and copies it to
// the output directory (/output there, ./out under the local stand-ins below).
//
// Outside the grader's container:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const SOURCE = join(BOT_DIR, 'POST.json');
const TARGET = join(OUTPUT_DIR, 'POST.json');

// POST.json must be a JSON object naming the entered post's address:
//   {"url": "https://x.com/<handle>/status/<id>"}
function readPostAddress(): string {
  let raw: string;
  try {
    raw = readFileSync(SOURCE, 'utf8');
  } catch (err) {
    throw new Error(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`POST.json is not valid JSON: ${(err as Error).message}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('POST.json must hold a JSON object with a "url" field');
  }
  const url = (parsed as { url?: unknown }).url;
  if (typeof url !== 'string' || !/^https:\/\/(www\.)?(x|twitter)\.com\/[^/]+\/status\/\d+\/?$/.test(url)) {
    throw new Error('POST.json "url" must be an X post address like https://x.com/<handle>/status/<id>');
  }
  return url;
}

let address: string;
try {
  address = readPostAddress();
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(SOURCE, TARGET);
} catch (err) {
  console.error(`POST.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

console.log(`entry post: ${address}`);
