# Task 12 — Deliverable

> Sheet description: Build a polished 4-screen static mobile app with Home, Listing, Details, and Profile screens

## The four screens

| Screen | Shows |
|--------|-------|
| `HomeScreen` | greeting, promo banner, featured grid, stats, recently viewed |
| `ListingScreen` | search, category chips, responsive product grid, empty state |
| `DetailsScreen` | hero, price, stock, spec rows, tags, pinned action bar |
| `ProfileScreen` | avatar, stats, bio, settings switches, link rows |

## Navigation shape

```
Stack
├── Tabs (headerShown: false)
│   ├── Home
│   ├── Listing
│   └── Profile
└── Details          ← above the tabs, so it covers the tab bar
```

Details deliberately sits in the stack **above** the tabs rather than inside one of them. That's
what gives it a native back gesture and lets it cover the tab bar — which is what a detail view
should do on both platforms.

## Where each task shows up

| Task | Used here as |
|------|--------------|
| 3 Folder structure | `screens/` and `components/` split |
| 4 Core components | View, Text, Pressable, ScrollView, FlatList, Switch |
| 5 StyleSheet & Flexbox | every screen uses the theme tokens |
| 6 Safe area | each screen applies insets to its own content padding |
| 7 Platform handling | `shadow()` in the cards and the action bar |
| 8 Images | emoji placeholders standing in for remote images |
| 9 FlatList | the listing grid, with `numColumns` and an empty state |
| 10 Forms | the search input and the profile switches |

## Two details worth noticing

**`key={columns}` on the listing FlatList.** `numColumns` cannot change on a mounted list — React
Native throws. Changing the key remounts it instead, which is how the layout survives a rotation
from two columns to three.

**`ProductCard` takes `onPress`, not `navigation`.** That's why the same component works on both
Home and Listing. A component that navigates itself can only be used where that destination makes
sense.

## Static

No API, no persistence. The sheet asks for a static app, and the data lives in `src/data/index.js`.
