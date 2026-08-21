import { Link, useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useOutletContext();

  return (
    <div className="stack">
      <div className="card">
        <h3>Welcome back, {user.name.split(" ")[0]}</h3>
        <p className="small muted">
          Twelve tasks, one routed catalogue. Pick one from the sidebar, or jump straight to the
          deliverable.
        </p>
        <div className="row" style={{ marginTop: "0.6rem" }}>
          <Link className="btn" to="/deliverable">
            Open the deliverable
          </Link>
          {/* useNavigate — for navigating from code rather than from a click on a link */}
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate("/url-search-params?search=monitor&sort=price-asc")}
          >
            Jump to a pre-filtered view
          </button>
        </div>
      </div>
    </div>
  );
}
