# Fix: Git push to GitHub not working

## What’s wrong

Push fails with something like:

- `could not read Username for 'https://github.com': No such file or directory`
- or Git never asking for login

So Git doesn’t have valid GitHub credentials (or can’t show the login prompt where you run the command).

---

## Fix 1: Push from your own terminal (recommended)

Do the push from **your** machine in a **normal** terminal (PowerShell or CMD), not from an automated environment. Then Git Credential Manager can open the browser and log you in.

1. Open **PowerShell** or **Command Prompt** (Windows Key, type `PowerShell`, Enter).
2. Go to the project:
   ```powershell
   cd c:\DIYverse
   ```
3. Push:
   ```powershell
   git push -u origin main
   ```
4. When asked:
   - **Username:** your GitHub username (e.g. `MF757`)
   - **Password:** use a **Personal Access Token** (see below), not your GitHub account password
5. If a browser opens, sign in to GitHub and approve access. After that, future pushes may not ask again.

If it still says “could not read Username” or never prompts, use Fix 2.

---

## Fix 2: Use a Personal Access Token (PAT)

GitHub no longer accepts account passwords for Git over HTTPS. You must use a **Personal Access Token** as the “password”.

### Step A: Create a token on GitHub

1. Open: **https://github.com/settings/tokens**
2. Click **“Generate new token”** → **“Generate new token (classic)”**.
3. **Note:** e.g. `DIYverse push`.
4. **Expiration:** e.g. 90 days or “No expiration” (your choice).
5. **Scopes:** enable **`repo`** (full control of private repositories).
6. Click **“Generate token”**.
7. **Copy the token** (you won’t see it again).

### Step B: Use the token when pushing

**Option B1 – Git asks for password**

1. In PowerShell (or CMD):
   ```powershell
   cd c:\DIYverse
   git push -u origin main
   ```
2. When Git asks:
   - **Username:** `MF757` (your GitHub username)
   - **Password:** paste the **token** (not your GitHub password)

**Option B2 – Store the token so you don’t type it every time**

1. In PowerShell:
   ```powershell
   cd c:\DIYverse
   git config --global credential.helper store
   git push -u origin main
   ```
2. When prompted:
   - **Username:** `MF757`
   - **Password:** paste the **token**
3. Git will save the credentials. Next time you might not need to enter them.

(Using `credential.helper manager` is also fine if you prefer the Windows Credential Manager popup.)

---

## Fix 3: Use SSH instead of HTTPS

If you use SSH keys with GitHub, you can switch the remote to SSH so Git never asks for a password.

1. Check if you have a key and added it to GitHub (see [GitHub: SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)).
2. Switch the remote to SSH:
   ```powershell
   cd c:\DIYverse
   git remote set-url origin git@github.com:MF757/DIYverse.git
   git push -u origin main
   ```
3. If your SSH key is set up, the push will work without a password.

---

## Quick checklist

| Step | Action |
|------|--------|
| 1 | Open PowerShell/CMD **on your PC** (not inside an automated tool). |
| 2 | `cd c:\DIYverse` |
| 3 | Create a token at https://github.com/settings/tokens (scope: **repo**). |
| 4 | `git push -u origin main` |
| 5 | Username: `MF757`, Password: **paste the token**. |

---

## Fix 4: Push rejected (branch behind remote / non-fast-forward)

If you see:

```
! [rejected]        main -> main (non-fast-forward)
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
```

**Cause:** The remote has commits you don't have (e.g. README added on GitHub, or pushes from another machine). Your branch is "behind" the remote.

**Fix:** Integrate the remote branch, then push.

1. In PowerShell from the project folder:
   ```powershell
   cd c:\DIYverse
   git pull --rebase origin main
   ```
2. If there are no conflicts, push:
   ```powershell
   git push origin main
   ```
3. If there are conflicts, Git will stop and list the files. Resolve them, then:
   ```powershell
   git add .
   git rebase --continue
   git push origin main
   ```

Using `--rebase` keeps history linear (your commits are replayed on top of the remote). You can use `git pull origin main` (without `--rebase`) to do a merge instead if you prefer a merge commit.

---

If it still fails, copy the **exact** error message from the terminal and use it to search or ask for help (e.g. “Git could not read Username” + the exact line).
