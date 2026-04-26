import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchGlobal } from "../lib/api";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

interface SearchResult {
  pages: Array<{ route: string; label: string }>;
  products: Array<{ id: string; name: string; category: string; imageEmoji: string }>;
  orders: Array<{ id: string; orderNo: string; status: string }>;
  help: string[];
}

export function SearchModal() {
  const navigate = useNavigate();
  const { searchOpen, setSearchOpen } = useApp();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult>({ pages: [], products: [], orders: [], help: [] });

  useEffect(() => {
    if (!searchOpen || query.trim().length < 2) {
      setResult({ pages: [], products: [], orders: [], help: [] });
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchGlobal(query);
        setResult(data as SearchResult);
      } catch {
        toast("Search is currently unavailable", "warning", 1800);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, searchOpen, toast]);

  const isEmpty = useMemo(
    () =>
      !loading &&
      result.pages.length === 0 &&
      result.products.length === 0 &&
      result.orders.length === 0 &&
      result.help.length === 0,
    [loading, result]
  );

  if (!searchOpen) {
    return null;
  }

  return (
    <div className="search-overlay" role="presentation" onClick={() => setSearchOpen(false)}>
      <div className="search-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="search-head">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, products, orders, help..."
          />
          <button type="button" onClick={() => setSearchOpen(false)} className="icon-btn">
            ✕
          </button>
        </div>
        <div className="search-body">
          {loading ? (
            <div className="skeleton-list">
              <div className="skeleton h-72" />
              <div className="skeleton h-72" />
              <div className="skeleton h-72" />
            </div>
          ) : (
            <>
              <section>
                <h4>Pages</h4>
                <div className="search-list">
                  {result.pages.map((page) => (
                    <button
                      key={page.route}
                      type="button"
                      onClick={() => {
                        navigate(`/${page.route}`);
                        setSearchOpen(false);
                      }}
                    >
                      {page.label}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h4>Products</h4>
                <div className="search-list">
                  {result.products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        navigate(`/view-product/${product.id}`);
                        setSearchOpen(false);
                      }}
                    >
                      {product.imageEmoji} {product.name}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h4>Orders</h4>
                <div className="search-list">
                  {result.orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        navigate("/view-orders");
                        setSearchOpen(false);
                      }}
                    >
                      {order.orderNo} · {order.status}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h4>Help</h4>
                <div className="search-list">
                  {result.help.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        navigate("/view-help");
                        setSearchOpen(false);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {isEmpty ? (
            <div className="empty-state compact">
              <span>🔎</span>
              <h4>No matches yet</h4>
              <p>Try keywords like order, studio, saree, rewards, or support.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}