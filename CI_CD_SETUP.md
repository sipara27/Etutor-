# MyTutor CI/CD setup

The frontend and backend are separate Git repositories. Each repository now has
its own GitHub Actions pipeline:

- `mytutor-backend/.github/workflows/ci-cd.yml`
- `mytutor-frontend/.github/workflows/ci-cd.yml`

A pull request runs validation only. A successful push to `main` packages the
application, uploads it to cPanel over SSH, activates it, restarts Passenger,
and verifies the public URL.

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

## 3. Configure the backend GitHub repository

In `behaylugule/mytutor-backend`, create an Actions environment named
`production`, restrict deployment branches to `main`, and add these environment
secrets:

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

## 4. Configure the frontend GitHub repository

In `behaylugule/mytutor-frontend`, create an Actions environment named
`production`, restrict deployment branches to `main`, and add these environment
secrets:

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
| `PRODUCTION_URL` | `https://mytutor.com.et/` |

Configure the cPanel Node.js application to use Node 20 and `server.js` as its
startup file. The workflow deploys Next.js standalone output, so it does not need
to install npm packages on the production server.

## 5. Push the repositories

Commit and push inside each application repository. Their deployments are
independent:

```bash
cd mytutor-backend
git add .
git commit -m "Add backend CI/CD"
git push origin main

cd ../mytutor-frontend
git add .
git commit -m "Add frontend CI/CD"
git push origin main
```

After committing the new child revisions, update and push the root repository's
gitlinks if the root project is still used:

```bash
cd ..
git add .gitmodules mytutor-backend mytutor-frontend CI_CD_SETUP.md
git commit -m "Configure MyTutor application repositories"
git push origin main
```

The root `.gitmodules` file has been restored so a fresh clone can retrieve both
applications with `git clone --recurse-submodules`.

## Rollback

GitHub retains each packaged deployment artifact for seven days. To roll back,
download the desired artifact from the workflow run, extract it into the matching
deployment path, and touch `tmp/restart.txt`. Database migrations should be
written to remain backward compatible because application rollback does not
automatically reverse schema changes.
