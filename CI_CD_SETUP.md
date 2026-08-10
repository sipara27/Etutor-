# MyTutor monorepo CI/CD setup

The frontend and backend are tracked directly in the `hagiye/Mytutor_p`
repository. The production pipelines live at the repository root:

- `.github/workflows/backend-ci-cd.yml`
- `.github/workflows/frontend-ci-cd.yml`

A pull request runs validation only. A successful push to `main` runs the
pipeline for each application whose files changed, packages it, uploads it to
cPanel over SSH, restarts Passenger, and verifies the public URL.

## 1. Rotate exposed credentials

OAuth client secrets, a Telegram bot token, and an SMTP password were previously
stored in Django settings. They are now read from environment variables, but the
old credentials remain compromised through Git history. Rotate them with their
providers before enabling production deployment.

Do not commit the production `.env` file or an SSH private key.

## 2. Create a restricted deployment SSH key

Create a dedicated key pair on an administrator machine and add only its public
key to the cPanel user's `~/.ssh/authorized_keys` file. Keep the private key for
the GitHub secret described below.

Record the server host key after verifying its fingerprint through the hosting
provider or cPanel:

```bash
ssh-keyscan -H -p 22 mytutor.com.et
```

The complete output line is the value of `SSH_KNOWN_HOSTS`. Do not skip host-key
verification.

## 3. Configure the backend production environment

In `hagiye/Mytutor_p`, create an Actions environment named
`production-backend`, restrict deployment branches to `main`, and add these
environment secrets:

| Secret | Example/value |
|---|---|
| `DEPLOY_HOST` | `mytutor.com.et` |
| `DEPLOY_PORT` | `22` |
| `DEPLOY_USER` | The cPanel SSH user |
| `DEPLOY_PATH` | `/home/<user>/api.mytutor.com.et` |
| `VENV_PATH` | `/home/<user>/virtualenv/api.mytutor.com.et/3.9` |
| `DEPLOY_SSH_KEY` | The full private deployment key |
| `SSH_KNOWN_HOSTS` | The verified `ssh-keyscan` output |

Create `etutor_api/.env` inside `DEPLOY_PATH` using
`etutor_api/.env.example` as the template. The deployment archive deliberately
does not include environment/secret files, database dumps, uploaded media, or
generated static files.

The workflow installs requirements in `VENV_PATH`, runs migrations, collects
static files, performs Django deployment checks, and touches `tmp/restart.txt`.

## 4. Configure the frontend production environment

In `hagiye/Mytutor_p`, create an Actions environment named
`production-frontend`, restrict deployment branches to `main`, and add these
environment secrets:

| Secret | Example/value |
|---|---|
| `DEPLOY_HOST` | `mytutor.com.et` |
| `DEPLOY_PORT` | `22` |
| `DEPLOY_USER` | The cPanel SSH user |
| `DEPLOY_PATH` | `/home/<user>/prod.mytutor.com.et` |
| `DEPLOY_SSH_KEY` | The full private deployment key |
| `SSH_KNOWN_HOSTS` | The verified `ssh-keyscan` output |

Add these Actions **repository variables** when the defaults are not correct.
They must be repository-level variables because the validation/build job does
not enter the protected `production` environment:

| Variable | Default |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | `https://api.mytutor.com.et` |
| `NEXT_PUBLIC_CORS_URL` | `https://cors.nisirtech.com` |
| `FRONTEND_PRODUCTION_URL` | `https://mytutor.com.et/` |
| `BACKEND_PRODUCTION_URL` | `https://api.mytutor.com.et/` |

Configure the cPanel Node.js application to use Node 20 and `server.js` as its
startup file. The workflow deploys Next.js standalone output, so it does not need
to install npm packages on the production server.

## 5. Push the monorepo

Review and commit the frontend, backend, and root workflows together, then push
the `main` branch of your repository:

```bash
git add .
git commit -m "Convert MyTutor to production monorepo"
git push origin main
```

Changes under `mytutor-backend/` trigger the backend workflow. Changes under
`mytutor-frontend/` trigger the frontend workflow. Both workflows can also be
started manually from the GitHub Actions page.

## Rollback

GitHub retains each packaged deployment artifact for seven days. To roll back,
download the desired artifact from the workflow run, extract it into the matching
deployment path, and touch `tmp/restart.txt`. Database migrations should be
written to remain backward compatible because application rollback does not
automatically reverse schema changes.
