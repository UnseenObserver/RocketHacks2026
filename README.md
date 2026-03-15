# RocketHacks2026 (MoneyFirst / RookiePay)

A Firebase-backed budgeting web app with account auth, transaction tracking, savings goals, split-ratio planning, family portal roles, and theme customization.

## Core features

- Email/password and Google authentication.
- Dashboard with income/expense tracking, running balance, and history.
- Savings goals with progress indicators.
- Split ratio allocation across categories, bills, and savings goals.
- Family Portal support for `solo`, `parent`, and `child` account roles.
- Invite-code validated family membership linking for parent/child and parent/parent relationships.
- Account management (profile, role switch controls, password reset, profile photo).
- Visual preferences (theme preset + animation speed).
- Responsive mobile layout tuning across dashboard, history, and account flows.

## Project structure

- `index.html`: entry redirect to app login.
- `program/pages/login.html`: login and sign-up UI.
- `program/pages/dashboard.html`: main budgeting dashboard.
- `program/pages/account.html`: profile + family portal settings.
- `program/pages/splitRatio.html`: split ratio configuration.
- `program/pages/visuals.html`: visual preference editor.
- `program/pages/faq.html`, `program/pages/terms.html`: support/legal pages.
- `program/styles.css`: shared app styling (single source of truth).
- `program/assets/js/firebase-config.js`: Firebase app/auth/firestore/storage initialization.
- `program/assets/js/auth.js`: auth flows and initial profile provisioning.
- `program/assets/js/dashboard.js`: dashboard state, rendering, totals, and portal view.
- `program/assets/js/account.js`: profile updates, family membership management, and avatar handling.
- `program/assets/js/split-ratio.js`: ratio editor and validation.
- `program/assets/js/theme.js`: runtime theme + animation mode application.
- `program/assets/js/visuals.js`, `program/assets/js/presets.js`: visual settings UI and preset definitions.
- `program/assets/js/family.js`: shared family/invite helpers.
- `program/assets/js/cache-registration.js`, `program/assets/js/service-worker.js`: static asset caching.

## Local run

Serve with a local web server (not `file://`). Example options:

- VS Code Live Server, or
- `python -m http.server 5500` (from project root), then open `http://localhost:5500/program/pages/login.html`.

## Firebase setup required

This front-end expects Firebase to be configured in the Firebase Console:

1. Enable `Authentication > Sign-in method > Email/Password`.
2. Enable `Authentication > Sign-in method > Google` and select a support email.
3. Add allowed hosts in `Authentication > Settings > Authorized domains` (for example `localhost` and your deployed host).
4. Create a Firestore database.
5. Configure Firestore rules using `firestore.rules` in this repository.

The included rules keep user-owned data private and allow the secure family-link flows used by parent/child invite codes.

### Firestore security model (current)

- Users can read and write their own profile and data documents.
- Cross-user family membership creation is restricted to invite-code validated links.
- Family membership updates are owner-controlled (`users/{ownerUid}/familyMembers/{memberUid}` updates by owner only).
- Parent Portal child color updates are restricted to linked parent accounts and only specific color fields.
- Support tickets are create/read-only for the authenticated ticket owner.

Deploy rules from the project root:

```bash
firebase deploy --only firestore:rules
```

## Google Sign-In notes

- GIS rendered button is used on login when a client ID is present.
- Popup fallback is used when GIS is unavailable.
- Add your client ID in `program/pages/login.html`:
  - `<meta name="google-signin-client_id" content="YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com" />`

## Data model notes

- User profiles are stored at `users/{uid}`.
- Transactions are stored at `users/{uid}/transactions/{transactionId}`.
- Savings goals and split ratios are stored under each user document.
- Parent-family membership links are stored in `users/{parentUid}/familyMembers/{memberUid}`.
- Invite-based links store `joinedWithInviteCode` metadata for secure family membership validation.

## User docs in app

- `program/pages/faq.html` includes updated guidance for data security, mobile support, and in-app account deletion.
- `program/pages/terms.html` includes updated wording for invite-code responsibility, account/data deletion behavior, and service/security disclaimers.

## Maintenance notes

- Shared styles should be edited in `program/styles.css` only.
- Keep comments in JS focused on non-obvious business logic (allocation model, role/family flows, and auth provisioning).