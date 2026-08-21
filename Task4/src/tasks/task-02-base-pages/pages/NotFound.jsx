import { Link, useLocation, useNavigate } from "react-router-dom";

export default function NotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="state">
      <strong>404 — no route matches</strong>
      <p>
        Nothing is registered at <code>{pathname}</code>.
      </p>
      <div className="row" style={{ justifyContent: "center", marginTop: "0.7rem" }}>
        <Link className="btn" to="/">
          Go home
        </Link>
        {/* navigate(-1) walks back through history, like the browser's back button */}
        <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    </div>
  );
}
