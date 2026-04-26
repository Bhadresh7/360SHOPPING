import { NavLink } from "react-router-dom";

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
  drawer?: "cart";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  sections: NavSection[];
  onToggle: () => void;
  onOpenCart: () => void;
}

export function Sidebar({ collapsed, sections, onToggle, onOpenCart }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button type="button" className="collapse-btn" onClick={onToggle}>
        {collapsed ? "›" : "‹"}
      </button>
      {sections.map((section) => (
        <section key={section.title} className="nav-group">
          <h4>{section.title}</h4>
          <nav>
            {section.items.map((item) =>
              item.drawer === "cart" ? (
                <button
                  key={item.label}
                  type="button"
                  className="nav-link"
                  data-preview={`${item.icon} ${item.label}`}
                  onClick={onOpenCart}
                >
                  <span>{item.icon}</span>
                  <em>{item.label}</em>
                  {item.badge ? <b>{item.badge}</b> : null}
                </button>
              ) : (
                <NavLink
                  key={item.route}
                  to={`/${item.route}`}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  data-preview={`${item.icon} ${item.label}`}
                >
                  <span>{item.icon}</span>
                  <em>{item.label}</em>
                  {item.badge ? <b>{item.badge}</b> : null}
                </NavLink>
              )
            )}
          </nav>
        </section>
      ))}
    </aside>
  );
}