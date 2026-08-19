import { Link } from "react-router-dom";
import { products, formatPrice } from "@shared/data";

export default function Products() {
  return (
    <div className="products">
      {products.slice(0, 6).map(product => (
        <article className="product" key={product.id}>
          <div className="product__thumb">{product.emoji}</div>
          <div className="product__body">
            <p className="product__name">{product.name}</p>
            <p className="product__price">{formatPrice(product.price)}</p>
            {/* The id becomes a URL segment — task 5 picks it up with useParams */}
            <Link className="btn btn--sm" to={`/dynamic-routes/${product.id}`}>
              View details
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
