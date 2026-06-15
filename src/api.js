/**
 * api.js  — centralised fetch helpers for the Petal & Bow REST API
 * Base URL is empty so Vite's proxy forwards /api/* → http://localhost:5000
 */

const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Products ──────────────────────────────────────────────────────────────
export const getProducts = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "All"))
  ).toString();
  return request(`/products${qs ? "?" + qs : ""}`);
};
export const getProduct       = (id)   => request(`/products/${id}`);
export const createProduct    = (body) => request("/products", { method: "POST", body: JSON.stringify(body) });
export const updateProduct    = (id, body) => request(`/products/${id}`, { method: "PUT",  body: JSON.stringify(body) });
export const deleteProduct    = (id)   => request(`/products/${id}`, { method: "DELETE" });

// ── Orders ────────────────────────────────────────────────────────────────
export const getOrders        = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "All"))
  ).toString();
  return request(`/orders${qs ? "?" + qs : ""}`);
};
export const createOrder      = (body) => request("/orders", { method: "POST", body: JSON.stringify(body) });
export const updateOrderStatus= (id, status) => request(`/orders/${id}`, { method: "PUT",  body: JSON.stringify({ status }) });
export const deleteOrder      = (id)   => request(`/orders/${id}`, { method: "DELETE" });

// ── Customers ─────────────────────────────────────────────────────────────
export const getCustomers     = ()     => request("/customers");
export const deleteCustomer   = (id)   => request(`/customers/${id}`, { method: "DELETE" });