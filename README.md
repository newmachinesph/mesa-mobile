# mesa-mobile

![License: MIT](https://img.shields.io/badge/license-MIT-green) ![Expo](https://img.shields.io/badge/Expo-56-000020) ![React Native](https://img.shields.io/badge/React_Native-0.85-61dafb)

The diner app for **Mesa**, a restaurant reservation system for the Philippine market.

Guests discover restaurants, check real availability, book a table, and settle the deposit the way it actually works here: send it over GCash, then upload the screenshot.

The staff-facing portal lives in [`mesa-admin`](https://github.com/newmachinesph/mesa-admin). Both share [`mesa-core`](https://github.com/newmachinesph/mesa-core).

> **Frontend demo.** No backend, no network calls, no real payments. All state is in memory, seeded from `mesa-core`, and resets on reload. The proof-of-payment image never leaves the device.

## Stack

Expo SDK 56 · expo-router · React Native 0.85 · NativeWind 4 · zustand · react-hook-form + zod

Runs on iOS, Android, and web from one codebase.

## Run it

Clone the three repos as siblings, since core is vendored across them:

```
<parent>/
├── mesa-core/
├── mesa-admin/
└── mesa-mobile/
```

```bash
npm install
npm start            # Expo — press i / a, or scan the QR
npm run web          # http://localhost:8081
```

```bash
npm run lint
npm run sync:core    # re-copy mesa-core/src into src/core
```

`src/core` is **generated**. Never edit it — fix `mesa-core` and re-sync.

There is no login. Settings carries a **demo guest switcher** instead: pick a VIP, someone with a no-show history, or a brand-new diner, and the whole app reflects them.

## What's in it

**Discover.** The restaurant feed, with an *Open now / Closed / Opens 5:30 PM* chip computed live against each restaurant's schedule in Manila time. Set a date, party size, and time in the quick-book bar and the feed filters to places that can actually seat you — the ones that can't tell you when they could instead.

**Booking.** Three steps: when and how many, your details, confirm. Availability is checked live as you change the date, time, or party size, and every branch has real copy rather than a generic error:

> *Balisong is closed on Mondays.*
> *The kitchen closes 2:30–5:30 PM. Dinner starts at 5:30.*
> *No single table fits 12. We can put two together — tap to request.*
> *Only one table left at 7:00 PM.*

Occasions get a first-class field — birthday, debut, anniversary, christening, graduation, despedida — because that's what function rooms and set menus attach to.

**Deposits.** For parties over the restaurant's threshold, a deposit holds the table. The screen shows the amount, the restaurant's GCash number and account name with copy buttons, and whether it's non-refundable. You send the money yourself, then enter the reference number and upload a screenshot of the receipt. Status moves `awaiting_proof → pending_review → verified` as staff check it on the other side. Uses `expo-image-picker`, which falls back to a file input on web.

**Bookings & profile.** Upcoming and past reservations with a status timeline. The profile shows your visit history and the tags restaurants have on you — read-only here, with a caption explaining they exist so the restaurant can look after you.

## Layout

```
src/
├── app/                   expo-router routes
│   ├── (tabs)/            discover, bookings, profile
│   ├── restaurant/[id]
│   ├── book/[restaurantId]
│   └── booking/[id]
├── components/
│   ├── chrome/            Screen, Header
│   ├── ui/                text, button, card, field, pill, sheet, date-strip, time-slots
│   └── profile/
├── core/                  ← GENERATED from mesa-core. Do not edit.
└── lib/store.ts           zustand, seeded from core, all mutations immutable
```

Non-route files stay out of `src/app/` — expo-router turns anything in there into a navigable screen.

## Web compatibility

The app must bundle for web, so two things are guarded: `@gorhom/bottom-sheet` degrades to a modal behind a `Platform.OS === 'web'` check, and `expo-image-picker` returns a different result shape on web than on native. Verify with:

```bash
npx expo export --platform web
```

## Design

Warm editorial hospitality, light theme only. Paper background, photographic hero cards, hairline dividers, real type-scale contrast. Terracotta for primary actions, brass for celebration accents. Copy is warm and lightly Taglish where it lands naturally, never cutesy. Responsive at 360px, 768px, and 1280px.

## License

[MIT](LICENSE) (c) 2026 Mesa
