# OFHAS – Organisational Financial Health Assessment System

This project is a full-stack web application built with Vue3, Express, Supabase, and TailwindCSS. It offers a financial health assessment based on the 7 Pillars of Financial Health developed by Ray Partridge.

## Project Structure

- **client/** – Vue3 frontend (Vite + TailwindCSS)
- **api/** – Express backend API (to be deployed as serverless functions on Vercel)
- **vercel.json** – Vercel configuration

## Prerequisites

- Node.js installed
- Vercel CLI installed globally (`npm i -g vercel`)
- A Supabase account with your URL and keys

## Setup

### Supabase Environment Variables

Create a `.env` file in the `api/` folder with:
SUPABASE_URL=your_supabase_url SUPABASE_SERVICE_KEY=your_supabase_service_key

### Running Locally

#### Frontend (client)

cd client
npm install
npm run dev

#### Backend (api)

cd api
npm install
node server.js