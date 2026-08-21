import { request, buildQuery } from "./http";

export function getUsers({ limit = 10, skip = 0 } = {}, options = {}) {
  return request(`/users${buildQuery({ limit, skip })}`, options);
}

export function getUserById(id, options = {}) {
  return request(`/users/${id}`, options);
}
