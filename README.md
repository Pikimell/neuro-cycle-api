# NeuroCycle API

> Backend for a migraine-tracking health app: patients log attacks, mood, and medication intake, while doctors follow their patients and manage appointments.

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?logo=awslambda&logoColor=white)

## Overview

NeuroCycle helps people with chronic migraine keep a structured health diary and share it with their doctor. This repository is the REST API behind the mobile client: **18 resource groups** with role-based access for **patients, doctors, and admins**, deployed as a single AWS Lambda.

## Domain

| Area | Resources |
| :-- | :-- |
| Accounts | users, patients, doctors (role: `PATIENT` / `DOCTOR` / `ADMIN`) |
| Health profile | allergies, chronic conditions, special considerations |
| Tracking | migraine attacks (triggers, intensity, duration, location, aura), mood entries |
| Treatment | medication schedules, medication intakes (taken / missed) |
| Care | appointments (patient request → doctor confirms), recommendations |
| Questionnaires | templates, questions, responses |
| Diary | aggregated day view: mood, attacks, and notes for a given date |

## Engineering highlights

- **Generic CRUD layer.** `crudServiceFactory`, `crudControllerFactory`, and `crudRouterFactory` produce typed services, controllers, and routers for simple resources. Domain-heavy resources (attacks, appointments, diary) have custom services.
- **Custom token auth.** Signed access tokens and opaque refresh tokens; refresh tokens are stored as **HMAC-SHA256 hashes**, rotated and revoked on every refresh. A password reset revokes all of the user's active sessions.
- **Role context helpers.** `requirePatientForUser` and `requireDoctorForUser` resolve the caller's profile, so controllers never trust IDs from the request body.
- **Diary aggregation.** A single endpoint (`GET /diary/day`) combines data from several collections for the calendar view.
- **Serverless deployment.** Express runs on AWS Lambda through `serverless-http`.

## Architecture

```
src/
├── routes/        # one router per resource + crudRouterFactory
├── controllers/   # HTTP layer + crudControllerFactory
├── services/      # business logic + crudServiceFactory
├── helpers/       # tokens, auth, patient/doctor context
├── middlewares/   # authenticate, error handler, request logger
└── database/      # Mongoose models and connection
```

## Getting started

Requirements: Node.js 22 and MongoDB.

```bash
npm install
npm run dev
```

Create a `.env` file:

| Variable | Description |
| :-- | :-- |
| `MONGODB_USER`, `MONGODB_PASSWORD`, `MONGODB_URL`, `MONGODB_DB` | MongoDB connection |
| `APP_ACCESS_TOKEN_SECRET` | Secret for signing access tokens |
| `APP_REFRESH_TOKEN_SECRET` | Secret for hashing refresh tokens |

Deploy with `npm run deploy` (Serverless Framework).

## Documentation (Ukrainian)

- [Docs.md](Docs.md): routes overview
- [Models.md](Models.md): data models
- [README-uk.md](README-uk.md): functional scope of the MVP

## Author

**Volodymyr Pashchenko**, Full-stack Developer · [GitHub](https://github.com/Pikimell) · [LinkedIn](https://www.linkedin.com/in/pashchenko-v-r)
