# Travel Tourism

A beginner-friendly, full-stack travel discovery and trip-request website built with HTML, CSS, Vanilla JavaScript, Node.js, Express, and Supabase PostgreSQL.

## 1. Project overview

Travel Tourism helps visitors explore a curated set of destinations, filter and search places, read destination details, and submit a trip request. The backend stores trip requests in Supabase PostgreSQL.

**Problem statement:** Travel ideas and trip enquiries can be scattered across different sources. This small application gives visitors one place to browse sample destinations and send a structured request.

**Target users:** Visitors planning a trip. This MVP does not include customer accounts, payments, live availability, or an administrator dashboard.

## 2. Objectives and features

- Responsive destination discovery page.
- Search by destination, country, description, or category.
- Category filters for Mountains, Beach, and Culture.
- Destination detail dialog.
- Trip request form with name, email, destination, departure date, travellers, and optional notes.
- Server-side validation and persistent booking requests in PostgreSQL.
- API health check, security headers, and request rate limits.
- Sample destination records inserted by the SQL schema.

Prices are sample inspiration estimates only. They are not live quotes or guaranteed prices. No external API is required for core functionality.

## 3. Technology stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js and Express.js
- Database: Supabase PostgreSQL
- Security/utility packages: `helmet`, `express-rate-limit`, `dotenv`, `@supabase/supabase-js`
- Version control: Git and GitHub

## 4. Folder structure

```text
travel-tourism/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── routes/
│   │   ├── bookings.js
│   │   └── destinations.js
│   ├── server.js
│   ├── supabase.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

`backend/.env` is created locally by you and is not included in the ZIP because it must contain your own secret credentials.

## 5. Prerequisites

Install these tools on Windows:

- Node.js LTS (includes npm): https://nodejs.org/
- Visual Studio Code: https://code.visualstudio.com/
- Git: https://git-scm.com/downloads
- Supabase account: https://supabase.com/

Verify Node and npm in a terminal:

```bash
node --version
npm --version
git --version
```

Use Node.js 20 or later.

## 6. Configure Supabase

1. Sign in to https://supabase.com/ and create a new project.
2. Save your database password somewhere safe; this project uses the Supabase HTTPS API, so the database password is not put in this app's `.env`.
3. In your project dashboard, open **SQL Editor**, create a query, and paste all of `database/schema.sql`.
4. Run the query. Open **Table Editor** and confirm that `destinations` and `bookings` exist and that the destination table has six sample records.
5. Open **Project Settings → API** (the exact dashboard wording may change). Copy the Project URL and the server-side `service_role`/secret key. Do not copy it into frontend files or publish it.

### Environment file

From the project root, copy `backend/.env.example` to `backend/.env`. On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Open `backend/.env` and replace the example values:

```dotenv
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_REAL_SERVER_SIDE_SECRET_KEY
```

- `PORT`: local web server port.
- `NODE_ENV`: set to `development` locally.
- `SUPABASE_URL`: project URL shown in Supabase settings.
- `SUPABASE_SERVICE_ROLE_KEY`: privileged server-only key. Keep it in `backend/.env`, never in browser JavaScript, HTML, GitHub, screenshots, or public documentation.

`.env.example` contains placeholders and is safe to commit. `.env` contains your private credentials and must remain ignored by Git. If a secret is exposed, rotate it immediately in Supabase.

## 7. Install and run

Open the `travel-tourism` root folder in VS Code. Open **Terminal → New Terminal** and run:

```powershell
cd backend
npm install
npm run check
npm start
```

`npm install` downloads the packages. `npm run check` checks JavaScript syntax. `npm start` starts the Express server. Successful startup prints:

```text
Travel Tourism is running at http://localhost:3000
```

Open http://localhost:3000 in your browser. Do not open `frontend/index.html` directly, because the page calls the backend API.

Test the API health endpoint at http://localhost:3000/api/health. Expected response:

```json
{"status":"ok","service":"travel-tourism-api"}
```

If the server says credentials are missing, verify the values in `backend/.env` and restart the server. If destinations do not load, confirm that the SQL schema ran in the same Supabase project as the URL/key in `.env`.

For development auto-restart, use `npm run dev` instead of `npm start`.

## 8. Architecture and workflows

1. The browser loads the HTML, CSS, and browser JavaScript served by Express.
2. The frontend calls `GET /api/destinations` with `fetch()`.
3. Express queries the `destinations` table through the Supabase server-side client.
4. A visitor chooses a destination and submits the trip request form.
5. Express validates all fields and confirms that the selected destination is active.
6. Express inserts the request into `bookings` and returns a reference code.

The service key is used only on the backend. Row Level Security is enabled and no public table policies are added; the frontend never connects directly to Supabase.

## 9. REST API reference

All successful responses are JSON. Public browsing endpoints do not require login. The trip-request endpoint is public but rate-limited.

| Method | Path | Purpose | Input | Success |
|---|---|---|---|---|
| GET | `/api/health` | Check server status | None | `200` with status |
| GET | `/api/destinations` | List active destinations | None | `200` with `destinations` array |
| GET | `/api/destinations/:slug` | Get one active destination | Slug in URL | `200` with `destination`; `404` if missing |
| POST | `/api/bookings` | Submit a trip request | JSON: `name`, `email`, `destination_id`, `travel_date`, `travellers`, optional `notes` | `201` with booking reference |

Example request body:

```json
{
  "name": "Asha Rao",
  "email": "asha@example.com",
  "destination_id": "replace-with-a-real-destination-uuid",
  "travel_date": "2027-02-15",
  "travellers": 2,
  "notes": "Interested in local food and walking tours"
}
```

Use the actual destination UUID returned by `GET /api/destinations`; the example UUID is intentionally not a real record.

Common errors: `400` for invalid input or unavailable destination, `404` for an unknown destination slug/API path, `429` when rate-limited, and `500` for a server/database failure. The API does not provide public endpoints for reading or editing submitted bookings.

## 10. Test the application

- [ ] `/api/health` returns `200` and JSON.
- [ ] Home page loads from `http://localhost:3000`.
- [ ] Destination cards load from the database.
- [ ] Search narrows the cards; clearing search restores results.
- [ ] Category filters work.
- [ ] Clicking a destination opens details.
- [ ] Submitting a valid future trip request returns a reference and creates a row in `bookings`.
- [ ] Empty name/email/destination/date are rejected by browser validation.
- [ ] Invalid email, traveller count, date, notes length, or destination ID are rejected by the server.
- [ ] Refresh the Supabase Table Editor and confirm the request persisted.
- [ ] Test at mobile and desktop widths.
- [ ] Confirm `.env` and `node_modules/` are not staged by Git.

Do not use a real person's private contact details while testing. This project has not been connected to your Supabase project; you must run these checks with your own credentials.

## 11. Troubleshooting

**`npm` is not recognized:** Install Node.js LTS, close and reopen the terminal, and run `node --version` and `npm --version`.

**`Cannot find module`:** Make sure the terminal is inside `travel-tourism/backend` and run `npm install`.

**Supabase destinations request fails:** Check the Project URL/key, confirm `database/schema.sql` ran successfully, and verify the tables are in the same Supabase project. Read the backend terminal for diagnostic information; do not show secret values in screenshots.

**Port 3000 is busy:** Change `PORT=3001` in `backend/.env`, restart, and open `http://localhost:3001`.

**No destinations match:** Clear the search field or choose “All places.”

**Booking date rejected:** Choose today's date or a future date. The server validates the date independently.

**Browser shows a network error:** Start the Express server and open the site through its localhost URL, not as a `file://` page.

## 12. Git and GitHub

1. Create an empty repository at https://github.com/new. Do not add a README there if you already have this README locally.
2. In a terminal at the project root:

```bash
git init
git status
git add .
git status
git commit -m "Build Travel Tourism project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your repository's actual URL. Sign in when GitHub asks. Before committing, make sure `backend/.env` and all `node_modules/` folders are ignored and `backend/.env.example` is included. If you accidentally commit a secret, removing the file in a later commit is not enough: rotate the credential and remove it from Git history as appropriate.

## 13. Security notes and limitations

- Server-side validation, security headers, and rate limits are included.
- The service-role key has broad database privileges. Keep the backend private and protect deployment configuration.
- This MVP has no accounts, admin dashboard, payments, live hotel/transport availability, email notifications, or live pricing.
- Public visitors can submit trip requests; rate limiting helps reduce abuse but is not a complete anti-spam solution. For a production deployment, add stronger abuse prevention, a private staff workflow, retention/deletion rules for personal data, monitoring, and a deployment-specific Content Security Policy.
- Sample destinations and prices are illustrative. Confirm real travel information independently before making travel decisions.

## 14. Future improvements

- Add authenticated staff dashboard to review and update trip requests.
- Add trip packages and seasonal pricing managed by an administrator.
- Add email confirmations through a properly configured provider.
- Add tests and a deployment pipeline.
