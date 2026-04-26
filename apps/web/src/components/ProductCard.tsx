import { useNavigate } from "react-router-dom";
import { formatINR } from "../lib/format";
import type { Product } from "../types";
import { useApp } from "../context/AppContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart, toggleWish, wishlist } = useApp();
  const wished = wishlist.some((item) => item.product.id === product.id);

  return (
    <article className="card product-card reveal-card tilt-card" tabIndex={0}>
      <button
        type="button"
        className={`heart-btn ${wished ? "active" : ""}`}
        onClick={() => void toggleWish(product.id)}
        aria-label="Toggle wishlist"
      >
        ♥
      </button>
      <button className="image-tile" type="button" onClick={() => navigate(`/view-product/${product.id}`)}>
        <span>{product.imageEmoji}</span>
      </button>
      <div className="product-badges">
        {product.isNew && <span className="badge badge-green">New</span>}
        {product.isSale && <span className="badge badge-red">Sale</span>}
        {product.isLimited && <span className="badge badge-gold">Limited</span>}
      </div>
      <h3>{product.name}</h3>
      <p className="muted">{product.fabric}</p>
      <div className="rating-row">
        <span>{"★".repeat(Math.round(product.rating))}</span>
        <small>{product.reviewCount} reviews</small>
      </div>
      <div className="price-row">
        <strong>{formatINR(product.pricePaise)}</strong>
        {product.originalPaise ? <s>{formatINR(product.originalPaise)}</s> : null}
      </div>
      {product.seller && (
        <p className="seller-info" style={{ fontSize: '0.75rem', color: 'var(--gold-l)', marginBottom: '8px' }}>
          Sold by {product.seller.name}
        </p>
      )}
      <div className="size-dots">
        {(product.sizes ?? []).slice(0, 5).map((size) => (
          <span key={size}>{size}</span>
        ))}
      </div>
      <button
        type="button"
        className="btn-gold"
        onClick={() =>
          void addToCart({
            productId: product.id,
            size: product.sizes?.[0] ?? "M",
            color: "Default",
            quantity: 1
          })
        }
      >
        Add to Cart
      </button>
      {product.stock <= 3 ? <small className="stock-warn">Only {product.stock} left</small> : null}
    </article>
  );
}