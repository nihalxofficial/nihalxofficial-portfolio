import { NAV_LINKS } from "@/data/portfolio";

export default function Footer() {
  return (
    <footer
      className="py-12"
      style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center gap-6">
        <div className="font-syne text-[1.5rem] font-extrabold gradient-text">
          Nihal Uddin
        </div>

        <div className="flex gap-6 flex-wrap justify-center">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="no-underline text-[0.88rem] transition-colors duration-200"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--accent)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="text-[0.83rem]" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Nihal Uddin. Crafted with{" "}
          <i className="fas fa-heart" style={{ color: "#ef4444", fontSize: "0.8em" }} />{" "}
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}
