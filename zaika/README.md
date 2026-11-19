# Zaika. Live Restaurant System

Single-file app (no build step). Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000   # then open http://localhost:8000

Views (hash links): `#guest-5` (Table 5), `#staff`, `#kitchen`, `#split`.
Open them in separate tabs of the same browser; they sync live via
BroadcastChannel + localStorage.

Default PINs (edit `PINS` in index.html): Staff 1234, Kitchen 5678.
PINs are checked in the browser only: demo-level security.

Staff > Menu tab: add/edit dishes (name, price, description, image, category,
station, allergens, sold out, delete).
