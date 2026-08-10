# eTutor Backend

eTutor backend is a Django REST API for an education platform that manages users, tutors, courses, content, permissions, and payment-related workflows.

---

## Project Description

The backend provides:

- Authentication and authorization (JWT, roles, permissions)
- User and profile management
- Course lifecycle management (create, update, publish, enroll, progress)
- Tutor operations (availability, contract-related data, requests)
- Learning content and assessment modules (chapters, lessons, assignments)
- Operational domains (files, notifications, adverts, finance, feedback)

The API is consumed by the Next.js frontend in `etutor-web-v1`.

---

## Architecture

### Technology

- Python + Django
- Django REST Framework
- PostgreSQL
- Gunicorn (production app server)
- Docker / Docker Compose

### Request flow

1. Frontend sends HTTP request to Django API.
2. URL routes map request to view/viewset.
3. Serializers validate and transform payloads.
4. Domain logic executes in app modules.
5. Data persists to PostgreSQL via Django ORM.
6. JSON response is returned to frontend.

### Access control model

- JWT token-based authentication
- Group- and user-level permission checks
- Endpoint-level authorization for protected resources

---

## Project Structure

```text
etutor-api/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── manage.py
├── etutor_api/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── .env
├── commons/
│   ├── authentication/
│   ├── user/
│   ├── file/
│   ├── feedback/
│   └── ...
├── applications/
│   ├── course/
│   ├── category/
│   ├── chapters/
│   ├── content/
│   ├── assignment/
│   ├── tutor/
│   ├── finance/
│   └── ...
└── database_dumps/
    └── etutor_fixture_20260305.json
```

---

## Business Logic Overview

### 1) Identity and access

- Register/login users
- Issue/validate JWT tokens
- Enforce role/group/user permissions

### 2) Learning lifecycle

- Create and manage courses
- Organize course into chapters and contents
- Enroll users and track progress
- Handle reviews/ratings and learning interactions

### 3) Tutor operations

- Store tutor profile and related attributes
- Manage tutor availability and request workflows
- Support tutor contract and attendance-linked flows

### 4) Finance and operations

- Manage bank/payment-related entities
- Handle payment request and operational records
- Support adverts, files, notifications, and feedback

---

## Default Users

After loading the fixture (`database_dumps/etutor_fixture_20260305.json`) or running sample data creation, you can use:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Tutor | `tutor1` | `tutor123` |
| Student | `student1` | `student123` |

These users are for development/testing only.

---

## Docker Run Guide

This backend is designed to run with Docker Compose.

## Prerequisites

- Docker
- Docker Compose

## Run Backend + Database

```bash
cd /home/behaylu/Documents/project/etutor/etutor-api
docker compose up --build
```

Backend API:

- http://localhost:8000

PostgreSQL:

- Host: `localhost`
- Port: `5432`
- DB: `etutor_db`
- User: `postgres`
- Password: `postgres`

## Run in Detached Mode

```bash
docker compose up --build -d
```

## Stop Containers

```bash
docker compose down
```

## Reset Containers and Volumes (Deletes DB data)

```bash
docker compose down --volumes --remove-orphans
```

## Logs

```bash
docker compose logs -f
```

## Notes

- On startup, backend waits for DB, runs migrations, tries to load fixture data, then starts Gunicorn.
- Fixture load is best effort; container still starts if fixture already exists or fails.

## Troubleshooting: "could not reach DB"

If the backend exits with **ERROR: could not reach DB at etutor-api-db:5432**, the DB container may not be on the same Docker network as the backend. Fix by **recreating all containers** so both join `etutor-net`:

```bash
docker compose down
docker compose up --build
```

To confirm both are on the same network:

```bash
docker network inspect etutor-api_etutor-net
```

Under `Containers` you should see both **etutor-api** and **etutor-api-db**. If only one appears, run `docker compose down` then `docker compose up --build` again.
