# Task 13 — Deliverable

> Sheet description: Build an API-driven React Native listing app with Stack, Tabs, Drawer, details, search, favorites, and storage

## The app

Open the **Shop** section from the drawer. Four tabs, a stack inside the first one, and a drawer
around all of it.

```
Drawer                                    ← Shop, Task screens, Settings, Help, About
└── Tabs                                  ← Home, Search, Saved, Profile
    └── HomeStack
        ├── Home        the catalogue, pull to refresh
        └── Details     pushed, keeps the tab bar
```

## Screens

| Screen | Shows |
|--------|-------|
| `HomeScreen` | live catalogue, skeletons, error state, pull-to-refresh |
| `DetailsScreen` | fetched by route param, guarded, pinned action bar |
| `SearchScreen` | debounced search with its own empty and error states |
| `FavoritesScreen` | persisted ids, filtered locally, hydration guard |
| `ProfileScreen` | theme cycle and preferences, all persisted |

## Where each task shows up

| Task | Used here as |
|------|--------------|
| 1 Navigation setup | providers in `App.jsx`, in the required order |
| 2 Stack | Home → Details inside the tab |
| 3 Bottom tabs | the four tabs |
| 4 Drawer | Shop / Tasks / Settings / Help / About |
| 5 Route params | `Details` reads and guards `route.params.id` |
| 6 Deep linking | `day8://product/4` opens Details directly |
| 7 API service | every screen calls `@services`, never `fetch` |
| 8 Data screens | loading, success, empty, error on all three lists |
| 9 Pull to refresh | Home and Saved |
| 10 AsyncStorage | theme, favourites, preferences |
| 11 Custom hooks | `useApi`, `useTheme`, `useDebounce`, `useAsyncStorage` |
| 12 Search & favourites | the Search and Saved tabs |

## One detail worth noticing

`ProductRow` takes an `onPress`, not `navigation`. That's why the same component works on Home,
Search and Saved. A component that navigates itself can only be used where that destination makes
sense.
