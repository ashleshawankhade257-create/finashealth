# Credit Assistant

### AI-Powered Credit Health & Financial Wellness Platform for India

Credit Assistant is a full-stack financial wellness and credit intelligence platform tailored for Indian retail borrowers. It tracks reported CIBIL scores (300–900), computes vital lending indicators (Debt-to-Income Ratio, Credit Card Utilization, Disposable Liquidity Surplus), provides interactive "what-if" liability simulators, and leverages **Google Gemini 2.5 Flash** to diagnose financial bottlenecks and generate prioritized 5-step debt reduction roadmaps.

---

## Key Features

1. **Authentication & Identity**:
   - **Google OAuth 2.0 / OpenID Connect**: Seamless "Continue with Google" sign-in using official Google consent flows without storing Google passwords.
   - **Email & Password Authentication**: Cryptographically secured with 100,000 iterations of PBKDF2-HMAC-SHA256 with unique cryptographic salts.
   - **1-Click Demo Account**: Instant test login (`demo@creditassistant.in` / `DemoPassword123!`) preloaded with an active CIBIL score (680) and debt parameters.

2. **10-Step Financial Onboarding Wizard**:
   - Step-by-step guidance capturing monthly income, living expenses, credit card sanctioned limits, total debt, active EMIs, and missed payments.
   - Strict validation preventing negative income/debt entries.

3. **Core Financial Bureau Calculations**:
   - **Debt-to-Income (DTI)**: $\text{DTI} = \frac{\text{Monthly Debt Payments}}{\text{Monthly Gross Income}} \times 100$
   - **Credit Card Utilization**: $\text{Utilization} = \frac{\text{Outstanding Balances}}{\text{Total Sanctioned Limit}} \times 100$
   - **Monthly Savings Cushion**: $\text{Savings} = \text{Monthly Income} - \text{Monthly Expenses} - \text{Monthly EMIs}$

4. **Interactive Dashboard**:
   - Visual CIBIL semi-circular Score Gauge with real-time score delta indicators (`+24 points since previous update`).
   - Recharts **LineChart** displaying historical score progression.
   - Recharts **PieChart** showing used vs. available revolving credit limits.
   - Pillar metric cards with actionable tips and risk statuses.

5. **AI Financial Advisor (Google Gemini 2.5 Flash)**:
   - Dedicated AI service layer feeding structured financial data to Gemini.
   - Structured JSON response returning executive assessment, top risk factors, positive achievements, priority actions, a 5-step roadmap, and monthly target milestones.
   - Deterministic rule-based fallback when AI models are unavailable.

6. **"What-If" Credit Simulator**:
   - Dynamic liability paydown and credit card limit enhancement sliders to simulate indicator improvements before executing real-world payments.

---

## Technology Stack

- **Frontend**:
  - React 19 SPA
  - Vite
  - React Router v7
  - Tailwind CSS v4
  - Recharts
  - Lucide React
  - Axios

- **Backend**:
  - Python FastAPI & Node.js Express full-stack proxy runner
  - SQLAlchemy ORM
  - SQLite (`credit_assistant.db`)
  - Pydantic v2
  - PyJWT & Cryptographic Hashing
  - Google Gemini API (`@google/genai` and REST)

---

## Project Structure

```
credit-assistant/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         # App configuration & score bands
│   │   │   └── security.py       # PBKDF2 password hashing & JWT tokens
│   │   ├── database/
│   │   │   └── database.py       # SQLAlchemy engine & session factory
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── financial_profile.py
│   │   │   ├── credit_history.py
│   │   │   ├── recommendation.py
│   │   │   └── snapshot.py
│   │   ├── schemas/              # Pydantic validation schemas
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── financial.py
│   │   │   ├── credit.py
│   │   │   ├── recommendation.py
│   │   │   └── ai.py
│   │   ├── services/             # Dedicated business logic layer
│   │   │   ├── auth_service.py
│   │   │   ├── financial_service.py
│   │   │   ├── credit_service.py
│   │   │   └── gemini_service.py
│   │   ├── routers/              # REST API endpoints
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── financial.py
│   │   │   ├── credit.py
│   │   │   ├── dashboard.py
│   │   │   └── ai.py
│   │   └── main.py               # FastAPI application entrypoint
│   ├── requirements.txt
│   └── run.py                    # Uvicorn launcher
├── src/
│   ├── components/
│   │   └── common/               # Navbar, Sidebar, TopHeader, ScoreGauge, MetricCard
│   ├── context/
│   │   └── AuthContext.tsx       # Authentication provider & state
│   ├── layouts/
│   │   └── DashboardLayout.tsx   # Authenticated dashboard layout shell
│   ├── pages/
│   │   ├── LandingPage.tsx       # Public fintech landing page
│   │   ├── LoginPage.tsx         # Sign in with Google or Email/Password
│   │   ├── RegisterPage.tsx      # Sign up with Google or Email/Password
│   │   ├── AuthCallbackPage.tsx  # Google OAuth redirect handler
│   │   ├── OnboardingPage.tsx    # 10-step financial profile setup
│   │   ├── DashboardPage.tsx     # Main dashboard with Recharts
│   │   ├── CreditHealthPage.tsx  # Indicators deep dive & What-If simulator
│   │   ├── AIAdvisorPage.tsx     # Gemini 2.5 Flash roadmap
│   │   ├── ProgressPage.tsx      # Score history & logging
│   │   ├── ProfilePage.tsx       # Update financial parameters
│   │   └── SettingsPage.tsx      # Settings & Google OAuth guide
│   ├── services/
│   │   └── api.ts                # Centralized Axios API client
│   ├── types/                    # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── test_api.py               # Pytest test suite
├── server.ts                     # Full-stack runner & Express router
├── .env.example
├── package.json
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Web Client ID from Google Cloud Console | `your-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Web Client Secret from Google Cloud Console | `your-client-secret` |
| `GOOGLE_REDIRECT_URI` | Google OAuth callback redirect endpoint | `http://localhost:8000/auth/google/callback` |
| `GEMINI_API_KEY` | Google Gemini API Key | Provided via AI Studio secrets or Google AI Studio |
| `GEMINI_MODEL` | Gemini model variant | `gemini-2.5-flash` |
| `DATABASE_URL` | SQLite database URI | `sqlite:///./credit_assistant.db` |
| `SECRET_KEY` | Secret used to sign JWT tokens | Hex random string |
| `FRONTEND_URL` | Frontend origin | `http://localhost:3000` |
| `BACKEND_URL` | Backend origin | `http://localhost:8000` |

---

## Google Cloud Console OAuth Setup

To configure real Google / Gmail Sign-In:

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > OAuth consent screen**.
   - Select **External** (or Internal for Workspace).
   - Fill in App name (*Credit Assistant*), User support email, and Developer contact email.
   - Under **Scopes**, select the minimum necessary: `openid`, `email`, and `profile`.
4. Navigate to **APIs & Services > Credentials**.
   - Click **+ Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Name: *Credit Assistant Web Client*.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:5173`
   - **Authorized redirect URIs**:
     - `http://localhost:8000/auth/google/callback`
     - `http://localhost:3000/auth/callback`
5. Copy your **Client ID** and **Client Secret** into your `.env` file.

*Note: Google authentication redirects users to Google's official login screen. The application never asks for or stores user Gmail passwords.*

---

## Google Gemini AI Setup

1. Obtain a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
2. Set `GEMINI_API_KEY` in your `.env` file.
3. Configure `GEMINI_MODEL=gemini-2.5-flash`.
4. If an API key is not supplied, the platform automatically deploys its deterministic financial intelligence engine so all features remain functional.

---

## Running the Application

### Option 1: AI Studio / Integrated Full-Stack Runner
The full-stack application runs with:

```bash
npm run dev
```

This starts Express and Vite on port `3000`, providing the web interface, API routes, and spawning the FastAPI service in the background.

### Option 2: Standalone FastAPI Backend
To run the Python FastAPI backend separately:

```bash
python3 -m pip install -r backend/requirements.txt
python3 backend/run.py
```

FastAPI will start on `http://127.0.0.1:8000`.
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc UI: `http://localhost:8000/redoc`

### Option 3: Run Backend Tests
Execute the pytest suite:

```bash
pytest tests/
```

---

## Educational Safety Disclaimer

Credit Assistant is an educational financial wellness platform. It is not an authorized credit reporting agency (CIBIL, Experian, Equifax, CRIF High Mark), bank, or Non-Banking Financial Company (NBFC). Calculations represent educational indicators rather than official credit bureau algorithms. Users are encouraged to verify important lending decisions with their bank or certified financial planner.

# finashealth
