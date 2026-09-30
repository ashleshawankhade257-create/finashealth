import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const FASTAPI_PORT = 8000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Fast API Proxy or Local Fallback Store ---
const DB_FILE = path.join(process.cwd(), 'credit_assistant_store.json');

interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash?: string;
  google_id?: string;
  profile_picture?: string;
  auth_provider: 'local' | 'google';
  created_at: string;
}

interface ProfileRecord {
  id: number;
  user_id: number;
  monthly_income: number;
  monthly_expenses: number;
  total_debt: number;
  monthly_debt_payment: number;
  total_credit_limit: number;
  credit_utilization: number;
  dti_ratio: number;
  active_loans: number;
  missed_payments: number;
  financial_goal: string;
  created_at: string;
  updated_at: string;
}

interface ScoreRecord {
  id: number;
  user_id: number;
  credit_score: number;
  recorded_at: string;
  source: string;
}

interface SnapshotRecord {
  id: number;
  user_id: number;
  income: number;
  expenses: number;
  debt: number;
  utilization: number;
  dti: number;
  savings: number;
  created_at: string;
}

interface StoreSchema {
  users: UserRecord[];
  profiles: ProfileRecord[];
  scores: ScoreRecord[];
  snapshots: SnapshotRecord[];
  recommendations: any[];
}

function loadStore(): StoreSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      // ignore
    }
  }
  // Initialize with seed Demo User
  const demoUser: UserRecord = {
    id: 1,
    name: 'Demo User',
    email: 'demo@creditassistant.in',
    password_hash: hashPassword('DemoPassword123!'),
    auth_provider: 'local',
    created_at: new Date().toISOString()
  };
  const demoProfile: ProfileRecord = {
    id: 1,
    user_id: 1,
    monthly_income: 60000,
    monthly_expenses: 35000,
    total_debt: 180000,
    monthly_debt_payment: 12000,
    total_credit_limit: 250000,
    credit_utilization: 72.0,
    dti_ratio: 20.0,
    active_loans: 2,
    missed_payments: 1,
    financial_goal: 'Improve credit score',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const demoScores: ScoreRecord[] = [
    { id: 1, user_id: 1, credit_score: 640, recorded_at: new Date(Date.now() - 120 * 86400000).toISOString(), source: 'user_reported' },
    { id: 2, user_id: 1, credit_score: 652, recorded_at: new Date(Date.now() - 90 * 86400000).toISOString(), source: 'user_reported' },
    { id: 3, user_id: 1, credit_score: 660, recorded_at: new Date(Date.now() - 60 * 86400000).toISOString(), source: 'user_reported' },
    { id: 4, user_id: 1, credit_score: 671, recorded_at: new Date(Date.now() - 30 * 86400000).toISOString(), source: 'user_reported' },
    { id: 5, user_id: 1, credit_score: 680, recorded_at: new Date().toISOString(), source: 'user_reported' },
  ];
  const demoSnapshots: SnapshotRecord[] = [
    { id: 1, user_id: 1, income: 60000, expenses: 35000, debt: 180000, utilization: 72.0, dti: 20.0, savings: 13000, created_at: new Date().toISOString() }
  ];
  const initialStore: StoreSchema = {
    users: [demoUser],
    profiles: [demoProfile],
    scores: demoScores,
    snapshots: demoSnapshots,
    recommendations: []
  };
  saveStore(initialStore);
  return initialStore;
}

function saveStore(store: StoreSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error('Failed to write store file:', err);
  }
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  return `${salt}$${hash}`;
}

function verifyPassword(plain: string, stored: string): boolean {
  if (!stored || !stored.includes('$')) return false;
  const [salt, expectedHash] = stored.split('$');
  const testHash = crypto.pbkdf2Sync(plain, salt, 100000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(testHash, 'hex'));
}

function createToken(userId: number): string {
  const payload = { sub: userId, exp: Math.floor(Date.now() / 1000) + 86400 };
  const secret = process.env.SECRET_KEY || 'credit_assistant_super_secure_secret_key_2026';
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): number | null {
  try {
    const [encoded, sig] = token.split('.');
    const secret = process.env.SECRET_KEY || 'credit_assistant_super_secure_secret_key_2026';
    const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

// Authenticate middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication token required.' });
  }
  const token = authHeader.substring(7);
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ detail: 'Invalid or expired session token.' });
  }
  const store = loadStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ detail: 'User not found.' });
  }
  (req as any).user = user;
  next();
}

// --- FastAPI Background Launcher & Proxy Check ---
let fastApiRunning = false;

function checkFastApi() {
  const req = http.request({ host: '127.0.0.1', port: FASTAPI_PORT, path: '/health', timeout: 1000 }, (res) => {
    fastApiRunning = res.statusCode === 200;
  });
  req.on('error', () => { fastApiRunning = false; });
  req.end();
}
setInterval(checkFastApi, 5000);
checkFastApi();

// Try spawning Python FastAPI if python3 is available
try {
  const pythonProc = spawn('python3', ['backend/run.py'], {
    env: { ...process.env, PORT: '8000' },
    stdio: 'ignore'
  });
  pythonProc.on('error', () => {});
} catch {}

// Forward to FastAPI if running, otherwise use seamless Express implementation
async function proxyToFastApi(req: Request, res: Response): Promise<boolean> {
  if (!fastApiRunning) return false;
  return new Promise((resolve) => {
    const proxyReq = http.request({
      host: '127.0.0.1',
      port: FASTAPI_PORT,
      path: req.originalUrl,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${FASTAPI_PORT}` }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
      resolve(true);
    });
    proxyReq.on('error', () => {
      fastApiRunning = false;
      resolve(false);
    });
    if (req.body && Object.keys(req.body).length > 0) {
      proxyReq.write(JSON.stringify(req.body));
    }
    proxyReq.end();
  });
}

// Health endpoint
app.get('/health', async (req, res) => {
  res.json({ status: 'healthy', service: 'Credit Assistant Engine', version: '1.0.0' });
});

// Swagger & Docs proxies
app.get('/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Credit Assistant API Docs</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' })</script>
      </body>
    </html>
  `);
});

app.get('/openapi.json', (req, res) => {
  res.json({
    openapi: "3.0.0",
    info: { title: "Credit Assistant API", version: "1.0.0" },
    paths: {
      "/auth/login": { post: { summary: "Authenticate with email and password" } },
      "/auth/register": { post: { summary: "Register new user account" } },
      "/auth/google/verify": { post: { summary: "Verify Google OAuth token" } },
      "/financial/profile": { get: { summary: "Get financial profile" }, post: { summary: "Create profile" }, put: { summary: "Update profile" } },
      "/credit/current": { get: { summary: "Get current score summary" } },
      "/credit/history": { get: { summary: "Get score timeline" }, post: { summary: "Record new score" } },
      "/dashboard/summary": { get: { summary: "Dashboard metrics summary" } },
      "/dashboard/analytics": { get: { summary: "Chart datasets" } },
      "/ai/analyze": { post: { summary: "Run Google Gemini financial assessment" } }
    }
  });
});

// --- AUTH ROUTES ---
app.post('/auth/register', (req, res) => {
  const { name, email, password, confirm_password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ detail: 'Name, email, and password are required.' });
  }
  if (confirm_password && password !== confirm_password) {
    return res.status(400).json({ detail: 'Passwords do not match.' });
  }
  const store = loadStore();
  const cleanEmail = email.trim().toLowerCase();
  if (store.users.some(u => u.email === cleanEmail)) {
    return res.status(400).json({ detail: 'An account with this email already exists.' });
  }
  const newUser: UserRecord = {
    id: store.users.length + 1,
    name: name.trim(),
    email: cleanEmail,
    password_hash: hashPassword(password),
    auth_provider: 'local',
    created_at: new Date().toISOString()
  };
  store.users.push(newUser);
  saveStore(store);
  const token = createToken(newUser.id);
  res.json({
    access_token: token,
    token_type: 'bearer',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      auth_provider: newUser.auth_provider,
      profile_picture: null,
      has_profile: false
    }
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const store = loadStore();
  const cleanEmail = (email || '').trim().toLowerCase();
  const user = store.users.find(u => u.email === cleanEmail);
  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ detail: 'Invalid email or password.' });
  }
  const hasProfile = store.profiles.some(p => p.user_id === user.id);
  const token = createToken(user.id);
  res.json({
    access_token: token,
    token_type: 'bearer',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      auth_provider: user.auth_provider,
      profile_picture: user.profile_picture || null,
      has_profile: hasProfile
    }
  });
});

app.post('/auth/logout', (req, res) => {
  res.json({ message: 'Successfully logged out.' });
});

app.get('/auth/me', authMiddleware, (req, res) => {
  const user: UserRecord = (req as any).user;
  const store = loadStore();
  const hasProfile = store.profiles.some(p => p.user_id === user.id);
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    profile_picture: user.profile_picture || null,
    auth_provider: user.auth_provider,
    has_profile: hasProfile,
    created_at: user.created_at
  });
});

app.get('/auth/google/login', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/auth/google/callback`;
  const state = req.query.frontend_redirect ? encodeURIComponent(String(req.query.frontend_redirect)) : '';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account${state ? `&state=${state}` : ''}`;
  res.json({ url });
});

app.post('/auth/google/verify', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ detail: 'Google credential is required.' });
  }
  try {
    // Verify credential with Google TokenInfo
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!googleRes.ok) {
      return res.status(401).json({ detail: 'Invalid or expired Google token.' });
    }
    const gData = await googleRes.json();
    const googleId = gData.sub;
    const email = (gData.email || '').trim().toLowerCase();
    const name = gData.name || email.split('@')[0];
    const picture = gData.picture;

    const store = loadStore();
    let user = store.users.find(u => u.google_id === googleId || u.email === email);
    if (!user) {
      user = {
        id: store.users.length + 1,
        name,
        email,
        google_id: googleId,
        profile_picture: picture,
        auth_provider: 'google',
        created_at: new Date().toISOString()
      };
      store.users.push(user);
    } else {
      user.google_id = googleId;
      if (picture) user.profile_picture = picture;
    }
    saveStore(store);

    const hasProfile = store.profiles.some(p => p.user_id === user.id);
    const token = createToken(user.id);
    res.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture || null,
        auth_provider: user.auth_provider,
        has_profile: hasProfile
      }
    });
  } catch (err: any) {
    res.status(500).json({ detail: 'Error validating Google token.' });
  }
});

// --- FINANCIAL ROUTES ---
app.get('/financial/profile', authMiddleware, (req, res) => {
  const user: UserRecord = (req as any).user;
  const store = loadStore();
  const profile = store.profiles.find(p => p.user_id === user.id);
  if (!profile) return res.json(null);
  const savings = Math.round(profile.monthly_income - profile.monthly_expenses - profile.monthly_debt_payment);
  res.json({ ...profile, monthly_savings: savings });
});

app.post('/financial/profile', authMiddleware, (req, res) => {
  const user: UserRecord = (req as any).user;
  const { monthly_income, monthly_expenses, total_debt, monthly_debt_payment, total_credit_limit, active_loans, missed_payments, financial_goal, credit_score } = req.body;
  
  const income = Number(monthly_income) || 0;
  const expenses = Number(monthly_expenses) || 0;
  const debt = Number(total_debt) || 0;
  const emi = Number(monthly_debt_payment) || 0;
  const limit = Number(total_credit_limit) || 0;

  const dti = income > 0 ? Math.round((emi / income) * 10000) / 100 : 0;
  const util = limit > 0 ? Math.round((Math.min(debt, limit) / limit) * 10000) / 100 : (debt > 0 ? 100 : 0);
  const savings = Math.round(income - expenses - emi);

  const store = loadStore();
  let profile = store.profiles.find(p => p.user_id === user.id);
  const now = new Date().toISOString();

  if (!profile) {
    profile = {
      id: store.profiles.length + 1,
      user_id: user.id,
      monthly_income: income,
      monthly_expenses: expenses,
      total_debt: debt,
      monthly_debt_payment: emi,
      total_credit_limit: limit,
      credit_utilization: util,
      dti_ratio: dti,
      active_loans: Number(active_loans) || 0,
      missed_payments: Number(missed_payments) || 0,
      financial_goal: financial_goal || 'Improve credit score',
      created_at: now,
      updated_at: now
    };
    store.profiles.push(profile);
  } else {
    Object.assign(profile, {
      monthly_income: income,
      monthly_expenses: expenses,
      total_debt: debt,
      monthly_debt_payment: emi,
      total_credit_limit: limit,
      credit_utilization: util,
      dti_ratio: dti,
      active_loans: Number(active_loans) || 0,
      missed_payments: Number(missed_payments) || 0,
      financial_goal: financial_goal || profile.financial_goal,
      updated_at: now
    });
  }

  // Record credit score if provided
  if (credit_score !== undefined && credit_score !== null && credit_score !== '') {
    store.scores.push({
      id: store.scores.length + 1,
      user_id: user.id,
      credit_score: Number(credit_score),
      recorded_at: now,
      source: 'onboarding'
    });
  }

  // Record snapshot
  store.snapshots.push({
    id: store.snapshots.length + 1,
    user_id: user.id,
    income,
    expenses,
    debt,
    utilization: util,
    dti,
    savings,
    created_at: now
  });

  saveStore(store);
  res.json({ ...profile, monthly_savings: savings });
});

app.put('/financial/profile', authMiddleware, (req, res) => {
  const user: UserRecord = (req as any).user;
  const store = loadStore();
  const profile = store.profiles.find(p => p.user_id === user.id);

  const income = req.body.monthly_income !== undefined ? Number(req.body.monthly_income) : (profile?.monthly_income || 0);
  const expenses = req.body.monthly_expenses !== undefined ? Number(req.body.monthly_expenses) : (profile?.monthly_expenses || 0);
  const debt = req.body.total_debt !== undefined ? Number(req.body.total_debt) : (profile?.total_debt || 0);
  const emi = req.body.monthly_debt_payment !== undefined ? Number(req.body.monthly_debt_payment) : (profile?.monthly_debt_payment || 0);
  const limit = req.body.total_credit_limit !== undefined ? Number(req.body.total_credit_limit) : (profile?.total_credit_limit || 0);
  const active_loans = req.body.active_loans !== undefined ? Number(req.body.active_loans) : (profile?.active_loans || 0);
  const missed_payments = req.body.missed_payments !== undefined ? Number(req.body.missed_payments) : (profile?.missed_payments || 0);
  const goal = req.body.financial_goal || profile?.financial_goal || 'Improve credit score';

  const dti = income > 0 ? Math.round((emi / income) * 10000) / 100 : 0;
  const util = limit > 0 ? Math.round((Math.min(debt, limit) / limit) * 10000) / 100 : (debt > 0 ? 100 : 0);
  const savings = Math.round(income - expenses - emi);
  const now = new Date().toISOString();

  if (!profile) {
    const newProfile: ProfileRecord = {
      id: store.profiles.length + 1,
      user_id: user.id,
      monthly_income: income,
      monthly_expenses: expenses,
      total_debt: debt,
      monthly_debt_payment: emi,
      total_credit_limit: limit,
      credit_utilization: util,
      dti_ratio: dti,
      active_loans,
      missed_payments,
      financial_goal: goal,
      created_at: now,
      updated_at: now
    };
    store.profiles.push(newProfile);
  } else {
    Object.assign(profile, {
      monthly_income: income,
      monthly_expenses: expenses,
      total_debt: debt,
      monthly_debt_payment: emi,
      total_credit_limit: limit,
      credit_utilization: util,
      dti_ratio: dti,
      active_loans,
      missed_payments,
      financial_goal: goal,
      updated_at: now
    });
  }

  if (req.body.credit_score !== undefined && req.body.credit_score !== null && req.body.credit_score !== '') {
    store.scores.push({
      id: store.scores.length + 1,
      user_id: user.id,
      credit_score: Number(req.body.credit_score),
      recorded_at: now,
      source: 'update'
    });
  }

  store.snapshots.push({
    id: store.snapshots.length + 1,
    user_id: user.id,
    income,
    expenses,
    debt,
    utilization: util,
    dti,
    savings,
    created_at: now
  });

  saveStore(store);
  res.json({ ...(profile || store.profiles[store.profiles.length - 1]), monthly_savings: savings });
});

// --- CREDIT ROUTES ---
function getScoreCategory(score: number | null): { category: string; color: string; interpretation: string } {
  if (score === null || score === undefined) {
    return { category: 'No Score', color: 'slate', interpretation: 'Record your score to unlock insights.' };
  }
  if (score <= 579) {
    return { category: 'Poor', color: 'rose', interpretation: 'Elevated credit risk. Substantial opportunity to rebuild with disciplined on-time payments.' };
  }
  if (score <= 669) {
    return { category: 'Fair', color: 'amber', interpretation: 'Below average credit profile. Strategic debt paydown can quickly lift you into the Good band.' };
  }
  if (score <= 739) {
    return { category: 'Good', color: 'blue', interpretation: 'Healthy credit profile. Standard access to prime credit card lines and consumer loans.' };
  }
  if (score <= 799) {
    return { category: 'Very Good', color: 'emerald', interpretation: 'Strong creditworthiness. Qualifies for pre-approved loan offers and competitive interest rates.' };
  }
  return { category: 'Excellent', color: 'violet', interpretation: 'Elite financial tier. Maximum borrowing limits and lowest lending margins in India.' };
}

app.get('/credit/current', authMiddleware, (req, res) => {
  const user: UserRecord = (req as any).user;
  const store = loadStore();
  const userScores = store.scores.filter(s => s.user_id === user.id).sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  if (userScores.length === 0) {
    return res.json({ current_score: null, previous_score: null, delta: null, category: 'No Score', category_color: 'slate', recorded_at: null, interpretation: 'Record your score to get started.' });
  }
  const current = userScores[0];
  const previous = userScores[1];
  const delta = previous ? current.credit_score - previous.credit_score : 0;
  const cat = getScoreCategory(current.credit_score);
  res.json({
    current_score: current.credit_score,
    previous_score: previous ? previous.credit_score : null,
    delta,
    category: cat.category,
    category_color: cat.color,
    recorded_at: current.recorded_at,
    interpretation: cat.interpretation
  });
});

app.get('/credit/history', authMiddleware, (req, res) => {
  const user: UserRecord = (req as any).user;
  const store = loadStore();
  const userScores = store.scores.filter(s => s.user_id === user.id).sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const latestDesc = [...userScores].reverse();
  const current = latestDesc[0];
  const previous = latestDesc[1];
  const delta = current && previous ? current.credit_score - previous.credit_score : 0;
  const cat = current ? getScoreCategory(current.credit_score) : getScoreCategory(null);
  res.json({
    current: {
      current_score: current ? current.credit_score : null,
      previous_score: previous ? previous.credit_score : null,
      delta,
      category: cat.category,
      category_color: cat.color,
      recorded_at: current ? current.recorded_at : null,
      interpretation: cat.interpretation
    },
    history: userScores
  });
});

app.post('/credit/history', authMiddleware, (req, res) => {
  const user: UserRecord = (req as any).user;
  const { credit_score, source } = req.body;
  const scoreNum = Number(credit_score);
  if (!scoreNum || scoreNum < 300 || scoreNum > 900) {
    return res.status(400).json({ detail: 'Credit score must be between 300 and 900.' });
  }
  const store = loadStore();
  const newEntry: ScoreRecord = {
    id: store.scores.length + 1,
    user_id: user.id,
    credit_score: scoreNum,
    recorded_at: new Date().toISOString(),
    source: source || 'user_reported'
  };
  store.scores.push(newEntry);
  saveStore(store);

  const userScores = store.scores.filter(s => s.user_id === user.id).sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  const current = userScores[0];
  const previous = userScores[1];
  const delta = previous ? current.credit_score - previous.credit_score : 0;
  const cat = getScoreCategory(current.credit_score);
  res.json({
    current_score: current.credit_score,
    previous_score: previous ? previous.credit_score : null,
    delta,
    category: cat.category,
    category_color: cat.color,
    recorded_at: current.recorded_at,
    interpretation: cat.interpretation
  });
});

// --- DASHBOARD ROUTES ---
app.get('/dashboard/summary', authMiddleware, (req, res) => {
  const user: UserRecord = (req as any).user;
  const store = loadStore();
  const profile = store.profiles.find(p => p.user_id === user.id);
  const userScores = store.scores.filter(s => s.user_id === user.id).sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

  const currentScore = userScores[0];
  const prevScore = userScores[1];
  const delta = currentScore && prevScore ? currentScore.credit_score - prevScore.credit_score : 0;
  const scoreCat = currentScore ? getScoreCategory(currentScore.credit_score) : getScoreCategory(null);

  if (!profile) {
    return res.json({
      user: { id: user.id, name: user.name, email: user.email, profile_picture: user.profile_picture || null, has_profile: false },
      score: { current_score: null, previous_score: null, delta: null, category: 'No Score', category_color: 'slate', recorded_at: null, interpretation: 'Please set up your profile.' },
      profile: null,
      metrics: {
        dti: { value: 0, status: 'No Data', color: 'slate', action: 'Complete profile setup' },
        utilization: { value: 0, status: 'No Data', color: 'slate', action: 'Complete profile setup' },
        savings: { value: 0, status: 'No Data', color: 'slate', action: 'Complete profile setup' },
        debt: { value: 0, status: 'No Data', color: 'slate', action: 'Complete profile setup' },
        loans: { value: 0, status: 'No Data', color: 'slate', action: 'Complete profile setup' },
        missed_payments: { value: 0, status: 'No Data', color: 'slate', action: 'Complete profile setup' }
      }
    });
  }

  const savings = Math.round(profile.monthly_income - profile.monthly_expenses - profile.monthly_debt_payment);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, profile_picture: user.profile_picture || null, has_profile: true },
    score: {
      current_score: currentScore ? currentScore.credit_score : null,
      previous_score: prevScore ? prevScore.credit_score : null,
      delta,
      category: scoreCat.category,
      category_color: scoreCat.color,
      recorded_at: currentScore ? currentScore.recorded_at : null,
      interpretation: scoreCat.interpretation
    },
    profile: { ...profile, monthly_savings: savings },
    metrics: {
      dti: {
        value: profile.dti_ratio,
        status: profile.dti_ratio <= 20 ? 'Optimal' : profile.dti_ratio <= 35 ? 'Manageable' : 'High',
        color: profile.dti_ratio <= 20 ? 'emerald' : profile.dti_ratio <= 35 ? 'blue' : 'rose',
        action: profile.dti_ratio <= 35 ? 'Healthy debt-to-income balance maintained.' : 'Prioritize debt paydown to free up disposable income.'
      },
      utilization: {
        value: profile.credit_utilization,
        status: profile.credit_utilization <= 30 ? 'Optimal' : profile.credit_utilization <= 50 ? 'Moderate' : 'High Risk',
        color: profile.credit_utilization <= 30 ? 'emerald' : profile.credit_utilization <= 50 ? 'amber' : 'rose',
        action: profile.credit_utilization <= 30 ? 'Low credit utilization signals responsible revolving credit usage.' : 'Bring card balances below 30% to maximize bureau rating boost.'
      },
      savings: {
        value: savings,
        status: savings > 0 ? 'Surplus' : 'Deficit',
        color: savings > 0 ? 'emerald' : 'rose',
        action: savings > 0 ? 'Direct surplus liquidity toward emergency buffer and high-cost debt.' : 'Monthly expenses exceed income. Immediate budget restructuring needed.'
      },
      debt: {
        value: profile.total_debt,
        status: 'Monitored',
        color: 'slate',
        action: `₹${profile.monthly_debt_payment.toLocaleString('en-IN')}/mo committed in loan installments.`
      },
      loans: {
        value: profile.active_loans,
        status: 'Active Accounts',
        color: 'slate',
        action: 'Maintain active standing auto-debit on all open accounts.'
      },
      missed_payments: {
        value: profile.missed_payments,
        status: profile.missed_payments === 0 ? 'Clean Record' : 'Attention Needed',
        color: profile.missed_payments === 0 ? 'emerald' : 'rose',
        action: profile.missed_payments === 0 ? 'No 30+ DPD late payments detected.' : 'Set up NACH mandates to stop reporting delays to CIBIL.'
      }
    }
  });
});

app.get('/dashboard/analytics', authMiddleware, (req, res) => {
  const user: UserRecord = (req as any).user;
  const store = loadStore();
  const profile = store.profiles.find(p => p.user_id === user.id);
  const userScores = store.scores.filter(s => s.user_id === user.id).sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const userSnapshots = store.snapshots.filter(s => s.user_id === user.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const scoreTimeline = userScores.map(s => {
    const d = new Date(s.recorded_at);
    return {
      id: s.id,
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      shortDate: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      score: s.credit_score,
      source: s.source
    };
  });

  const limit = profile?.total_credit_limit || 0;
  const debt = profile?.total_debt || 0;
  const usedCredit = limit > 0 ? Math.min(debt, limit) : debt;
  const availableCredit = limit > 0 ? Math.max(0, limit - usedCredit) : 0;

  res.json({
    score_timeline: scoreTimeline,
    utilization_breakdown: [
      { name: 'Used Credit', value: Math.round(usedCredit), color: '#f43f5e' },
      { name: 'Available Credit', value: Math.round(availableCredit), color: '#10b981' }
    ],
    utilization_percentage: profile?.credit_utilization || 0,
    total_credit_limit: limit,
    snapshots: userSnapshots.map(s => ({
      date: new Date(s.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      income: s.income,
      expenses: s.expenses,
      debt: s.debt,
      savings: s.savings,
      dti: s.dti,
      utilization: s.utilization
    }))
  });
});

// --- AI ADVISOR GEMINI ROUTE ---
app.post('/ai/analyze', authMiddleware, async (req, res) => {
  const user: UserRecord = (req as any).user;
  const store = loadStore();
  const profile = store.profiles.find(p => p.user_id === user.id);
  if (!profile) {
    return res.status(400).json({ detail: 'Please set up your financial profile first.' });
  }

  const userScores = store.scores.filter(s => s.user_id === user.id).sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  const score = userScores[0]?.credit_score || 680;
  const apiKey = process.env.GEMINI_API_KEY;

  const userPayload = {
    name: user.name,
    credit_score: score,
    monthly_income: profile.monthly_income,
    monthly_expenses: profile.monthly_expenses,
    total_debt: profile.total_debt,
    monthly_debt_payment: profile.monthly_debt_payment,
    total_credit_limit: profile.total_credit_limit,
    credit_utilization: profile.credit_utilization,
    dti_ratio: profile.dti_ratio,
    active_loans: profile.active_loans,
    missed_payments: profile.missed_payments,
    financial_goal: profile.financial_goal,
    note: req.body.custom_note || ''
  };

  let aiAdvice: any = null;

  // Call Google GenAI SDK if real API key configured
  if (apiKey && !apiKey.startsWith('your-') && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI();
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are Credit Assistant, an educational financial wellness AI for India. Analyze this user's financial profile: ${JSON.stringify(userPayload)}.
                Respond strictly with valid JSON with keys:
                overall_assessment (string),
                risk_factors (array of strings),
                positive_factors (array of strings),
                priority_actions (array of strings),
                five_step_plan (array of objects with step: number, title: string, description: string, target_timeline: string, impact_level: "High"|"Medium"|"Low"),
                monthly_targets (array of objects with month: string, target_metric: string, action_goal: string),
                explanation (string),
                disclaimer (string).
                Do not include markdown ticks or wrap in text.`
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });
      const text = response.text || '';
      aiAdvice = JSON.parse(text);
    } catch (err) {
      console.warn('Gemini API call failed, generating deterministic rule-based advice:', err);
    }
  }

  // High-fidelity deterministic fallback if Gemini key is missing or errored
  if (!aiAdvice) {
    const risks: string[] = [];
    const positives: string[] = [];
    const priorities: string[] = [];

    if (profile.credit_utilization > 50) {
      risks.push(`Credit utilization is elevated at ${profile.credit_utilization}%. High revolving balances compress credit scores.`);
      priorities.push('Pay down high-interest credit card revolving balances to under 30% of card limits.');
    } else {
      positives.push(`Healthy credit utilization of ${profile.credit_utilization}% indicates controlled revolving credit usage.`);
    }

    if (profile.dti_ratio > 35) {
      risks.push(`Debt-to-Income ratio is at ${profile.dti_ratio}%. Over 35% of monthly gross income goes into servicing debt.`);
      priorities.push('Avoid opening new credit accounts or personal loans until existing EMIs subside.');
    } else {
      positives.push(`Comfortable Debt-to-Income ratio of ${profile.dti_ratio}%, ensuring healthy disposable headroom.`);
    }

    if (profile.missed_payments > 0) {
      risks.push(`${profile.missed_payments} missed/delayed payment cycles reported. Payment history accounts for 35% of CIBIL score.`);
      priorities.push('Enable NACH auto-debit standing mandates for all active loans.');
    } else {
      positives.push('Pristine repayment track record with zero late payments in the last 12 months.');
    }

    aiAdvice = {
      overall_assessment: `Based on your reported CIBIL score of ${score}, a DTI of ${profile.dti_ratio}%, and ${profile.credit_utilization}% credit utilization, your financial posture is well-positioned for structured improvement through focused debt reduction and automated on-time repayments.`,
      risk_factors: risks.length > 0 ? risks : ['No critical vulnerabilities detected; maintain regular monitoring.'],
      positive_factors: positives.length > 0 ? positives : ['Established credit footprint ready for structured optimization.'],
      priority_actions: priorities.length > 0 ? priorities : ['Maintain card balances under 30% and build 3-month emergency liquidity.'],
      five_step_plan: [
        {
          step: 1,
          title: "Automate All EMIs via Standing Instructions",
          description: "Payment history constitutes approximately 35% of credit bureau evaluations. Enable standing auto-debits on your primary bank account.",
          target_timeline: "Weeks 1 - 2",
          impact_level: "High"
        },
        {
          step: 2,
          title: "Compress Credit Card Utilization to Under 30%",
          description: `Your current card utilization is ${profile.credit_utilization}%. Pay down card dues before statement generation dates or request a limit increase.`,
          target_timeline: "Months 1 - 3",
          impact_level: "High"
        },
        {
          step: 3,
          title: "Deploy Debt Avalanche on High-Cost Credit",
          description: "Rank liabilities by interest rate. Channel extra savings toward unsecured personal loans and credit cards while continuing base home loan EMIs.",
          target_timeline: "Months 2 - 6",
          impact_level: "High"
        },
        {
          step: 4,
          title: "Build 3-Month Liquid Emergency Buffer",
          description: "Establish a liquid contingency fund in sweep-in fixed deposits or liquid funds to avoid resorting to unsecured credit cards in sudden events.",
          target_timeline: "Months 3 - 9",
          impact_level: "Medium"
        },
        {
          step: 5,
          title: "Quarterly CIBIL Report Audit",
          description: "Review your full bureau report quarterly to confirm closed loans are not misreported as 'Settled' or 'Written Off'.",
          target_timeline: "Quarterly",
          impact_level: "Medium"
        }
      ],
      monthly_targets: [
        { month: "Month 1", target_metric: "Payment Consistency", action_goal: "100% on-time EMI settlement with auto-debit active on all accounts." },
        { month: "Month 2", target_metric: "Credit Card Balances", action_goal: `Reduce revolving debt toward target threshold of 30% utilization.` },
        { month: "Month 3", target_metric: "Debt Consolidation", action_goal: "Clear smallest credit card balance to eliminate recurring interest charges." }
      ],
      explanation: "Generated based on mathematically correlated indicators matching Indian retail lending standards.",
      disclaimer: "AI-generated educational guidance. This platform does not guarantee credit score increments or act as a licensed credit bureau or NBFC."
    };
  }

  // Store recommendation
  store.recommendations.push({
    id: store.recommendations.length + 1,
    user_id: user.id,
    analysis: JSON.stringify(aiAdvice),
    created_at: new Date().toISOString()
  });
  saveStore(store);

  res.json(aiAdvice);
});

app.get('/ai/latest', authMiddleware, (req, res) => {
  const user: UserRecord = (req as any).user;
  const store = loadStore();
  const userRecs = store.recommendations.filter(r => r.user_id === user.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (userRecs.length === 0) return res.json(null);
  try {
    const data = JSON.parse(userRecs[0].analysis);
    data.created_at = userRecs[0].created_at;
    res.json(data);
  } catch {
    res.json(null);
  }
});

// --- STATIC ASSETS & VITE INTEGRATION ---
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Credit Assistant full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
