// The only file that knows about the network.

const BASE = "https://jsonplaceholder.typicode.com";

export async function fetchTodos(limit = 5) {
  const res = await fetch(`${BASE}/todos?_limit=${limit}`);
  if (!res.ok) throw new Error(`Server responded with ${res.status}`);
  return res.json();
}
