# Task 5 — Dynamic Routes

> Sheet description: Use useParams to build product/user detail pages from route IDs

## The whole mechanism

```jsx
{ path: ":id", element: <ProductDetail /> }

const { id } = useParams();
```

The segment name in the route becomes the key in the object. Rename `:id` to `:productId` and
`useParams` gives you `productId` — they're the same string.

## Three things that catch people

**1 · Params are always strings.**

```js
products.find(p => p.id === id)           // ❌ 1 === "1" is false
products.find(p => p.id === Number(id))   // ✅
```

**2 · A matched route is not found data.** `:id` accepts anything. `/dynamic-routes/99999` matches
the route perfectly and finds no record — handle that case yourself. Try it on the page.

**3 · Changing the id re-renders, it doesn't remount.** So a `useEffect(..., [])` fetch leaves your
detail page stuck on the first product forever while the URL changes. The dependency array has to
include the param — task 10 covers the rest.

## Patterns

| Pattern | Matches | params |
|---------|---------|--------|
| `:id` | `/products/7` | `{ id: "7" }` |
| `:category/:id` | `/shop/audio/7` | `{ category: "audio", id: "7" }` |
| `:id?` | `/products` and `/products/7` | `{}` or `{ id: "7" }` |
| `*` | `/files/a/b/c.pdf` | `{ "*": "a/b/c.pdf" }` |

The splat is read with that odd key: `const { "*": rest } = useParams()`.

## Params vs search params

**Params identify *what* you're looking at. Search params describe *how*.**

```
/products/7                     ← which product        (useParams)
/products?sort=price&page=2     ← how the list is shown (useSearchParams)
```

A filter is never a path segment. `/products/audio/cheap/page-2` has no meaning to a router and
can't express "no category selected".

Keeping them separate is what lets the Back button on the detail page restore the list's exact
filters — it just carries the search string through.
