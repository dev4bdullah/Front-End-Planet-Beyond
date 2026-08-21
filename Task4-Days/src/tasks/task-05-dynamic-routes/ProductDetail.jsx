import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { products, formatPrice, titleCase } from "@shared/data";

/* Task 5 — the :id segment arrives through useParams and drives everything. */

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const numericId = Number(id);
  const product = products.find(item => item.id === numericId);

  // Preserve whatever filters the list page had, so Back returns to the same view
  const backTo = `/url-search-params${params.toString() ? `?${params}` : ""}`;

  if (!product) {
    return (
      <div className="state state--error">
        <strong>No product with id {id}</strong>
        <p>
          The route matched — <code>:id</code> accepts anything — but no record exists. Route
          matching and data existing are two different questions.
        </p>
        <div className="row" style={{ justifyContent: "center", marginTop: "0.7rem" }}>
          <Link className="btn" to="/dynamic-routes">
            All products
          </Link>
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  const prev = products.find(item => item.id === numericId - 1);
  const next = products.find(item => item.id === numericId + 1);

  return (
    <div className="stack">
      <div className="row">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Link className="btn btn--ghost btn--sm" to={backTo}>
          All products
        </Link>
      </div>

      <div className="card stack">
        <div className="row" style={{ gap: "0.9rem", flexWrap: "nowrap" }}>
          <div
            className="product__thumb"
            style={{ width: "88px", flex: "none", borderRadius: "10px" }}
          >
            {product.emoji}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3>{product.name}</h3>
            <p className="tiny muted">
              {product.brand} · {titleCase(product.category)}
            </p>
            <p className="product__price" style={{ marginTop: "0.3rem" }}>
              {formatPrice(product.price)}
            </p>
          </div>
        </div>

        <table className="table">
          <tbody>
            {[
              ["Product id", product.id],
              ["Rating", `${product.rating} / 5`],
              ["Stock", product.stock === 0 ? "Out of stock" : `${product.stock} units`],
              ["Category", titleCase(product.category)]
            ].map(([key, value]) => (
              <tr key={key}>
                <td className="muted">{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="row">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={!prev}
            onClick={() => navigate(`/dynamic-routes/${numericId - 1}`)}
          >
            ← Previous
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={!next}
            onClick={() => navigate(`/dynamic-routes/${numericId + 1}`)}
          >
            Next →
          </button>
          <span className="tiny muted">
            The URL id changes and this component re-renders with new params — it never unmounts.
          </span>
        </div>
      </div>
    </div>
  );
}
