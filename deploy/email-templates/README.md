# EmailJS OTP template — The Denim Forge

## Paste into EmailJS

1. Open [EmailJS Dashboard](https://dashboard.emailjs.com) → **Email Templates** → **Create New Template**
2. Switch to **Code / HTML** editor
3. Paste contents of `otp-verification.html`
4. Template settings:
   - **Subject:** `{{otp}} is your The Denim Forge code`
   - **To Email:** `{{to_email}}`
   - **From Name:** `The Denim Forge`
5. Save → copy **Template ID** into `server/.env` as `EMAILJS_TEMPLATE_ID`

## Template variables (must match server)

| Variable     | Example        |
|-------------|----------------|
| `to_email`  | user@email.com |
| `to_name`   | Harshit        |
| `otp`       | 482913         |
| `purpose`   | login / registration |

## Brand

- Paper bg `#f6f4f0`, ink `#111`, forge red `#c8102e`
- Display feel: Oswald / uppercase tracking (email-safe fallbacks included)
