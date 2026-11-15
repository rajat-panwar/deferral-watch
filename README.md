# Deferral Watch

A triage dashboard for **aircraft maintenance deferrals (MEL items)**.

## The problem
Airlines may legally dispatch an aircraft with certain defects *deferred* under the Minimum Equipment List, but each deferral has a hard repair deadline (Cat A–D). Missing a deadline grounds the aircraft. The information is usually scattered across lists that don't answer the real question: **"what will bite us soonest, and what has already been dealt with?"**

## The user
A **Maintenance Control operations manager** planning the day. They need to (1) see fleet-level risk at a glance, (2) find the most urgent items, (3) act: assign an engineer, schedule rectification, or request an extension.

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # vitest + Testing Library + jest-axe
npm run build    # typecheck + production build
```