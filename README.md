# Good Jobs Backend

<p align="center">
  <strong>Data layer and mock API for the Good Jobs platform.</strong>
</p>

## Overview
This repository contains the backend infrastructure for the **Good Jobs** platform, an initiative designed to help the North-East Indian workforce easily find verified jobs and safe accommodation in Ahmedabad.

Currently, this backend serves as a mock API, using local JSON-like data (`.js` files) to quickly iterate on the frontend UI without the overhead of a full database during the MVP phase. It runs a simple Express server to expose the data via REST endpoints.

## Tech Stack
- **Node.js** (Runtime environment)
- **Express.js** (Web framework for REST APIs)
- **CORS** (Middleware for cross-origin requests)
- **dotenv** (Environment variable management)

## Getting Started

### Prerequisites
- Node.js (v16.x or later)
- npm (Node Package Manager)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/raunak0400/Good-Jobs-Backend.git
   cd Good-Jobs-Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   (Make sure the `PORT` is set correctly. The frontend expects the backend to run on port 5000 by default.)

### Running the Server
Start the development server:
```bash
npm start
```
The server will start listening at `http://localhost:5000`.

## API Endpoints
- `GET /api/jobs`: Returns all job listings.
- `GET /api/jobs/:id`: Returns details for a specific job.
- `GET /api/accommodation`: Returns all accommodation listings.
- `GET /api/accommodation/:id`: Returns details for a specific accommodation.

## Project Structure
- `server.js`: The main Express server entry point.
- `data/`: Contains mock mock data for `jobs.js` and `accommodation.js`.
- `routes/`: Contains Express routers for `/api/jobs` and `/api/accommodation`.
- `create-preset.js`: Script for generating initial seed data.

## Contributing
We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
