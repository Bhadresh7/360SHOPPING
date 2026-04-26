import { useMemo } from "react";
import { formatINR } from "../lib/format";
import { useApp } from "../context/AppContext";

export function CartDrawer() {
  const {
    cartDrawerOpen,
    setCartDrawerOpen,
    cart,
    changeCartQty,
    removeFromCart,
    isBootstrapping
  } = useApp();

  const hasItems = useMemo(() => (cart?.items.length ?? 0) > 0, [cart?.items.length]);

  return (
    <>
      <div
        className={`drawer-backdrop ${cartDrawerOpen ? "show" : ""}`}
        onClick={() => setCartDrawerOpen(false)}
        role="presentation"
      />
      <aside className={`cart-drawer ${cartDrawerOpen ? "open" : ""}`} aria-label="Cart Drawer">
        <header>
          <h3>Cart</h3>
          <button type="button" className="icon-btn" onClick={() => setCartDrawerOpen(false)}>
            ✕
          </button>
        </header>

        {isBootstrapping ? (
          <div className="skeleton-list">
            <div className="skeleton h-72" />
            <div className="skeleton h-72" />
          </div>
        ) : !hasItems ? (
          <div className="empty-state compact">
            <span>🛒</span>
            <h4>Your cart is empty</h4>
            <p>Add products from Udhikxa Luxe to see them here.</p>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {cart?.items.map((item) => (
                <article className="drawer-item" key={item.id}>
                  <div className="emoji">{item.product.imageEmoji}</div>
                  <div>
                    <h4>{item.product.name}</h4>
                    <p>
                      {item.size} · {item.color}
                    </p>
                    <strong>{formatINR(item.product.pricePaise)}</strong>
                  </div>
                  <div className="qty-stack">
                    <div className="qty-stepper">
                      <button
                        type="button"
                        onClick={() =>
                          void changeCartQty(item.id, Math.max(1, item.quantity - 1))
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          void changeCartQty(item.id, Math.min(10, item.quantity + 1))
                        }
                      >
                        +
                      </button>
                    </div>
                    <button type="button" className="link-btn" onClick={() => void removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <footer className="drawer-footer">
              <label htmlFor="coupon">Promo code</label>
              <div className="coupon-row">
                <input id="coupon" placeholder="Enter code" />
                <button type="button" className="btn-corp">
                  Apply
                </button>
              </div>
              <div className="summary-grid">
                <span>Subtotal</span>
                <strong>{formatINR(cart!.summary.subtotalPaise)}</strong>
                <span>Shipping</span>
                <strong>{formatINR(cart!.summary.shippingPaise)}</strong>
                <span>Tax</span>
                <strong>{formatINR(cart!.summary.taxPaise)}</strong>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{formatINR(cart!.summary.totalPaise)}</strong>
              </div>
              <button type="button" className="btn-gold full">
                Checkout
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}