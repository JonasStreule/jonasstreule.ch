import { Router, Request, Response } from 'express';
import { pool } from '../db';
import {
  isNonEmptyString, isValidEmail, isOptionalEmail, isValidPlz, isValidPhone,
} from '../validate';

type CampaignParams = { campaign: string };
type CampaignRequest = Request<CampaignParams>;

const router = Router({ mergeParams: true });

function badRequest(res: Response, msg: string) {
  res.status(400).json({ error: msg });
}

// ── PETITION ─────────────────────────────────────────────────────
router.post('/petition', async (req: CampaignRequest, res: Response) => {
  const { campaign } = req.params;
  const { name, ort, email, isPublic } = req.body ?? {};
  if (!isNonEmptyString(name, 120)) return badRequest(res, 'name fehlt oder zu lang');
  if (!isNonEmptyString(ort, 120)) return badRequest(res, 'ort fehlt oder zu lang');
  if (!isOptionalEmail(email)) return badRequest(res, 'email ungueltig');

  await pool.query(
    `INSERT INTO petition_signatures (campaign, name, ort, email, is_public) VALUES ($1,$2,$3,$4,$5)`,
    [campaign, name.trim(), ort.trim(), email || null, isPublic !== false]
  );
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM petition_signatures WHERE campaign = $1`,
    [campaign]
  );
  res.status(201).json({ count: rows[0].count });
});

router.get('/petition', async (req: CampaignRequest, res: Response) => {
  const { campaign } = req.params;
  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS count FROM petition_signatures WHERE campaign = $1`,
    [campaign]
  );
  const signersRes = await pool.query(
    `SELECT name, ort FROM petition_signatures WHERE campaign = $1 AND is_public = true ORDER BY created_at DESC LIMIT 8`,
    [campaign]
  );
  res.json({
    count: countRes.rows[0].count,
    recentSigners: signersRes.rows.map((r: { name: string; ort: string }) => {
      const parts = r.name.trim().split(/\s+/);
      const initial = parts[0]?.[0] ?? '';
      const last = parts[parts.length - 1] ?? '';
      return `${initial}. ${last} · ${r.ort}`;
    }),
  });
});

// ── SPENDE ───────────────────────────────────────────────────────
router.post('/spende', async (req: CampaignRequest, res: Response) => {
  const { campaign } = req.params;
  const { name, email, betrag, visibility } = req.body ?? {};
  const betragNum = Number(betrag);
  if (!isNonEmptyString(name, 120)) return badRequest(res, 'name fehlt');
  if (!isValidEmail(email)) return badRequest(res, 'email ungueltig');
  if (!Number.isInteger(betragNum) || betragNum < 5) return badRequest(res, 'betrag muss mindestens 5 sein');
  const vis = ['public', 'anonym', 'privat'].includes(visibility) ? visibility : 'privat';

  await pool.query(
    `INSERT INTO donations (campaign, name, email, betrag_chf, visibility) VALUES ($1,$2,$3,$4,$5)`,
    [campaign, name.trim(), email, betragNum, vis]
  );
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(betrag_chf),0)::int AS total, COUNT(*)::int AS donors FROM donations WHERE campaign = $1`,
    [campaign]
  );
  res.status(201).json(rows[0]);
});

router.get('/spende', async (req: CampaignRequest, res: Response) => {
  const { campaign } = req.params;
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(betrag_chf),0)::int AS total, COUNT(*)::int AS donors FROM donations WHERE campaign = $1`,
    [campaign]
  );
  res.json(rows[0]);
});

// ── NEWSLETTER ───────────────────────────────────────────────────
router.post('/newsletter', async (req: CampaignRequest, res: Response) => {
  const { campaign } = req.params;
  const { email } = req.body ?? {};
  if (!isValidEmail(email)) return badRequest(res, 'email ungueltig');
  await pool.query(
    `INSERT INTO newsletter_subscribers (campaign, email) VALUES ($1,$2)
     ON CONFLICT (campaign, email) DO NOTHING`,
    [campaign, email]
  );
  res.status(201).json({ ok: true });
});

// ── KONTAKT (z.B. Parlamentarier kontaktieren) ──────────────────
router.post('/contact', async (req: CampaignRequest, res: Response) => {
  const { campaign } = req.params;
  const { targetName, targetEmail, senderName, senderEmail, message } = req.body ?? {};
  if (!isNonEmptyString(targetName, 200)) return badRequest(res, 'targetName fehlt');
  if (!isOptionalEmail(targetEmail)) return badRequest(res, 'targetEmail ungueltig');
  if (!isNonEmptyString(senderName, 120)) return badRequest(res, 'senderName fehlt');
  if (!isValidEmail(senderEmail)) return badRequest(res, 'senderEmail ungueltig');
  if (!isNonEmptyString(message, 4000)) return badRequest(res, 'message fehlt oder zu lang');

  await pool.query(
    `INSERT INTO contact_messages (campaign, target_name, target_email, sender_name, sender_email, message)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [campaign, targetName.trim(), targetEmail || null, senderName.trim(), senderEmail, message.trim()]
  );
  res.status(201).json({ ok: true });
});

// ── VIP-ANMELDUNG ────────────────────────────────────────────────
router.post('/vip', async (req: CampaignRequest, res: Response) => {
  const { campaign } = req.params;
  const { name, funktion, organisation, zitat } = req.body ?? {};
  if (!isNonEmptyString(name, 120)) return badRequest(res, 'name fehlt');
  if (!isNonEmptyString(funktion, 200)) return badRequest(res, 'funktion fehlt');
  if (zitat && typeof zitat === 'string' && zitat.length > 300) return badRequest(res, 'zitat zu lang');

  await pool.query(
    `INSERT INTO vip_applications (campaign, name, funktion, organisation, zitat) VALUES ($1,$2,$3,$4,$5)`,
    [campaign, name.trim(), funktion.trim(), organisation || null, zitat || null]
  );
  res.status(201).json({ ok: true });
});

router.get('/vip', async (req: CampaignRequest, res: Response) => {
  const { campaign } = req.params;
  const { rows } = await pool.query(
    `SELECT name, funktion, organisation, zitat FROM vip_applications
     WHERE campaign = $1 AND approved = true ORDER BY created_at ASC`,
    [campaign]
  );
  res.json(rows);
});

// ── FINDER-CONSENT (PLZ-Tool, Telefon optional fuer Updates) ────
router.post('/finder-lead', async (req: CampaignRequest, res: Response) => {
  const { campaign } = req.params;
  const { plz, telefon, consent } = req.body ?? {};
  if (!isValidPlz(plz)) return badRequest(res, 'plz ungueltig');
  if (!isValidPhone(telefon)) return badRequest(res, 'telefon ungueltig');
  if (consent !== true) return badRequest(res, 'consent muss true sein');

  await pool.query(
    `INSERT INTO finder_leads (campaign, plz, telefon, consent) VALUES ($1,$2,$3,$4)`,
    [campaign, plz, telefon, true]
  );
  res.status(201).json({ ok: true });
});

// ── ARTIKEL-FEEDBACK (Fragen/Änderungsvorschläge zum Gesetzestext) ─
router.post('/article-feedback', async (req: CampaignRequest, res: Response) => {
  const { campaign } = req.params;
  const { artikel, name, email, kommentar, notify } = req.body ?? {};
  if (!isNonEmptyString(artikel, 20)) return badRequest(res, 'artikel fehlt');
  if (!isNonEmptyString(name, 120)) return badRequest(res, 'name fehlt');
  if (!isValidEmail(email)) return badRequest(res, 'email ungueltig');
  if (!isNonEmptyString(kommentar, 4000)) return badRequest(res, 'kommentar fehlt oder zu lang');

  await pool.query(
    `INSERT INTO article_feedback (campaign, artikel, name, email, kommentar, notify) VALUES ($1,$2,$3,$4,$5,$6)`,
    [campaign, artikel.trim(), name.trim(), email, kommentar.trim(), notify !== false]
  );
  res.status(201).json({ ok: true });
});

export default router;
