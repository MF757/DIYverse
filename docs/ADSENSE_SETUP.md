# Google AdSense setup for DIYverse

This app shows **one ad slot per 25 projects** on the home feed when AdSense is configured. Ads appear in the same grid as project cards and use your design tokens so they look consistent.

---

## 1. Create an AdSense account and get approved

1. Go to [Google AdSense](https://www.google.com/adsense/).
2. Sign in with the Google account you want to use for payments.
3. Click **Get started** and add your site (e.g. `https://yourdomain.com`).
4. Complete the application. Google will review your site (content, privacy policy, etc.). Approval can take from a few days to a few weeks.
5. Once approved, you’ll get access to the AdSense dashboard.

---

## 2. Get your publisher ID (client ID)

1. In AdSense, go to **Account** → **Settings** → **Account information** (or open **Ads** → **Overview**).
2. Find **Publisher ID**. It looks like: `ca-pub-XXXXXXXXXXXXXXXX` (numbers and letters after `ca-pub-`).
3. Copy this value. You’ll use it as `VITE_ADSENSE_CLIENT_ID` in your environment.

---

## 3. Create an ad unit and get the slot ID

1. In AdSense, go to **Ads** → **By ad unit**.
2. Click **Display ads** (or **In-article** / **In-feed** if you prefer; the code works with standard display units).
3. Click **Create ad unit**.
4. Choose a name (e.g. “DIYverse home feed”).
5. Under **Ad size**, choose **Responsive** or **Rectangle** (e.g. 336×280 or 300×250). The app uses a rectangle-style slot.
6. Click **Create**.
7. On the next screen you’ll see a code snippet. In it you’ll see:
   - `data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"` (same as your publisher ID)
   - `data-ad-slot="1234567890"` (a numeric ID)
8. Copy the **numeric slot ID** (e.g. `1234567890`). You’ll use it as `VITE_ADSENSE_SLOT_ID` in your environment.

You can use the same ad unit for all in-feed slots; the app reuses one slot ID for every “one per 25 projects” placement.

---

## 4. Add the IDs to your environment

1. In the **project root** (where `package.json` and `.env.example` are), copy the example env file if you haven’t already:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and add or uncomment these lines (use your real values from steps 2 and 3):

   ```env
   VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
   VITE_ADSENSE_SLOT_ID=1234567890
   ```

   Replace:
   - `ca-pub-XXXXXXXXXXXXXXXX` with your **Publisher ID** (including the `ca-pub-` prefix). Must be `ca-pub-` followed by digits only.
   - `1234567890` with your **ad unit slot ID** (digits only). Invalid values are ignored and no ad slots are shown.

3. Save the file and **restart the dev server** (Vite only reads env at startup):
   ```bash
   npm run dev
   ```

---

## 5. Verify in the browser

1. Open the home page (e.g. `http://localhost:5173/`).
2. Add enough projects (or use existing data) so there are at least 25 projects in the list.
3. Scroll the feed. You should see one ad slot after the first 25 projects, then after the next 25, and so on.
4. The slot is a bordered card that matches the project grid. Ads may take a few seconds to fill; if you use an ad blocker, the slot may stay empty (that’s expected).

---

## 6. Production checklist

- **Domain in AdSense**: In AdSense **Sites** (or **Account** → **Settings**), ensure your live domain (e.g. `https://yourdomain.com`) is added and verified.
- **Privacy and consent**: If you target the EU/UK, you must get user consent before loading AdSense (e.g. cookie/privacy banner and load the ad script only after consent). The current implementation loads the script when the home feed is shown; you can later gate this behind a consent flag.
- **Policy**: Keep your site in line with [AdSense program policies](https://support.google.com/adsense/answer/48182) (content, no invalid traffic, etc.).

---

## Disabling ads

- Remove or comment out `VITE_ADSENSE_CLIENT_ID` and `VITE_ADSENSE_SLOT_ID` in `.env`, or leave them unset.
- Restart the dev server. With no valid AdSense config, the app does not render any ad slots and the feed shows only projects.

---

## Summary

| Step | What you need |
|------|----------------|
| 1 | AdSense account and site approval |
| 2 | Publisher ID → `VITE_ADSENSE_CLIENT_ID` (e.g. `ca-pub-XXXXXXXXXXXXXXXX`) |
| 3 | One display/in-feed ad unit → its slot ID → `VITE_ADSENSE_SLOT_ID` (e.g. `1234567890`) |
| 4 | Both values in `.env` and restart dev server |
| 5 | Home feed with 25+ projects to see slots in the grid |

After that, the app will show one ad per 25 projects on the home feed and you can track performance in the AdSense dashboard.
