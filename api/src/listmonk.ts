// Anbindung an die selbst-gehostete Listmonk-Instanz.
// Fehler hier sind absichtlich nicht fatal: der DB-Eintrag bleibt die
// verlaessliche Quelle, Listmonk ist der Versand-Layer obendrauf.

const LISTMONK_URL = process.env.LISTMONK_URL || '';
const LISTMONK_API_USER = process.env.LISTMONK_API_USER || '';
const LISTMONK_API_TOKEN = process.env.LISTMONK_API_TOKEN || '';

// Mapping campaign-slug -> Listmonk-Listen-ID, z.B. {"hofladen-schutz":3}
let listMap: Record<string, number> = {};
try {
  listMap = JSON.parse(process.env.LISTMONK_LISTS || '{}');
} catch {
  console.error('LISTMONK_LISTS ist kein gueltiges JSON – ignoriere');
}

export function listmonkConfigured(): boolean {
  return Boolean(LISTMONK_URL && LISTMONK_API_USER && LISTMONK_API_TOKEN);
}

export async function subscribeToListmonk(campaign: string, email: string, name?: string): Promise<void> {
  if (!listmonkConfigured()) return;
  const listId = listMap[campaign];
  if (!listId) return; // keine Liste fuer diese Kampagne konfiguriert

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(`${LISTMONK_URL.replace(/\/$/, '')}/api/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${LISTMONK_API_USER}:${LISTMONK_API_TOKEN}`,
      },
      body: JSON.stringify({
        email,
        name: name || email.split('@')[0],
        status: 'enabled',
        lists: [listId],
        // false => Listmonk schickt die Double-Opt-in-Bestaetigungsmail
        preconfirm_subscriptions: false,
      }),
      signal: ctrl.signal,
    });
    // 409 = existiert bereits; das ist okay
    if (!res.ok && res.status !== 409) {
      const text = await res.text().catch(() => '');
      console.error(`Listmonk subscribe fehlgeschlagen (${res.status}): ${text.slice(0, 200)}`);
    }
  } catch (e) {
    console.error('Listmonk nicht erreichbar:', (e as Error).message);
  } finally {
    clearTimeout(timeout);
  }
}
