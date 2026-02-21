# Windows: "Scripts are disabled" when running npm

If you see an error like:

```text
npm : Die Datei "C:\Program Files\nodejs\npm.ps1" kann nicht geladen werden,
da die Ausführung von Skripts auf diesem System deaktiviert ist.
```

PowerShell is blocking script execution, so `npm.ps1` cannot run.

## Option 1: Use the batch file (no system change)

From the project root:

- **PowerShell:** You must prefix with `.\` (current directory is not in PATH):
  ```powershell
  .\dev.bat
  ```
  To build: `.\build.bat`

- **Command Prompt (cmd):** You can run:
  ```text
  dev.bat
  ```
  or `build.bat`

- **Explorer:** Double‑click `dev.bat` or `build.bat` (no prefix needed).

The batch files run Vite via Node directly (no npm.ps1), so PowerShell execution policy does not apply.

## Option 2: Use Command Prompt instead of PowerShell

1. Open **Command Prompt** (cmd), not PowerShell.
2. Go to the project folder: `cd c:\DIYverse`
3. Run: `npm run dev`

In cmd, `npm` runs `npm.cmd`, so the execution policy does not apply.

## Option 3: Allow scripts in PowerShell (current user)

1. Open **PowerShell as yourself** (no need for Administrator).
2. Run once:

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. Confirm with `Y` if prompted.
4. Close and reopen the terminal, then run `npm run dev`.

If your machine has a group policy that overrides this, Option 1 or 2 will still work.
