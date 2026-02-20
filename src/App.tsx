import React, { useEffect, useMemo, useState } from "react";

type Route =
  | "/"
  | "/search"
  | "/sell"
  | "/signin"
  | "/contact"
  | "/help"
  | "/terms"
  | "/privacy"
  | "/cookies"
  | "/disclaimer";

export default function App() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [route, setRoute] = useState<Route>(getRouteFromLocation());

  // Inject responsive CSS once
  useEffect(() => {
    const id = "spareshub-responsive-style";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @media (max-width: 720px) {
        .spareshub-cta-row { grid-template-columns: 1fr !important; }
        .spareshub-hero-title { font-size: 34px !important; }
        .spareshub-footer-grid { grid-template-columns: 1fr 1fr !important; }
        .spareshub-topnav { gap: 8px !important; }
      }
      @media (max-width: 440px) {
        .spareshub-footer-grid { grid-template-columns: 1fr !important; }
        .spareshub-hero-title { font-size: 30px !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Browser back/forward support
  useEffect(() => {
    const onPopState = () => setRoute(getRouteFromLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(to: Route) {
    if (to === route) return;
    window.history.pushState({}, "", to);
    setRoute(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={styles.appShell}>
      <header style={styles.topBar}>
        <div style={styles.topBarInner}>
          <button onClick={() => navigate("/")} style={styles.brandButton} aria-label="Go to home">
            <span style={styles.brandMark}>Spares</span>
            <span style={styles.brandMarkAlt}>Hub</span>
          </button>

          <nav className="spareshub-topnav" style={styles.topNav}>
            <NavLink label="Search" to="/search" route={route} onNav={navigate} />
            <NavLink label="Sell" to="/sell" route={route} onNav={navigate} />
            <NavLink label="Sign In" to="/signin" route={route} onNav={navigate} />
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        {route === "/" && <Landing onNav={navigate} />}
        {route === "/search" && <SearchPage onNav={navigate} />}
        {route === "/sell" && <SellPage onNav={navigate} />}
        {route === "/signin" && <SignInPage onNav={navigate} />}
        {route === "/contact" && <ContactPage />}
        {route === "/help" && <HelpPage />}
        {route === "/terms" && <LegalPage title="Terms & Conditions" kind="terms" />}
        {route === "/privacy" && <LegalPage title="Privacy Policy" kind="privacy" />}
        {route === "/cookies" && <LegalPage title="Cookie Policy" kind="cookies" />}
        {route === "/disclaimer" && <LegalPage title="Disclaimer" kind="disclaimer" />}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div className="spareshub-footer-grid" style={styles.footerGrid}>
            <div>
              <div style={styles.footerBrand}>
                <span style={styles.footerBrandA}>Spares</span>
                <span style={styles.footerBrandB}>Hub</span>
              </div>
              <p style={styles.footerText}>
                The simplest way to find and sell classic & historic vehicle parts.
                <br />
                Built for enthusiasts, workshops, and traders.
              </p>
              <div style={styles.footerTiny}>© {year} SparesHub. All rights reserved.</div>
            </div>

            <div>
              <div style={styles.footerHeading}>Site</div>
              <FooterLink label="Home" to="/" onNav={navigate} />
              <FooterLink label="Search" to="/search" onNav={navigate} />
              <FooterLink label="Sell" to="/sell" onNav={navigate} />
              <FooterLink label="Sign In" to="/signin" onNav={navigate} />
              <FooterLink label="Help / FAQ" to="/help" onNav={navigate} />
            </div>

            <div>
              <div style={styles.footerHeading}>Legal</div>
              <FooterLink label="Terms & Conditions" to="/terms" onNav={navigate} />
              <FooterLink label="Privacy Policy" to="/privacy" onNav={navigate} />
              <FooterLink label="Cookie Policy" to="/cookies" onNav={navigate} />
              <FooterLink label="Disclaimer" to="/disclaimer" onNav={navigate} />
            </div>

            <div>
              <div style={styles.footerHeading}>Contact</div>
              <FooterLink label="Contact Us" to="/contact" onNav={navigate} />
              <div style={styles.footerText}>For partnership enquiries, press, or support:</div>
              <div style={styles.footerPill}>hello@spareshub.uk</div>
            </div>
          </div>

          <div style={styles.footerDivider} />
          <div style={styles.footerFinePrint}>
            SparesHub is a marketplace. We do not guarantee the authenticity, condition, legality, or
            fitment of items listed. Always verify compatibility and provenance before purchase.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Landing({ onNav }: { onNav: (to: Route) => void }) {
  return (
    <section>
      <div style={styles.heroWrap}>
        <div style={{ ...styles.heroImage, backgroundImage: "url(/landing.png)" }} />
        <div style={styles.heroOverlay} />

        <div style={styles.heroContent}>
          <div style={styles.heroKicker}>SPARESHUB</div>

          <h1 className="spareshub-hero-title" style={styles.heroTitle}>
            Find parts. Sell parts.
            <br />
            Keep classics moving.
          </h1>

          <p style={styles.heroSubtitle}>Click below on which app you would like to view</p>

          <div className="spareshub-cta-row" style={styles.ctaRow}>
            <button style={styles.ctaPrimary} onClick={() => onNav("/search")}>
              Start Searching
            </button>
            <button style={styles.ctaSecondary} onClick={() => onNav("/signin")}>
              Sign In
            </button>
          </div>

          <div style={styles.heroMicro}>
            By continuing you agree to our <InlineLink onClick={() => onNav("/terms")}>Terms</InlineLink>{" "}
            and <InlineLink onClick={() => onNav("/privacy")}>Privacy Policy</InlineLink>.
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchPage({ onNav }: { onNav: (to: Route) => void }) {
  const [q, setQ] = useState("");
  const results = [
    { title: "Jaguar E-Type Series 1 – Front Indicator Lens", tag: "Lighting", location: "UK" },
    { title: "Austin Healey 3000 – SU Carb Set (rebuilt)", tag: "Engine", location: "EU" },
    { title: "Porsche 911 (G-body) – Fuchs Wheel 16x7", tag: "Wheels", location: "UK" },
  ];
  const filtered = results.filter((r) =>
    (r.title + " " + r.tag + " " + r.location).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PageShell
      title="Search Parts"
      subtitle="Search across verified sellers and enthusiasts. (MVP placeholder)"
      right={<PrimarySmall onClick={() => onNav("/")}>Back to landing</PrimarySmall>}
    >
      <div style={styles.card}>
        <div style={styles.fieldLabel}>Search</div>
        <input
          style={styles.input}
          placeholder="e.g. E-Type indicator, Weber 45, Dunlop caliper…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div style={{ height: 12 }} />
        <div style={styles.grid3}>
          <MiniPill>Make</MiniPill>
          <MiniPill>Model</MiniPill>
          <MiniPill>Category</MiniPill>
        </div>
      </div>

      <div style={{ height: 16 }} />
      <div style={styles.sectionHeading}>Results</div>
      <div style={styles.list}>
        {filtered.map((r, idx) => (
          <div key={idx} style={styles.listRow}>
            <div style={{ fontWeight: 800 }}>{r.title}</div>
            <div style={styles.listMeta}>
              <span style={styles.metaChip}>{r.tag}</span>
              <span style={styles.metaChip}>{r.location}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={styles.empty}>No results yet — try a broader search.</div>}
      </div>
    </PageShell>
  );
}

function SellPage({ onNav }: { onNav: (to: Route) => void }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");

  return (
    <PageShell
      title="Sell a Part"
      subtitle="List your part in seconds. (MVP placeholder)"
      right={<PrimarySmall onClick={() => onNav("/")}>Back to landing</PrimarySmall>}
    >
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div>
            <div style={styles.fieldLabel}>Listing title</div>
            <input
              style={styles.input}
              placeholder="e.g. Jaguar XK150 headlamp bowl (pair)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <div style={styles.fieldLabel}>Price</div>
            <input
              style={styles.input}
              placeholder="e.g. £250"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <div style={styles.fieldLabel}>Location</div>
            <input
              style={styles.input}
              placeholder="e.g. West Sussex, UK"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <div style={styles.fieldLabel}>Photos</div>
            <div style={styles.dropZone}>Photo upload coming next</div>
          </div>
        </div>

        <div style={{ height: 14 }} />
        <button
          style={styles.ctaPrimarySolid}
          onClick={() => alert("MVP: Listing saved locally (placeholder).")}
        >
          Publish Listing
        </button>
        <div style={styles.heroMicroDark}>This is an MVP placeholder. Next we’ll add real auth & saving.</div>
      </div>
    </PageShell>
  );
}

function SignInPage({ onNav }: { onNav: (to: Route) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <PageShell
      title="Sign In"
      subtitle="Access saved searches and listings. (MVP placeholder)"
      right={<PrimarySmall onClick={() => onNav("/")}>Back to landing</PrimarySmall>}
    >
      <div style={styles.cardNarrow}>
        <div style={styles.fieldLabel}>Email</div>
        <input style={styles.input} placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div style={{ height: 12 }} />
        <div style={styles.fieldLabel}>Password</div>
        <input style={styles.input} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div style={{ height: 14 }} />
        <button style={styles.ctaPrimarySolid} onClick={() => alert("MVP: Sign-in placeholder (no real auth yet).")}>
          Sign In
        </button>

        <div style={{ height: 12 }} />
        <div style={styles.heroMicroDark}>
          No account yet? <InlineLink onClick={() => onNav("/contact")}>Contact us</InlineLink> for early access.
        </div>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  return (
    <PageShell title="Contact" subtitle="Get in touch with SparesHub.">
      <div style={styles.cardNarrow}>
        <div style={styles.fieldLabel}>Email</div>
        <div style={styles.footerPill}>hello@spareshub.uk</div>
        <div style={{ height: 12 }} />
        <div style={styles.fieldLabel}>Message</div>
        <textarea style={styles.textarea} placeholder="Tell us what you need…" />
        <div style={{ height: 14 }} />
        <button style={styles.ctaPrimarySolid} onClick={() => alert("MVP: Message send placeholder.")}>
          Send
        </button>
      </div>
    </PageShell>
  );
}

function HelpPage() {
  return (
    <PageShell title="Help / FAQ" subtitle="Common questions (MVP placeholder).">
      <div style={styles.card}>
        <div style={styles.sectionHeading}>FAQ</div>
        <Faq q="How do I search for parts?" a="Use Search and filter by make, model, and category. We’ll add seller verification and fitment matching next." />
        <Faq q="How do I sell a part?" a="Use Sell to create a listing. In the full app, you’ll upload photos, set shipping, and manage messages." />
        <Faq q="Is SparesHub secure?" a="This is an MVP build. Next we’ll add authentication, secure storage, and audit trails." />
      </div>
    </PageShell>
  );
}

function LegalPage({ title, kind }: { title: string; kind: "terms" | "privacy" | "cookies" | "disclaimer" }) {
  return (
    <PageShell title={title} subtitle="MVP draft – to be refined with solicitor input.">
      <div style={styles.card}>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{getLegalCopy(kind)}</div>
      </div>
    </PageShell>
  );
}

function PageShell({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={styles.pageWrap}>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.pageTitle}>{title}</div>
          {subtitle && <div style={styles.pageSubtitle}>{subtitle}</div>}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

function NavLink({ label, to, route, onNav }: { label: string; to: Route; route: Route; onNav: (to: Route) => void }) {
  const active = route === to;
  return (
    <button onClick={() => onNav(to)} style={{ ...styles.navLink, ...(active ? styles.navLinkActive : null) }}>
      {label}
    </button>
  );
}

function FooterLink({ label, to, onNav }: { label: string; to: Route; onNav: (to: Route) => void }) {
  return (
    <button onClick={() => onNav(to)} style={styles.footerLink}>
      {label}
    </button>
  );
}

function InlineLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={styles.inlineLink}>
      {children}
    </button>
  );
}

function PrimarySmall({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={styles.primarySmall}>
      {children}
    </button>
  );
}

function MiniPill({ children }: { children: React.ReactNode }) {
  return <div style={styles.miniPill}>{children}</div>;
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div style={styles.faq}>
      <div style={styles.faqQ}>{q}</div>
      <div style={styles.faqA}>{a}</div>
    </div>
  );
}

function getRouteFromLocation(): Route {
  const path = (window.location.pathname || "/") as Route;
  const allowed: Route[] = ["/", "/search", "/sell", "/signin", "/contact", "/help", "/terms", "/privacy", "/cookies", "/disclaimer"];
  return (allowed.includes(path) ? path : "/") as Route;
}

function getLegalCopy(kind: "terms" | "privacy" | "cookies" | "disclaimer") {
  if (kind === "terms") {
    return `TERMS & CONDITIONS (MVP DRAFT)

1. Marketplace role
SparesHub provides a platform for buyers and sellers to connect. We are not a party to any transaction unless explicitly stated.

2. Listings and accuracy
Sellers are responsible for ensuring listings are accurate and lawful. Buyers must verify fitment and authenticity before purchase.

3. Fees
Fees (if any) will be clearly presented prior to payment.

4. Prohibited items
Illegal, stolen, counterfeit, or restricted goods are prohibited.

5. Liability
To the maximum extent permitted by law, SparesHub is not liable for losses arising from transactions between users.

6. Governing law
These terms are governed by the laws of England & Wales.`;
  }
  if (kind === "privacy") {
    return `PRIVACY POLICY (MVP DRAFT)

We collect only the information needed to provide the service (e.g. account and listing data). We do not sell your data.

Data you may provide:
- Email, name (if creating an account)
- Listing information and photos
- Messages sent through the platform

We use standard security practices. Full details and retention periods to be refined in the full release.`;
  }
  if (kind === "cookies") {
    return `COOKIE POLICY (MVP DRAFT)

We use cookies and similar technologies to:
- Keep you signed in (when enabled)
- Remember preferences
- Understand basic usage analytics

You can manage cookies via your browser settings.`;
  }
  return `DISCLAIMER (MVP DRAFT)

SparesHub is a marketplace platform only. We do not inspect items, verify authenticity, or guarantee descriptions. Any guidance is general information, not professional advice. Always verify fitment, legality, and provenance independently.`;
}

const styles: Record<string, React.CSSProperties> = {
  appShell: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "#060a12", color: "white" },
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(6, 10, 18, 0.72)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  topBarInner: {
    width: "min(1200px, 92vw)",
    margin: "0 auto",
    padding: "12px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brandButton: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    background: "transparent",
    border: "none",
    padding: 0,
    color: "white",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: 0.2,
  },
  brandMark: { color: "#19af78" },
  brandMarkAlt: { color: "white" },
  topNav: { display: "flex", gap: 10, alignItems: "center" },
  navLink: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
  },
  navLinkActive: {
    background: "rgba(25, 175, 120, 0.18)",
    border: "1px solid rgba(25, 175, 120, 0.55)",
    color: "white",
  },
  main: { flex: 1 },

  heroWrap: { position: "relative", width: "100%", overflow: "hidden" },
  heroImage: { height: "78vh", minHeight: 540, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.62))" },
  heroContent: { position: "absolute", left: "50%", top: "48%", transform: "translate(-50%, -50%)", width: "min(980px, 92vw)", padding: 16 },
  heroKicker: { fontSize: 13, letterSpacing: 1.6, opacity: 0.9, marginBottom: 10 },
  heroTitle: { margin: 0, fontSize: 46, lineHeight: 1.05, fontWeight: 900 },
  heroSubtitle: { marginTop: 12, maxWidth: 720, fontSize: 16, opacity: 0.9 },

  ctaRow: { marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, width: "min(820px, 100%)" },
  ctaPrimary: {
    height: 64,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(25, 175, 120, 0.92)",
    color: "#07130e",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 34px rgba(0,0,0,0.25)",
  },
  ctaSecondary: {
    height: 64,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(18, 22, 26, 0.82)",
    color: "white",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 34px rgba(0,0,0,0.25)",
  },
  heroMicro: { marginTop: 14, fontSize: 12, opacity: 0.8 },
  heroMicroDark: { marginTop: 10, fontSize: 12, opacity: 0.75, color: "rgba(255,255,255,0.85)" },

  inlineLink: { background: "transparent", border: "none", padding: 0, margin: 0, cursor: "pointer", color: "rgba(255,255,255,0.92)", textDecoration: "underline", fontWeight: 800 },

  pageWrap: { width: "min(1100px, 92vw)", margin: "22px auto 44px auto" },
  pageHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  pageTitle: { fontSize: 28, fontWeight: 950 },
  pageSubtitle: { marginTop: 6, fontSize: 14, opacity: 0.82 },

  card: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 16 },
  cardNarrow: { maxWidth: 520, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 16 },

  fieldLabel: { fontSize: 12, opacity: 0.85, fontWeight: 800, marginBottom: 6 },
  input: { width: "100%", height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.22)", color: "white", padding: "0 12px", outline: "none" },
  textarea: { width: "100%", minHeight: 120, borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.22)", color: "white", padding: 12, outline: "none", resize: "vertical" },
  dropZone: { height: 44, borderRadius: 12, border: "1px dashed rgba(255,255,255,0.22)", background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.85, fontSize: 13, fontWeight: 800 },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },

  ctaPrimarySolid: { width: "100%", height: 48, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(25, 175, 120, 0.92)", color: "#07130e", fontSize: 16, fontWeight: 950, cursor: "pointer" },

  primarySmall: { height: 38, padding: "0 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "white", cursor: "pointer", fontWeight: 900 },

  sectionHeading: { fontSize: 14, fontWeight: 950, opacity: 0.92, marginBottom: 10 },
  list: { borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" },
  listRow: { padding: 14, borderBottom: "1px solid rgba(255,255,255,0.08)" },
  listMeta: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" },
  metaChip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.18)", fontSize: 12, fontWeight: 850, opacity: 0.92 },
  empty: { padding: 14, opacity: 0.8 },

  miniPill: { height: 38, borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.16)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, opacity: 0.9, fontSize: 13 },

  faq: { marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.10)" },
  faqQ: { fontWeight: 950, marginBottom: 6 },
  faqA: { opacity: 0.86, lineHeight: 1.55 },

  footer: { background: "#0b1320", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "34px 16px" },
  footerInner: { width: "min(1200px, 92vw)", margin: "0 auto" },
  footerGrid: { display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 18 },
  footerBrand: { fontWeight: 950, fontSize: 18, marginBottom: 8 },
  footerBrandA: { color: "#19af78" },
  footerBrandB: { color: "white" },
  footerHeading: { fontWeight: 950, marginBottom: 10 },
  footerText: { opacity: 0.82, fontSize: 14, lineHeight: 1.5, margin: 0 },
  footerTiny: { opacity: 0.7, fontSize: 12, marginTop: 12 },
  footerPill: { display: "inline-flex", padding: "8px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.20)", fontWeight: 900, fontSize: 13, marginTop: 8 },
  footerLink: { display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "6px 0", margin: 0, cursor: "pointer", color: "rgba(255,255,255,0.86)", fontWeight: 850 },
  footerDivider: { height: 1, background: "rgba(255,255,255,0.08)", margin: "18px 0" },
  footerFinePrint: { fontSize: 12, opacity: 0.68, lineHeight: 1.55 },
};