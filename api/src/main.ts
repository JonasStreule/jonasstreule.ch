import express from 'express';
import rateLimit from 'express-rate-limit';
import { pool, runMigrations } from './db';
import { isValidCampaignSlug } from './validate';
import campaignRouter from './routes/campaign';

const app = express();
app.disable('x-powered-by');
// Hinter Caddy (1 Proxy-Hop): echte Client-IP aus X-Forwarded-For nutzen,
// damit das Rate-Limit pro Besucher statt global greift.
app.set('trust proxy', 1);
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/:campaign', (req, res, next) => {
  if (!isValidCampaignSlug(req.params.campaign)) {
    return res.status(404).json({ error: 'unbekannte campaign' });
  }
  next();
});
app.use('/api/:campaign', writeLimiter, campaignRouter);

app.use((_req, res) => res.status(404).json({ error: 'not found' }));

const port = Number(process.env.PORT) || 4010;

runMigrations()
  .then(() => {
    app.listen(port, () => console.log(`jonasstreule-campaign-api listening on ${port}`));
  })
  .catch(err => {
    console.error('Migration failed', err);
    process.exit(1);
  });
