# RocketHacks2026

Basic budget tracker with Firebase Authentication and Firestore-backed transactions.

## File layout

- `index.html`: entry redirect to login
- `login.html`: login and sign-up markup
- `dashboard.html`: main budget dashboard
- `account.html`, `faq.html`, `terms.html`, `splitRatio.html`, `visuals.html`: settings/support subpages
- `styles.css`: shared styling for all pages (single source of truth)
- `assets/css/styles.css`: compatibility forwarder to `styles.css`
- `assets/js/auth.js`: login, sign-up, and password reset behavior
- `assets/js/dashboard.js`: dashboard behavior, transactions, goals, and subpage tabs
- `assets/js/account.js`: profile and account updates
- `assets/js/split-ratio.js`: split ratio configuration
- `assets/js/visuals.js`: theme/animation preference UI
- `assets/js/theme.js`: global theme application from user settings
- `assets/js/presets.js`: built-in visual presets
- `assets/js/firebase-config.js`: Firebase app initialization
- `assets/js/cache-registration.js`: service worker registration
- `service-worker.js`: offline caching for local static assets

## What should work

- `login.html` lets a user sign up, log in, and request a password reset.
- `dashboard.html` shows the authenticated user's transactions, totals, add form, delete, and clear-all.
- `styles.css` styles auth, dashboard, and settings pages.

## Required Firebase setup

The front end is already wired to Firebase, but the project still depends on Firebase Console setup:

1. Enable `Authentication > Sign-in method > Email/Password`.
2. Enable `Authentication > Sign-in method > Google` and select a support email.
3. In `Authentication > Settings > Authorized domains`, add all app domains (`localhost` and your deployed host).
2. Create a Firestore database.
3. Use rules that allow a signed-in user to read and write their own user document and `transactions` subcollection.

Example Firestore rules for this app shape:

```txt
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /users/{userId} {
			allow read, write: if request.auth != null && request.auth.uid == userId;

			match /transactions/{transactionId} {
				allow read, write: if request.auth != null && request.auth.uid == userId;
			}
		}
	}
}
```

## Google login (implemented)

The auth page includes Google buttons in both login and sign-up flows.

- Login uses the Google Identity Services (GIS) rendered button, then exchanges the Google credential with Firebase via `signInWithCredential`.
- If GIS is unavailable or no GIS client ID is configured, login falls back to `signInWithPopup`.
- `Sign up with Google` provisions a new user profile document (and family role links if account type is `Parent Portal` or `Child Account`).
- Existing Google users without a Firestore profile are auto-provisioned on first successful login.
- Popup-specific errors are handled (`popup blocked`, `popup closed`, `account exists with different credential`).

GIS client ID setup:

- Add your Google web client ID to `login.html` in the `meta` tag:
	- `<meta name="google-signin-client_id" content="YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com" />`
- This is required for the GIS rendered login button.

Relevant implementation files:

- `assets/js/auth.js` (Google provider sign-in, user provisioning, auth state handling)
- `login.html` (Google auth buttons)
- `styles.css` (Google button styling)

## Notes

- Transactions are stored under `users/{uid}/transactions`.
- Open `login.html` first if you are not already authenticated.
- Serve the project from `http://localhost` or hosting instead of opening the HTML files directly with `file://`.