# BillNova Billing App

BillNova is a multi-tenant GST billing frontend built with React, TypeScript, and Vite. It is designed for Indian small and mid-sized businesses that need fast invoice generation, customer master management, payment tracking, and sales return handling.

## Core capabilities

- GST invoice creation with intra-state and inter-state tax handling
- Customer and vendor master management
- Product, category, and tax masters
- Invoice history and printable invoice view
- Payment recording with partial and full settlement support
- Sales returns
- Role-based menu access from the auth backend

## Tech stack

- React 19
- TypeScript
- Vite
- Bootstrap 5
- Axios
- Vitest

## Environment setup

Create a `.env` file in the project root from `.env.example`.

```env
VITE_APP_NAME=BillNova
VITE_API_BASE_URL=https://your-api-host.example.com
VITE_DEFAULT_TENANT_SLUG=billnova
VITE_SELLER_STATE=Maharashtra
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test:run
```

## Runtime requirements

- Node.js 20 or newer is recommended

## Deployment notes

- `VITE_API_BASE_URL` should point to your production API gateway or backend host.
- `VITE_DEFAULT_TENANT_SLUG` is used for local development and non-subdomain hosts.
- `VITE_SELLER_STATE` controls GST seller-state comparisons used in invoice rendering.

## Current scope

This repository contains the frontend application. It expects compatible backend services for auth, invoice, payment, master-data, and reporting endpoints.
