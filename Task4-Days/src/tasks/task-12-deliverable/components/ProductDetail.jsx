import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getProductById } from "@services";
import { useFetch, useDocumentTitle } from "@hooks";
import { formatPrice, titleCase } from "@shared/data";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const {
    data: product,
    loading,
    error,
    retry
  } = useFetch(options => getProductById(id, options), [id]);

  useDocumentTitle(product?.title ?? "Product");

  const backTo = `/deliverable${params.toString() ? `?${params}` : ""}`;

  if (loading) {
    return (
      <div className="stack">
        <div className="skeleton" style={{ height: "1.6rem", width: "40%" }} />
        <div className="skeleton" style={{ height: "12rem" }} />
        <div className="skeleton" style={{ height: "4rem" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="state state--error">
        <strong>Couldn&apos;t load product {id}</strong>
        <p>{error}</p>
        <div className="row" style={{ justifyContent: "center", marginTop: "0.7rem" }}>
          <button type="button" className="btn" onClick={retry}>
            Try again
          </button>
          <Link className="btn btn--ghost" to={backTo}>
            All products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="stack">
      <div className="row">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Link className="btn btn--ghost btn--sm" to={backTo}>
          All products (filters kept)
        </Link>
      </div>

      <div className="card stack">
        <div className="row" style={{ gap: "1rem", alignItems: "flex-start", flexWrap: "nowrap" }}>
          {product.thumbnail && (
            <img
              src={product.thumbnail}
              alt={product.title}
              style={{
                width: "140px",
                flex: "none",
                borderRadius: "10px",
                border: "1px solid var(--line)"
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <h3>{product.title}</h3>
            <p className="tiny muted">
              {product.brand ? `${product.brand} · ` : ""}
              {titleCase(product.category)}
            </p>
            <p className="product__price" style={{ marginTop: "0.35rem" }}>
              {formatPrice(product.price)}
            </p>
            <div className="row" style={{ marginTop: "0.35rem" }}>
              <span className={`badge ${product.stock > 10 ? "badge--ok" : "badge--warn"}`}>
                {product.stock} in stock
              </span>
              <span className="badge">{product.rating} / 5</span>
              {product.discountPercentage > 0 && (
                <span className="badge badge--warn">
                  -{Math.round(product.discountPercentage)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="small muted">{product.description}</p>

        <div className="row">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={Number(id) <= 1}
            onClick={() => navigate(`/deliverable/${Number(id) - 1}?${params}`)}
          >
            ← Previous
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => navigate(`/deliverable/${Number(id) + 1}?${params}`)}
          >
            Next →
          </button>
          <Link className="btn btn--sm btn--ghost" to={`/deliverable?category=${product.category}`}>
            More in {titleCase(product.category)}
          </Link>
        </div>

        <p className="tiny muted">
          Route <code>/deliverable/{id}</code> — useParams drives the request, useFetch aborts the
          previous one when you press Next.
        </p>
      </div>
    </div>
  );
}
