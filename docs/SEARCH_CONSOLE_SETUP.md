# Google Search Console setup for DIYverse

This app supports **ownership verification** via the HTML meta tag and provides a **sitemap** so Google can discover your pages. Both are optional; when configured, they help Search Console track indexing and search performance.

---

## 1. Add your site in Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Sign in with the Google account you want to use.
3. Click **Add property**.
4. Choose **URL prefix** and enter your live site URL (e.g. `https://yourdomain.com`). Do not add a trailing slash.
5. Click **Continue**.

---

## 2. Verify ownership with the HTML tag

1. On the verification screen, select **HTML tag**.
2. Copy only the **content** value from the meta tag. It looks like:
   ```html
   <meta name="google-site-verification" content="AbCdEfGhIjKlMnOpQrStUvWxYz1234567890" />
   ```
   Copy the string inside `content="..."` (e.g. `AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`).
3. In your project root, open `.env` (create from `.env.example` if needed) and add:
   ```env
   VITE_GOOGLE_SITE_VERIFICATION=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
   ```
   Use your actual content value.
4. Restart the dev server (or rebuild for production). The app injects the full meta tag into the page `<head>` when this env var is set.
5. Deploy your site so the live URL returns the page with the meta tag.
6. In Search Console, click **Verify**. Verification lasts as long as the tag remains on the site.

---

## 3. Set the sitemap base URL (for production build)

The repo includes a static sitemap at `/sitemap.xml` that lists the home page and key static routes. URLs in the sitemap must be absolute.

1. For production builds, set your live URL in `.env`:
   ```env
   VITE_APP_URL=https://yourdomain.com
   ```
   Do not add a trailing slash. If unset, the sitemap uses `https://example.com`; replace that with your domain or set `VITE_APP_URL` and rebuild.
2. Run `npm run build`. The build replaces the placeholder in `sitemap.xml` with `VITE_APP_URL`.
3. After deployment, the sitemap will be available at `https://yourdomain.com/sitemap.xml`.

---

## 4. Submit the sitemap in Search Console

1. In Search Console, open your property.
2. In the left menu, go to **Sitemaps**.
3. Under **Add a new sitemap**, enter: `sitemap.xml`
4. Click **Submit**. Google will start using it to discover and crawl your pages.

The included sitemap lists:

- `/` (home)
- `/impressum`
- `/user-content-policy`
- `/terms-of-service`
- `/copyright-compliance`

Project and profile URLs are dynamic; you can add more URLs via **URL Inspection** → **Request indexing**, or extend the build to generate a sitemap that includes project slugs from your database.

---

## 5. Optional: Link to AdSense

If you use [AdSense](docs/ADSENSE_SETUP.md), you can link the same property in Search Console (Search Console → Settings → Associations) for combined reporting.

---

## Summary

| Step | What you need |
|------|----------------|
| 1 | Search Console property with your site URL |
| 2 | HTML tag verification → copy content value → `VITE_GOOGLE_SITE_VERIFICATION` in `.env`, rebuild/deploy, then Verify |
| 3 | `VITE_APP_URL=https://yourdomain.com` in `.env` for production build so sitemap has correct URLs |
| 4 | Submit `sitemap.xml` in Search Console → Sitemaps |

After that, the site is verified and the sitemap is submitted; you can use Search Console to monitor indexing and search performance.
