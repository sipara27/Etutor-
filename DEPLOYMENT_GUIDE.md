# MyTutor production deployment guide

MyTutor uses GitHub Actions to deploy the frontend and backend to cPanel over
SSH. A successful push to `main` deploys only the application whose files
changed.

## Normal deployment workflow

The SSH setup below is a one-time operation. For future deployments, commit and
push changes to `main`:

```powershell
git add .
git commit -m "Describe the changes"
git push origin main
```

- Changes in `mytutor-backend/` run the backend pipeline.
- Changes in `mytutor-frontend/` run the frontend pipeline.
- Pull requests validate changes but do not deploy them.
- Production changes appear only after both validation and deployment succeed.

After pushing, check the repository's **Actions** page. A green workflow means
the deployment and public URL verification succeeded. If a job is waiting for
approval, approve its production environment. For a failed job, open the first
red step and inspect its log.

## One-time SSH deployment setup

### 1. Generate a dedicated key

On Windows, run:

```powershell
ssh-keygen -t ed25519 -C "github-actions-mytutor-2026" -f "$env:USERPROFILE\.ssh\mytutor_github_actions_2026"
```

If that file already exists, do not overwrite it. Choose a new filename. Press
Enter twice when prompted for a passphrase so the non-interactive deployment can
use the key.

This creates two files:

- `mytutor_github_actions_2026.pub`: public key for cPanel
- `mytutor_github_actions_2026`: private key for GitHub

Never commit, email, or share the private key.

### 2. Import and authorize the public key in cPanel

Copy the public key:

```powershell
Get-Content "$env:USERPROFILE\.ssh\mytutor_github_actions_2026.pub" | Set-Clipboard
```

In cPanel, open **Security > SSH Access > Manage SSH Keys > Import Key**.
Use `github-actions-mytutor-2026` as the name, paste the key into the
**Public Key** field, and leave the private-key and passphrase fields empty.
Import the key, then find it under **Public Keys** and select
**Manage > Authorize**. Importing a key without authorizing it is insufficient.

### 3. Test SSH locally

Replace the placeholders with the actual cPanel SSH details:

```powershell
ssh -i "$env:USERPROFILE\.ssh\mytutor_github_actions_2026" -p 22 CPANEL_USERNAME@SSH_HOST
```

Use the hosting provider's SSH port if it is not `22`. The connection must
succeed without requesting the cPanel account password. If the authorized key
is still rejected, confirm the username and ask the hosting provider whether
SSH or Jailed Shell access is enabled for the account.

### 4. Store the private key in GitHub

Copy the private key without printing it:

```powershell
Get-Content -Raw "$env:USERPROFILE\.ssh\mytutor_github_actions_2026" | Set-Clipboard
```

Open **Repository Settings > Environments > production-backend** and configure
these environment secrets:

| Secret | Value |
| --- | --- |
| `DEPLOY_HOST` | Hosting SSH hostname |
| `DEPLOY_PORT` | Hosting SSH port, normally `22` |
| `DEPLOY_USER` | Exact cPanel username |
| `DEPLOY_PATH` | `/home/USERNAME/api.mytutor.com.et` |
| `VENV_PATH` | Backend Python virtual-environment path |
| `DEPLOY_SSH_KEY` | Complete private key copied above |
| `SSH_KNOWN_HOSTS` | Verified SSH host-key entry |

The private-key secret must contain the complete multiline value, including
the `BEGIN OPENSSH PRIVATE KEY` and `END OPENSSH PRIVATE KEY` lines.

Open **Repository Settings > Environments > production-frontend** and configure:

| Secret | Value |
| --- | --- |
| `DEPLOY_HOST` | Hosting SSH hostname |
| `DEPLOY_PORT` | Hosting SSH port |
| `DEPLOY_USER` | Exact cPanel username |
| `DEPLOY_PATH` | `/home/USERNAME/prod.mytutor.com.et` |
| `DEPLOY_SSH_KEY` | Complete matching private key |
| `SSH_KNOWN_HOSTS` | Verified SSH host-key entry |

The same key can be used for both environments when both applications use the
same cPanel account.

## Re-running a failed deployment

After correcting a secret or server setting, open the failed workflow in
**GitHub > Actions** and select **Re-run jobs > Re-run failed jobs**. A deployment
that failed before the activation step did not update production.

## Common deployment failures

| Error | Likely cause | Resolution |
| --- | --- | --- |
| `Permission denied (publickey...)` | Wrong user, unmatched key, or public key not authorized | Verify `DEPLOY_USER`, authorize the public key, and update `DEPLOY_SSH_KEY` |
| `Host key verification failed` | Incorrect or missing `SSH_KNOWN_HOSTS` | Verify the server fingerprint and replace the secret |
| `Connection timed out` or `refused` | Wrong host/port, firewall, or SSH disabled | Confirm hosting SSH details and account access |
| Permission denied under the deployment path | Deploy user does not own the target directory | Correct `DEPLOY_PATH` or its server-side ownership |
| Backend virtual environment not found | Incorrect `VENV_PATH` | Copy the exact virtual-environment path from cPanel's Python application settings |

## Key rotation

When replacing a deployment key:

1. Generate a new key with a new filename.
2. Import and authorize its public key in cPanel.
3. Test it locally.
4. Replace `DEPLOY_SSH_KEY` in both GitHub environments.
5. Confirm a deployment succeeds.
6. Deauthorize and remove the old public key from cPanel.
