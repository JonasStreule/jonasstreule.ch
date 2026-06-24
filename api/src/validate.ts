export function isNonEmptyString(v: unknown, maxLen = 200): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= maxLen;
}

export function isValidEmail(v: unknown): v is string {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 200;
}

export function isOptionalEmail(v: unknown): boolean {
  return v === undefined || v === null || v === '' || isValidEmail(v);
}

export function isValidPlz(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}$/.test(v);
}

export function isValidPhone(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9+()\s-]{6,30}$/.test(v);
}

export function isValidCampaignSlug(v: unknown): v is string {
  return typeof v === 'string' && /^[a-z0-9-]{2,60}$/.test(v);
}
