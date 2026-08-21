import { Link, Outlet, useLocation, useOutletContext, useParams } from "react-router-dom";
import { PageHeader, Section } from "@shared/Section";
import { products, formatPrice } from "@shared/data";

export default function Page() {
  const { pathname } = useLocation();
  const app = useOutletContext();
  const params = useParams();
  const isDetail = Object.keys(params).length > 0;

  return (
    <>
      <PageHeader
        number={5}
        title="Dynamic Routes"
        brief="Use useParams to build product/user detail pages from route IDs"
        lead="One route definition, twelve pages. The :id segment is the whole mechanism."
      />

      <Section
        title={isDetail ? "Detail view" : "Pick a product"}
        note={
          isDetail
            ? "This panel is a child route. The list is gone, but the page heading and everything below stayed."
            : "Click any product — the id goes into the URL and useParams reads it back out."
        }
      >
        {isDetail ? (
          <Outlet context={app} />
        ) : (
          <div className="products">
            {products.slice(0, 8).map(product => (
              <article className="product" key={product.id}>
                <div className="product__thumb">{product.emoji}</div>
                <div className="product__body">
                  <p className="product__name">{product.name}</p>
                  <p className="tiny muted">id: {product.id}</p>
                  <p className="product__price">{formatPrice(product.price)}</p>
                  <Link className="btn btn--sm" to={`/dynamic-routes/${product.id}`}>
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="tiny muted">
          URL: <code>{pathname}</code>
          {isDetail && (
            <>
              {" "}
              · params: <code>{JSON.stringify(params)}</code>
            </>
          )}
        </p>
      </Section>

      <Section
        title="The route and the hook"
        note="The segment name in the route becomes the key in the object. Rename :id to :productId and useParams gives you productId — they're the same string."
        code={`// routes.jsx
{ path: "dynamic-routes", element: <DynamicRoutesPage />, children: [
  { path: ":id", element: <ProductDetail /> }
]}

// ProductDetail.jsx
const { id } = useParams();
const product = products.find(item => item.id === Number(id));`}
      >
        <div className="row">
          <Link className="btn btn--sm btn--ghost" to="/dynamic-routes/1">
            /dynamic-routes/1
          </Link>
          <Link className="btn btn--sm btn--ghost" to="/dynamic-routes/7">
            /dynamic-routes/7
          </Link>
          <Link className="btn btn--sm btn--ghost" to="/dynamic-routes/99999">
            /dynamic-routes/99999
          </Link>
        </div>
        <p className="tiny muted">The last one matches the route and finds no record — try it.</p>
      </Section>

      <Section
        title="Three things that catch people"
        code={`// 1. params are ALWAYS strings
const { id } = useParams();
products.find(p => p.id === id)          // ❌ 1 === "1" is false
products.find(p => p.id === Number(id))  // ✅

// 2. a matched route is not found data
//    :id accepts anything. Handle the not-found case yourself.
if (!product) return <NotFoundState id={id} />;

// 3. changing the id RE-RENDERS, it doesn't remount
//    so an effect keyed on [id] is what refetches — see task 10
useEffect(() => { load(id); }, [id]);`}
      >
        <p className="section__note">
          The third one is the source of the classic bug: fetch in a <code>useEffect(..., [])</code>{" "}
          and the Next button changes the URL while the data stays on the first product forever.
        </p>
      </Section>

      <Section
        title="Optional and catch-all segments"
        code={`{ path: "products/:id?" }        // optional — matches with and without
{ path: "files/*" }              // catch-all — everything after files/

const { "*": rest } = useParams();   // read the splat with this odd key`}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Pattern</th>
              <th>Matches</th>
              <th>params</th>
            </tr>
          </thead>
          <tbody>
            {[
              [":id", "/dynamic-routes/7", '{ id: "7" }'],
              [":category/:id", "/shop/audio/7", '{ category: "audio", id: "7" }'],
              [":id?", "/products and /products/7", '{} or { id: "7" }'],
              ["*", "/files/a/b/c.pdf", '{ "*": "a/b/c.pdf" }']
            ].map(([pattern, matches, result]) => (
              <tr key={pattern}>
                <td>
                  <code>{pattern}</code>
                </td>
                <td className="muted">{matches}</td>
                <td>
                  <code>{result}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="Params vs search params"
        note="A rule that saves a lot of arguing: params identify WHAT you're looking at, search params describe HOW you're looking at it."
        code={`/products/7                        ← which product      (useParams)
/products?sort=price&page=2        ← how the list is shown (useSearchParams)

// a filter is never a path segment — /products/audio/cheap/page-2
// has no meaning to a router and can't express "no category"`}
      >
        <p className="section__note">
          Task 6 covers the other half. The Back button on the detail page above preserves the
          list&apos;s search string precisely because the two are kept separate.
        </p>
      </Section>
    </>
  );
}
