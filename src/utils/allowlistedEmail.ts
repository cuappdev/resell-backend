const CORNELL_SUFFIX = "@cornell.edu";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Full addresses from EMAIL_WHITELIST (comma-separated), lowercased. */
export function getEmailWhitelist(): Set<string> {
  const raw = process.env.EMAIL_WHITELIST ?? "";
  const set = new Set<string>();
  for (const part of raw.split(",")) {
    const normalized = normalizeEmail(part);
    if (normalized.length > 0) {
      set.add(normalized);
    }
  }
  return set;
}

/**
 * True if the Firebase user email may use the API: @cornell.edu or listed in EMAIL_WHITELIST.
 * When true, `email` is a non-empty string.
 */
export function isAllowedLoginEmail(
  email: string | undefined,
  whitelist: Set<string> = getEmailWhitelist(),
): email is string {
  if (!email) {
    return false;
  }
  const e = normalizeEmail(email);
  if (e.endsWith(CORNELL_SUFFIX)) {
    return true;
  }
  return whitelist.has(e);
}
