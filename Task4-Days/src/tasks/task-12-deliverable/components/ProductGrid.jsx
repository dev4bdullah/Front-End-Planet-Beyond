import { Link, useSearchParams } from "react-router-dom";
import { formatPrice, titleCase } from "@shared/data";

export default function ProductGrid({ products }) {
  const [params] = useSearchParams();
  const suffix = params.toString() ? `?${params}` : "";

  return (
    <div className="products">
      {products.map(product => (
        <article className="product" key={product.id}>
          <div className="product__thumb">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt=""
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              (product.emoji ?? "📦")
            )}
          </div>

          <div className="product__body">
            <p className="product__name">{product.title ?? product.name}</p>
            <p className="tiny muted">{titleCase(product.category)}</p>
            <p className="product__price">{formatPrice(product.price)}</p>

            <span className={`badge ${product.stock > 10 ? "badge--ok" : "badge--warn"}`}>
              {product.stock} in stock
            </span>

            {/* Carry the current filters, so Back returns to the same view */}
            <Link className="btn btn--sm" to={`/deliverable/${product.id}${suffix}`}>
              View details
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
