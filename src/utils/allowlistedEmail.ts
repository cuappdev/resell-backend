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

function isProdEnv(): boolean {
  return process.env.IS_PROD?.toLowerCase() === "true";
}

/**
 * Human-readable token email for logs / dev error text (never throws).
 */
export function normalizedTokenEmailForDebug(
  email: string | undefined,
): string {
  if (!email || !email.trim()) {
    return "(no email claim on ID token)";
  }
  return normalizeEmail(email);
}

/**
 * 403 message for disallowed emails. In non-prod, includes normalized token
 * email and parsed EMAIL_WHITELIST for debugging. Prod stays generic.
 * Always logs a line to stderr when called.
 */
export function buildForbiddenEmailMessage(email: string | undefined): string {
  const base =
    "Only Cornell email addresses or whitelisted emails are allowed.";
  const normalizedFromToken = normalizedTokenEmailForDebug(email);
  const whitelistEntries = Array.from(getEmailWhitelist()).sort();
  const listText =
    whitelistEntries.length > 0
      ? whitelistEntries.join(", ")
      : "(EMAIL_WHITELIST is empty)";

  console.warn("[email-auth] rejected", {
    normalizedFromToken,
    whitelistEntryCount: whitelistEntries.length,
    whitelistEntries: isProdEnv() ? "[redacted in prod logs]" : whitelistEntries,
  });

  if (isProdEnv()) {
    return base;
  }
  return `${base} Token email (normalized): "${normalizedFromToken}". Whitelist: ${listText}.`;
}
