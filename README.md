# Brandora AI

**Intelligent Brand Governance Platform**\
*Every claim checked. Every brand aligned.*

Brandora AI is a web application designed to help teams manage brand
guidelines and check content for potential brand-compliance issues
before publication. It combines brand profiles, rule-based checks,
AI-assisted analysis, and review-related workflows in one place.

## Live Demo

-   **Frontend:** https://brandora-ai-chi.vercel.app/
-   **Backend API:** https://brandora-ai.onrender.com
-   **Health check:** https://brandora-ai.onrender.com/api/health
-   **Brands endpoint:** https://brandora-ai.onrender.com/api/brands

> The backend health and brands endpoints have responded successfully
> during development. The deployed frontend has also had CORS and
> hardcoded `localhost` API URL issues under investigation, so test the
> live workflows before relying on the demo.

## Features

-   **Brand profile management:** Create, view, update, and delete brand
    profiles.
-   **Brand knowledge fields:** Store a brand name, industry, tone,
    preferred terms, prohibited phrases, and approved claims.
-   **Compliance checking:** Rule-based checks for brand terminology and
    prohibited phrases, with severity-based findings.
-   **AI-assisted analysis:** AI service integration is part of the
    project to support content review.
-   **Review-related API routes:** Backend routes are available for
    approvals.
-   **Audit-related API routes:** Backend routes are available for audit
    activity.
-   **Persistent storage:** Brand records are stored in Firebase
    Firestore.
-   **Separate deployment:** Frontend hosted on Vercel and backend
    hosted on Render.

Some workflows, including deployed approvals, audit visibility, and full
end-to-end compliance checks, still need verification.

## Technology Stack

  Area               Technology
  ------------------ --------------------------------------
  Frontend           React, Vite
  Backend            Node.js, Express
  Database           Firebase Firestore
  AI integration     OpenRouter-based service integration
  Frontend hosting   Vercel
  Backend hosting    Render

## Project Structure

The repository structure may vary slightly depending on your current
branch. The main areas include:

``` text
Brandora-AI/
├── public/
├── src/
│   ├── api.js
│   └── features/
│       ├── approvals/
│       ├── audit/
│       └── compliance/
├── server/
│   ├── index.js
│   └── src/
│       ├── config/
│       ├── routes/
│       └── services/
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project locally:

-   Node.js and npm
-   A Firebase project with Firestore enabled
-   Firebase Admin credentials for the backend
-   An OpenRouter API key if using the AI-assisted features

### 1. Clone the repository

``` bash
git clone https://github.com/RishabVelip47/Brandora-AI.git
cd Brandora-AI
```

### 2. Install frontend dependencies

From the repository root, run:

``` bash
npm install
```

### 3. Configure the frontend

Create a `.env` file in the frontend project root:

``` env
VITE_API_URL=http://localhost:5000/api
```

For the deployed frontend, configure this variable in **Vercel → Project
Settings → Environment Variables**:

``` env
VITE_API_URL=https://brandora-ai.onrender.com/api
```

Vite environment variables beginning with `VITE_` are included in the
browser build. Only put public configuration such as the API base URL in
them. **Never put API keys or Firebase service-account credentials in
frontend environment variables.**

After changing Vercel environment variables, create a new deployment so
the updated value is included in the frontend build.

### 4. Configure the backend

Create the backend environment file at the path expected by the Firebase
configuration in your current code. In the existing project setup, the
Firebase configuration loads `server/.env`.

Example environment variables:

``` env
PORT=5000
FRONTEND_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your-firebase-project-id
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openrouter/free
OPENROUTER_FALLBACK_MODEL=openrouter/free
```

For Render, set the frontend origin to:

``` env
FRONTEND_URL=https://brandora-ai-chi.vercel.app
```

Firebase Admin authentication must also be configured for your
deployment. Use the credential method already implemented in
`server/src/config/firebase.js` (for example, application-default
credentials or the server-side service-account configuration supported
by your current version). Keep all credentials private and server-side.

Do not commit `.env` files or secrets to GitHub. Add them to
`.gitignore`.

### 5. Run the backend

Open a terminal:

``` bash
cd server
npm install
npm start
```

The API should start on port `5000` unless `PORT` is configured
differently.

### 6. Run the frontend

In a separate terminal, from the repository root:

``` bash
npm run dev
```

Open the local Vite URL printed in the terminal, commonly
`http://localhost:5173`.

If your frontend is in a nested directory in your current checkout, run
the frontend commands from the directory containing its `package.json`.

## API Endpoints

The following endpoints are present in the backend implementation:

  Method   Endpoint              Purpose
  -------- --------------------- -------------------------
  GET      `/api/health`         Check backend status
  GET      `/api/brands`         Retrieve all brands
  GET      `/api/brands/:id`     Retrieve one brand
  POST     `/api/brands`         Create a brand
  PUT      `/api/brands/:id`     Update a brand
  DELETE   `/api/brands/:id`     Delete a brand
  `/`      `/api/compliance/*`   Compliance route module
  `/`      `/api/approvals/*`    Approval route module
  `/`      `/api/audit/*`        Audit route module

The specific sub-routes for compliance, approvals, and audit are defined
in their respective files under `server/src/routes/`.

### Example: Create a brand

``` http
POST /api/brands
Content-Type: application/json
```

``` json
{
  "name": "Green Tech",
  "industry": "Information Technology",
  "tone": "Friendly & professional",
  "preferredTerms": ["sustainable"],
  "prohibitedPhrases": ["Risk Free"],
  "approvedClaims": ["AI at the future"]
}
```

## Deployment

### Frontend --- Vercel

1.  Import the GitHub repository into Vercel.
2.  Select the directory containing the frontend `package.json`.
3.  Use the Vite framework preset.
4.  Set the build command to `npm run build`.
5.  Set the output directory to `dist`.
6.  Configure `VITE_API_URL` to the deployed Render API base URL.
7.  Redeploy after environment-variable changes.

### Backend --- Render

1.  Create a Web Service connected to the GitHub repository.
2.  Set the root directory to `server` if the backend `package.json` is
    inside `server/`.
3.  Use `npm install` as the build command.
4.  Use `npm start` as the start command.
5.  Configure Firebase and AI credentials in Render's environment
    settings.
6.  Set `FRONTEND_URL` to the exact deployed Vercel origin.
7.  Deploy and test `/api/health`.

## Troubleshooting

### CORS error in the browser

-   Ensure `FRONTEND_URL` exactly matches
    `https://brandora-ai-chi.vercel.app`.
-   Ensure the backend CORS allowlist includes that origin.
-   Ensure CORS middleware runs before API routes.
-   Redeploy the Render backend after changing its configuration.

### Requests go to `localhost:5000` on the deployed site

Search the frontend project for `localhost:5000` using your editor's
global search. Localhost should only be used as a development fallback.
All deployed feature modules (brands, approvals, audit, and compliance)
should use the same API base URL.

### Backend health check fails

-   Check the Render deployment status and latest logs.
-   Verify the service's start command and root directory.
-   Confirm required Firebase environment variables and credentials are
    present.

### Brands endpoint works directly but not from the website

This usually points to browser CORS configuration or a frontend API URL
mismatch. Check the browser Developer Tools **Console** and **Network**
tabs.

## Team

  Member             Role
  ------------------ ------------------------------
  Rishab Velip       Backend and database
  Mackson Gomes      AI and compliance
  Pandurang Prabhu   Frontend and user experience

## Future Improvements

Planned improvements for the next development round include:

-   Fix and verify all deployed API connections.
-   Add authentication and role-based permissions for creators,
    reviewers, and managers.
-   Improve error handling, loading states, and request reliability.
-   Add stronger end-to-end tests and compliance evaluation examples.
-   Verify approval workflows, audit events, and content history.
-   Add analytics for recurring compliance issues.
-   Explore PDF/DOCX processing, visual brand-asset checks, multilingual
    review, and publishing integrations.

## Security Notes

-   Never commit `.env` files, API keys, or Firebase service-account
    credentials.
-   Keep AI provider calls and privileged Firebase operations on the
    backend.
-   CORS is not authentication. Add authentication and authorization
    before using the API with sensitive data or as a public production
    service.

## License

No license has been specified yet. Add a `LICENSE` file if you intend to
distribute the project under an open-source license.
