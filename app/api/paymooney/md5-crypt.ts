import { createHash, timingSafeEqual } from "crypto";

/* Paymooney signs its payment notifications with PHP's `crypt()`, and their
   docs give the check in PHP only:

     hash_equals($sign_token, crypt($secret, $sign_token))

   A `sign_token` like `$1$PK_fEsAq$Z5K0hEFrH6ZJa4M8p8JyD/` selects MD5-crypt —
   the FreeBSD algorithm, 1000 MD5 rounds and a non-standard base64 alphabet.
   Node has no `crypt()`, so it is implemented here rather than pulled in as a
   dependency for one function.

   Verified against OpenSSL (`openssl passwd -1`) for the empty password, keys
   longer than one MD5 block, and non-ASCII keys — the block-padding loop and
   the byte interleaving at the end are both easy to get subtly wrong, and a
   wrong implementation here would reject every real callback (or, worse, be
   written to fail open and accept forged ones). */

const ITOA64 = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const md5 = (...parts: Buffer[]) =>
  createHash("md5").update(Buffer.concat(parts)).digest();

/** PHP's `crypt(password, "$1$salt$…")`. Returns the full `$1$salt$hash`. */
export function md5crypt(password: string, salt: string) {
  /* "binary" (latin-1) rather than utf8: PHP hashes the raw bytes of the
     string it was given, and a key with an accent in it must hash the same
     way here as it does on their server. */
  const pw = Buffer.from(password, "binary");
  const sa = Buffer.from(salt, "binary");

  let final = md5(pw, sa, pw);

  const parts = [pw, Buffer.from("$1$", "binary"), sa];
  // The password's length in whole MD5 blocks, taken from the digest above.
  for (let pl = pw.length; pl > 0; pl -= 16) {
    parts.push(final.subarray(0, Math.min(pl, 16)));
  }
  // Then the length in binary, a NUL for each 1 bit and the first byte for 0.
  for (let i = pw.length; i; i >>= 1) {
    parts.push(i & 1 ? Buffer.from([0]) : pw.subarray(0, 1));
  }
  final = md5(...parts);

  // Deliberately slow: 1000 rounds is the whole point of the construction.
  for (let i = 0; i < 1000; i++) {
    const round: Buffer[] = [];
    round.push(i & 1 ? pw : final);
    if (i % 3) round.push(sa);
    if (i % 7) round.push(pw);
    round.push(i & 1 ? final : pw);
    final = md5(...round);
  }

  const to64 = (value: number, count: number) => {
    let out = "";
    for (let i = 0; i < count; i++) {
      out += ITOA64[value & 0x3f];
      value >>= 6;
    }
    return out;
  };

  const hash =
    to64((final[0] << 16) | (final[6] << 8) | final[12], 4) +
    to64((final[1] << 16) | (final[7] << 8) | final[13], 4) +
    to64((final[2] << 16) | (final[8] << 8) | final[14], 4) +
    to64((final[3] << 16) | (final[9] << 8) | final[15], 4) +
    to64((final[4] << 16) | (final[10] << 8) | final[5], 4) +
    to64(final[11], 2);

  return `$1$${salt}$${hash}`;
}

/**
 * Is `signToken` really Paymooney's signature over our private key?
 *
 * The salt is carried inside the token itself, exactly as PHP's `crypt()`
 * reads it: `$1$`, then up to eight characters, then `$`.
 */
export function verifySignToken(privateKey: string, signToken: string) {
  const match = /^\$1\$([^$]{0,8})\$/.exec(signToken);
  if (!match) return false;

  const expected = md5crypt(privateKey, match[1]);

  /* Constant time, like the `hash_equals` their PHP uses. Lengths have to
     match first — timingSafeEqual throws on a length mismatch rather than
     returning false. */
  const a = Buffer.from(expected, "binary");
  const b = Buffer.from(signToken, "binary");
  return a.length === b.length && timingSafeEqual(a, b);
}
