/* Composition over configuration. Instead of a `footerButtons` prop,
   Card.Footer takes children — so the card never needs to know what goes in it. */

export default function Card({ children, variant = "default", className, ...rest }) {
  return (
    <div
      className={`card ${variant !== "default" ? `card--${variant}` : ""} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </div>
  );
}

Card.Title = function CardTitle({ children }) {
  return <h3 className="card__title">{children}</h3>;
};

Card.Body = function CardBody({ children }) {
  return <div className="card__body">{children}</div>;
};

Card.Footer = function CardFooter({ children }) {
  return <div className="card__footer">{children}</div>;
};
