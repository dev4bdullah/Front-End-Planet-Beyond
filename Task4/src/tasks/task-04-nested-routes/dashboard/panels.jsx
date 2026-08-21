import { Link, useOutletContext, useParams, useNavigate } from "react-router-dom";
import { products, users, formatPrice, titleCase } from "@shared/data";

export function Overview() {
  const { user } = useOutletContext();
  const inStock = products.filter(item => item.stock > 0).length;

  return (
    <div className="stack">
      <div className="grid">
        <div className="stat">
          <b>{products.length}</b>
          <span>Products</span>
        </div>
        <div className="stat">
          <b>{inStock}</b>
          <span>In stock</span>
        </div>
        <div className="stat">
          <b>{users.length}</b>
          <span>Users</span>
        </div>
      </div>
      <div className="card card--flat">
        <p className="small">
          Signed in as <strong>{user.name}</strong> — read through two layers of outlet context.
        </p>
        <p className="tiny muted">
          This is the index route: it renders at <code>/nested-routes</code> with no extra segment.
        </p>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, settings } = useOutletContext();

  return (
    <div className="card">
      <h3>Profile</h3>
      <table className="table" style={{ marginTop: "0.5rem" }}>
        <tbody>
          {[
            ["Name", user.name],
            ["Role", user.role],
            ["Email", user.email],
            ["Theme", settings.theme],
            ["Density", settings.density]
          ].map(([key, value]) => (
            <tr key={key}>
              <td className="muted">{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashProducts() {
  return (
    <div className="card">
      <h3>Products</h3>
      <table className="table" style={{ marginTop: "0.5rem" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th style={{ textAlign: "right" }}>Price</th>
            <th style={{ textAlign: "right" }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.slice(0, 6).map(product => (
            <tr key={product.id}>
              <td>
                <Link to={`/dynamic-routes/${product.id}`}>{product.name}</Link>
              </td>
              <td className="muted">{titleCase(product.category)}</td>
              <td style={{ textAlign: "right" }}>{formatPrice(product.price)}</td>
              <td style={{ textAlign: "right" }}>
                {product.stock === 0 ? (
                  <span className="badge badge--bad">out</span>
                ) : (
                  product.stock
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Analytics() {
  const byCategory = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + product.price * product.stock;
    return acc;
  }, {});

  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] ?? 1;

  return (
    <div className="card">
      <h3>Inventory value by category</h3>
      <ul className="stack" style={{ listStyle: "none", marginTop: "0.6rem", gap: "0.4rem" }}>
        {entries.map(([category, value]) => (
          <li key={category} className="row" style={{ gap: "0.6rem", flexWrap: "nowrap" }}>
            <span className="tiny" style={{ width: "90px", flex: "none" }}>
              {titleCase(category)}
            </span>
            <span
              style={{
                flex: 1,
                height: "9px",
                background: "var(--sunk)",
                borderRadius: "999px",
                overflow: "hidden"
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: `${(value / max) * 100}%`,
                  background: "var(--brand)",
                  borderRadius: "999px"
                }}
              />
            </span>
            <span className="tiny" style={{ width: "62px", textAlign: "right", flex: "none" }}>
              {formatPrice(value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DashSettings() {
  const { settings, updateSetting } = useOutletContext();

  return (
    <div className="card stack">
      <h3>Dashboard settings</h3>
      <div>
        <label htmlFor="density">Density</label>
        <select
          id="density"
          value={settings.density}
          onChange={event => updateSetting("density", event.target.value)}
        >
          <option value="cosy">Cosy</option>
          <option value="compact">Compact</option>
        </select>
      </div>
      <p className="tiny muted">
        Writes straight into MainLayout&apos;s state through outlet context — no props were passed
        down to get here.
      </p>
    </div>
  );
}

export function Users() {
  return (
    <div className="card">
      <h3>User management</h3>
      <ul className="list" style={{ marginTop: "0.6rem" }}>
        {users.map(user => (
          <li className="list__item" key={user.id}>
            <span className="list__text">
              <strong>{user.name}</strong>
              <span className="tiny muted"> · {user.role}</span>
            </span>
            {/* Two levels deep AND dynamic: /nested-routes/users/:id */}
            <Link className="btn btn--sm btn--ghost" to={`/nested-routes/users/${user.id}`}>
              Open
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = users.find(item => String(item.id) === id);

  if (!user) {
    return (
      <div className="state state--error">
        <strong>No user with id {id}</strong>
        <p>The route matched, but the data didn&apos;t.</p>
        <button
          type="button"
          className="btn"
          style={{ marginTop: "0.6rem" }}
          onClick={() => navigate("/nested-routes/users")}
        >
          Back to users
        </button>
      </div>
    );
  }

  return (
    <div className="card stack">
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        style={{ alignSelf: "flex-start" }}
        onClick={() => navigate("/nested-routes/users")}
      >
        ← Back to users
      </button>

      <h3>{user.name}</h3>
      <table className="table">
        <tbody>
          {[
            ["Role", user.role],
            ["Email", user.email],
            ["City", user.city],
            ["Orders", user.orders]
          ].map(([key, value]) => (
            <tr key={key}>
              <td className="muted">{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="tiny muted">
        Route: <code>/nested-routes/users/{id}</code> — a dynamic segment inside a nested layout,
        three levels down.
      </p>
    </div>
  );
}
