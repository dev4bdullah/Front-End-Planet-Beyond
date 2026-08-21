import { request, buildQuery } from "./http";

/* One module per resource. Nothing here knows about React — these are plain
   async functions, so they can be called from a hook, a test, or a script. */

export function getProducts(
  { limit = 12, skip = 0, search = "", category = "" } = {},
  options = {}
) {
  if (search.trim()) {
    return request(`/products/search${buildQuery({ q: search.trim(), limit, skip })}`, options);
  }
  if (category && category !== "all") {
    return request(`/products/category/${category}${buildQuery({ limit, skip })}`, options);
  }
  return request(`/products${buildQuery({ limit, skip })}`, options);
}

export function getProductById(id, options = {}) {
  return request(`/products/${id}`, options);
}

export async function getCategories(options = {}) {
  const data = await request("/products/categories", options);

  // This endpoint has shipped as both string[] and object[] over time.
  // Normalising here means no component ever has to care.
  return data.map(item =>
    typeof item === "string" ? { slug: item, name: item } : { slug: item.slug, name: item.name }
  );
}

// Points at nothing, so the error path can be demonstrated on demand
export function getBroken(options = {}) {
  return request("/products/this-endpoint-does-not-exist", options);
}
