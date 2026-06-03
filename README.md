<div align="center">

# ⚡ Good Jobs — Backend API

### *The REST API Powering North-East India's Premier Job Portal*

[![Live API](https://img.shields.io/badge/Live%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://good-jobs-backend.onrender.com/api/health)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Backend-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/raunak0400/Good-Jobs-Frontend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Resend](https://img.shields.io/badge/Email-Resend-000000?style=for-the-badge&logo=mail.ru&logoColor=white)](https://resend.com)
[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

<br/>

> A clean, production-ready Express.js REST API — serving job listings, accommodation data, form submissions, and CV delivery via email attachment.

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🗂️ Project Structure](#️-project-structure)
- [🔌 API Reference](#-api-reference)
- [📬 Email & CV Delivery](#-email--cv-delivery)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 Getting Started](#-getting-started)
- [☁️ Deployment](#️-deployment)
- [🛡️ Security](#️-security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🗃️ **Job Listings API** | Full CRUD-ready routes for browsing and filtering jobs |
| 🏠 **Accommodation API** | Verified PG, hostel, and apartment listings with filtering |
| 📄 **CV Email Delivery** | Resumes uploaded as base64 are emailed as attachments via Resend |
| 📝 **Form Submissions** | Job posting, room listing, general enquiry — all validated and stored |
| 📧 **Newsletter Subscriptions** | Email collection with duplicate detection |
| 🏥 **Health Check Endpoint** | `/api/health` for uptime monitoring |
| 🔒 **Input Validation** | Server-side required-field validation on all POST routes |
| 🌐 **CORS Configured** | Open CORS for frontend clients on any domain |
| 📝 **Request Logging** | Timestamped logs for every inbound request |
| 🚀 **Render-ready** | Zero-config deployment to Render.com |

---

## 🗂️ Project Structure

```
backend/
├── server.js                   ← Express app entry point, middleware, route mounting
│
├── routes/
│   ├── jobs.js                 ← GET /api/jobs, GET /api/jobs/:id
│   ├── accommodation.js        ← GET /api/accommodation, GET /api/accommodation/:id
│   └── contact.js              ← POST routes: job, room, general, apply, enquire, resume, newsletter
│
├── data/
│   ├── jobs.js                 ← Static seed data — 15+ job listings
│   ├── accommodation.js        ← Static seed data — accommodation listings
│   └── submissions.js          ← In-memory store for form submissions
│
├── create-preset.js            ← Dev utility script
├── .env.example                ← Environment variable template
├── .env                        ← Your local secrets (git-ignored)
├── package.json
└── README.md
```

---

## 🔌 API Reference

**Base URL:** `https://good-jobs-backend.onrender.com/api`

---

### 🩺 Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "Good Jobs API",
  "version": "1.0.0",
  "timestamp": "2025-06-03T01:30:00.000Z",
  "environment": "production"
}
```

---

### 💼 Jobs

#### List All Jobs

```http
GET /api/jobs
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | `string` | Search by title, company, area, or skills |
| `city` | `string` | Filter by city (e.g. `Ahmedabad`) |
| `industry` | `string` | Filter by industry (e.g. `IT & Technology`) |
| `type` | `string` | Filter by job type (`Full-time`, `Part-time`, `Contract`) |
| `salary` | `number` | Minimum monthly salary in ₹ (e.g. `20000`) |

**Example Request:**
```http
GET /api/jobs?city=Ahmedabad&type=Full-time&salary=20000
```

**Example Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": 1,
      "title": "Frontend Developer",
      "company": "TechCorp India",
      "city": "Ahmedabad",
      "area": "Navrangpura",
      "industry": "IT & Technology",
      "type": "Full-time",
      "salaryMin": 25000,
      "salaryDisplay": "₹25,000 – ₹35,000/mo",
      "skills": ["React", "JavaScript", "CSS"],
      "posted": "2 days ago",
      "openings": 2,
      "desc": "...",
      "requirements": ["..."],
      "benefits": ["..."],
      "logo": "TC",
      "logoColor": "#0d9488"
    }
  ]
}
```

---

#### Get Single Job

```http
GET /api/jobs/:id
```

**Example Request:**
```http
GET /api/jobs/1
```

**Response:** Same job object as above, wrapped in `{ "success": true, "data": { ... } }`

**Error (404):**
```json
{ "success": false, "message": "Job not found" }
```

---

### 🏠 Accommodation

#### List All Accommodation

```http
GET /api/accommodation
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | `string` | Search by name or area |
| `city` | `string` | Filter by city |
| `type` | `string` | `PG`, `Hostel`, or `Apartment` |
| `gender` | `string` | `Male`, `Female`, or `Any` |
| `price` | `number` | Maximum monthly rent in ₹ |

**Example Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "name": "Sunrise PG",
      "city": "Ahmedabad",
      "area": "Satellite",
      "type": "PG",
      "gender": "Female",
      "price": 7500,
      "distance": "1.2 km from Crossword",
      "amenities": ["WiFi", "AC", "Meals", "Laundry"],
      "rating": 4.6,
      "ownerName": "Priya Shah",
      "ownerPhone": "+91 98765 43210"
    }
  ]
}
```

---

#### Get Single Accommodation

```http
GET /api/accommodation/:id
```

---

### 📋 Contact & Forms

#### Post a Job Vacancy

```http
POST /api/contact/job
Content-Type: application/json
```

**Required Body Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `companyName` | `string` | Company name |
| `companyEmail` | `string` | Contact email |
| `jobTitle` | `string` | Job title |
| `jobCity` | `string` | Job location city |
| `jobIndustry` | `string` | Industry category |
| `jobType` | `string` | `Full-time` / `Part-time` / `Contract` |
| `jobDesc` | `string` | Role description |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job listing submitted! Our team will review and publish it within 24 hours.",
  "data": { "id": "uuid", "createdAt": "2025-06-03T..." }
}
```

---

#### List Accommodation

```http
POST /api/contact/room
Content-Type: application/json
```

**Required Body Fields:** `propName`, `ownerName`, `ownerPhone`, `propType`, `propGender`, `propCity`, `propPrice`, `propAddress`

---

#### General Enquiry

```http
POST /api/contact/general
Content-Type: application/json
```

**Required Body Fields:** `genName`, `genEmail`, `genSubject`, `genMessage`

---

#### Submit Job Application (CV via Email)

```http
POST /api/contact/resume
Content-Type: application/json
```

**Required Body Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `applicantName` | `string` | Full name of the applicant |
| `applicantEmail` | `string` | Applicant's email |
| `applicantPhone` | `string` | Phone number (optional) |
| `coverNote` | `string` | Cover letter text (optional) |
| `jobId` | `number` | Target job ID |
| `jobTitle` | `string` | Target job title |
| `fileName` | `string` | Original filename of the CV |
| `fileSize` | `string` | Human-readable size (e.g. `"245 KB"`) |
| `fileBase64` | `string` | Base64-encoded PDF/Word file content |

> **Note:** Maximum file size is **5 MB** (enforced server-side). The CV is emailed as an attachment via the Resend API.

---

#### Accommodation Enquiry

```http
POST /api/contact/enquire
Content-Type: application/json
```

**Required Body Fields:** `enquirerName`, `enquirerEmail`, `accId`, `accName`
**Optional:** `enquirerPhone`, `message`

---

#### Newsletter Subscription

```http
POST /api/newsletter
Content-Type: application/json
```

**Body:**
```json
{ "email": "user@example.com" }
```

---

### ❌ Error Responses

All error responses follow this shape:

```json
{
  "success": false,
  "message": "Descriptive error message here"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad Request — missing or invalid fields |
| `404` | Not Found — resource doesn't exist |
| `500` | Internal Server Error — unexpected failure |

---

## 📬 Email & CV Delivery

The `/api/contact/resume` endpoint handles CV delivery without storing any files:

```
Applicant uploads PDF/Word on frontend
        ↓
File converted to base64 in the browser
        ↓
POST /api/contact/resume  (JSON payload with base64 string)
        ↓
Server validates fields & file size (≤ 5 MB)
        ↓
Resend API called → email sent with CV as attachment
        ↓
201 success returned to frontend
```

**Email includes:**
- Job title and ID
- Applicant name, email, and phone
- Cover note / message
- Attached CV (PDF or Word)

Configure the destination inbox via `NOTIFICATION_EMAIL` in your `.env`.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `3000`). Render sets this automatically. |
| `NODE_ENV` | No | `development` or `production` |
| `RESEND_API_KEY` | **Yes** (for email) | Your [Resend](https://resend.com) API key |
| `NOTIFICATION_EMAIL` | **Yes** (for email) | Where CV application emails are delivered |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name (for future file hosting) |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore` by default.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 18.0.0`
- **npm** `>= 9.0.0`
- A [Resend](https://resend.com) account and API key (for email features)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/raunak0400/Good-Jobs-Frontend.git
cd Good-Jobs-Frontend/backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your RESEND_API_KEY and NOTIFICATION_EMAIL

# 4. Start the development server (with auto-reload)
npm run dev

# — OR — start in production mode
npm start
```

The server will start at **http://localhost:3000**

```
🚀 Good Jobs API running on http://localhost:3000
   Health check: http://localhost:3000/api/health
   Jobs:         http://localhost:3000/api/jobs
   Accommodation:http://localhost:3000/api/accommodation
```

### Quick Test

```bash
# Health check
curl http://localhost:3000/api/health

# Get all jobs
curl http://localhost:3000/api/jobs

# Get job #1
curl http://localhost:3000/api/jobs/1

# Filter jobs
curl "http://localhost:3000/api/jobs?type=Full-time&salary=20000"
```

---

## ☁️ Deployment

### Deploy to Render (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repository
4. Set the following:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Node Version** | `18` |

5. Add your environment variables in the Render dashboard
6. Click **Deploy** — your API will be live in minutes

> Render automatically sets the `PORT` environment variable.

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

railway login
railway init
railway up
```

---

## 🛡️ Security

- **No secrets in code** — all credentials via environment variables
- **File size enforcement** — base64 payloads over 7 MB (≈ 5 MB file) are rejected before processing
- **Input validation** — all POST endpoints validate required fields before any logic runs
- **No file storage** — CVs are never written to disk; they go straight from memory to email
- **CORS** — currently open (`*`) for flexibility with the static frontend; restrict to your frontend domain in production

To report a vulnerability, see [SECURITY.md](./SECURITY.md).

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Good-Jobs-Frontend.git

# Create a feature branch
git checkout -b feat/your-feature

# Make changes, then commit
git commit -m "feat: describe your change"

# Push and open a PR
git push origin feat/your-feature
```

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Good Jobs Backend API** · Built with [Express.js](https://expressjs.com) · Deployed on [Render](https://render.com) · Email by [Resend](https://resend.com)

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com)
[![Resend](https://img.shields.io/badge/Resend-000000?style=flat-square)](https://resend.com)

*Empowering North-East India's Workforce — One API Call at a Time*

</div>
