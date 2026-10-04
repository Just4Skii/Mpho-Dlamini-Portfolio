/* Sticker SVG system · 1:1 port of the original landing page generator. */

const E: Record<string, string> = {
  dot: '<circle cx="36" cy="44" r="5"/><circle cx="64" cy="44" r="5"/>',
  happy: '<path class="ln" d="M28 48q8-12 16 0M56 48q8-12 16 0"/>',
  wide: '<circle cx="36" cy="44" r="10" fill="#fff"/><circle cx="64" cy="44" r="10" fill="#fff"/><circle cx="36" cy="44" r="4"/><circle cx="64" cy="44" r="4"/>',
  side: '<circle cx="36" cy="44" r="9" fill="#fff"/><circle cx="64" cy="44" r="9" fill="#fff"/><circle cx="42" cy="44" r="4"/><circle cx="70" cy="44" r="4"/>',
  zz: '<path class="ln" d="M28 46h16M56 46h16"/>',
  x: '<path class="ln" d="M29 39l14 12M43 39L29 51M57 39l14 12M71 39L57 51"/>',
};

const M: Record<string, string> = {
  grin: '<path d="M30 60q20 24 40 0z"/>',
  o: '<ellipse cx="50" cy="69" rx="8" ry="10"/>',
  frown: '<path class="ln" d="M34 73q16-16 32 0"/>',
  flat: '<path class="ln" d="M36 68h28"/>',
  smile: '<path class="ln" d="M32 60q18 18 36 0"/>',
};

const F: Record<string, [string, string, string, string?]> = {
  laugh: ['#FFD23F', 'happy', 'grin'],
  shock: ['#22E4FF', 'wide', 'o'],
  cry: ['#9B7BFF', 'dot', 'frown', '<path d="M30 54q-5 10 0 14q5-4 0-14z" fill="#22E4FF"/>'],
  side: ['#FF3D9A', 'side', 'flat'],
  angry: ['#FF8A2B', 'dot', 'frown', '<path class="ln" d="M26 32l18 6M74 32l-18 6"/>'],
  party: ['#C6FF3D', 'happy', 'smile'],
  what: ['#FFD23F', 'wide', 'flat'],
  sleepy: ['#9B7BFF', 'zz', 'o'],
  dead: ['#C6FF3D', 'x', 'flat'],
  bro: ['#22E4FF', 'side', 'frown'],
};

const I: Record<string, [string, string]> = {
  heart: ['#FF3D9A', 'M50 90C12 62 6 38 22 24c12-10 24-4 28 6 4-10 16-16 28-6 16 14 10 38-28 66z'],
  fire: ['#FF8A2B', 'M50 6c4 18 30 28 30 54 0 20-14 32-30 32S20 80 20 60c0-12 6-18 12-26 2 8 6 12 10 12-2-16 0-28 8-40z'],
  star: ['#FFD23F', 'M50 6l12 30 32 2-25 20 9 32-28-18-28 18 9-32L6 38l32-2z'],
  bolt: ['#22E4FF', 'M58 4L18 56h28l-8 40 46-58H54z'],
};

export const CAP: Record<string, string> = {
  laugh: 'Dying.',
  shock: 'No way.',
  cry: "It's over.",
  side: 'Side-eye.',
  angry: 'Not today.',
  party: "Let's go.",
  what: 'What?',
  sleepy: 'Five more minutes.',
  dead: "I'm done.",
  bro: 'bro...',
  heart: 'Aww.',
  fire: 'Fire.',
  star: 'Iconic.',
  bolt: 'Zap.',
};

export function S(n: string): string {
  let b: string;
  if (I[n]) {
    b = `<path d="${I[n][1]}" fill="${I[n][0]}"/>`;
  } else {
    const f = F[n];
    b = `<path d="M50 7C77 5 94 24 93 52 92 78 72 95 48 93 22 91 6 72 8 46 10 22 28 8 50 7z" fill="${f[0]}"/><g fill="#111">${E[f[1]]}${M[f[2]]}${f[3] || ''}</g>`;
  }
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#fff" stroke-width="7" stroke-linejoin="round" paint-order="stroke">${b}</g></svg>`;
}

export const ALL: string[] = [...Object.keys(F), ...Object.keys(I)];

export const FAQS: Array<[string, string]> = [
  ['What does the app do?', 'It takes stickers from your TikTok favorites, cache, and video posts and converts them directly into WhatsApp sticker packs with 1 tap.'],
  ['Does it support animated stickers and GIFs?', 'Yes! StickerBridge losslessly converts WebP animation frames and formats them into official WhatsApp animated sticker packs.'],
  ['How do I install the app on my phone?', 'Tap "Download APK" above, open the downloaded stickerbridge.apk file on your phone, and select Install.'],
  ['Does it work on any Android phone?', 'Yes. StickerBridge works on all Android phones (Samsung, Xiaomi, Google Pixel, Motorola, etc.) running Android 8.0 through Android 15+.'],
  ['Is it completely free?', 'Yes. StickerBridge is 100% free and open source. It is distributed directly as an APK with no store fees or paywalls.'],
];
