const normalizeEmail = (value: string) => value.trim().toLowerCase();

export function getAdminEmails(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isAdminEmail(
  email: string | null | undefined,
  allowlist: string | undefined,
) {
  if (!email) {
    return false;
  }

  return getAdminEmails(allowlist).includes(normalizeEmail(email));
}
