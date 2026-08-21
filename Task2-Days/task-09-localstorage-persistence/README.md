# Task 9 — LocalStorage Persistence

> Sheet description: Save tasks, selected filter, search query, and theme preference to localStorage and restore on reload

## Run it

Right-click `index.html` → **Open with Live Server**. Change anything, press `F5`, and it comes
back. The raw JSON currently in storage is printed live at the bottom of the page.

## Five things this handles that a naive version doesn't

**One key, one object.** Not five separate keys. One read on load, one write on change, and the
pieces can never fall out of sync with each other.

**`try/catch` on both read and write.** localStorage genuinely throws — private mode on older
Safari, a full quota, blocked third-party storage. Press **Corrupt the storage** then refresh: the
app recovers with a console warning instead of a white screen.

**Spread over defaults on load.** `{ ...defaults, ...parsed }` means a key you add next week is
never `undefined` for a user with old data saved.

**A version number.** When the shape changes, old data is migrated rather than crashing.

**The `storage` event.** Open the page in two tabs and edit one — the other notices. It fires only
in the *other* tabs, never the one that made the change.

## localStorage vs sessionStorage

| | localStorage | sessionStorage |
|---|---|---|
| Survives refresh | yes | yes |
| Survives closing the tab | yes | **no** |
| Shared between tabs | yes | **no** |
| Typical limit | ~5MB per origin | ~5MB per origin |

## Three facts people trip over

- **Strings only.** Hence `JSON.stringify` going in and `JSON.parse` coming out. Store a number and
  you get a string back.
- **Synchronous.** Writing a large object on every keystroke blocks the main thread. Debounce if the
  object gets big.
- **Not secure.** Any script on the page can read it. Never store tokens, passwords or personal data.

## Verify

1. Add tasks, tick one, type a search, pick a filter, switch to dark mode
2. Press `F5` — all of it returns
3. DevTools → **Application** → Local Storage → your origin
4. Find `day2.task09.state` and compare it to the panel on the page
5. Press **Corrupt the storage**, refresh, watch it recover
