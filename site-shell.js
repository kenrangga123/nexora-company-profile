const navigation = [
  { key: "home", label: "Home", href: "/" },
  { key: "prototype-work", label: "Prototype Work", href: "/prototype-work" },
  { key: "services", label: "Services", href: "/services" },
  { key: "solutions", label: "Solutions", href: "/solutions" },
  { key: "process", label: "Process", href: "/process" },
  { key: "about", label: "About", href: "/about" }
];
const entrySeenKey = "nexora.prototypeEntrySeen.v1";

const navigationLink = (item, activePage, className = "nav-link") => {
  const active = item.key === activePage;
  return `<a class="${className}${active ? " is-active" : ""}" href="${item.href}"${active ? ' aria-current="page"' : ""}>${item.label}</a>`;
};

export const mountSiteShell = () => {
  const activePage = document.body.dataset.page || "home";
  const headerHost = document.querySelector("[data-site-header]");
  const footerHost = document.querySelector("[data-site-footer]");

  if (activePage === "prototype-work") {
    try {
      window.localStorage.setItem(entrySeenKey, "true");
    } catch {
      // Navigation remains usable when browser storage is unavailable.
    }
  }

  if (!document.querySelector("[data-page-transition]")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div class="page-transition" data-page-transition aria-hidden="true"><span></span><span></span></div>'
    );
  }

  if (headerHost) {
    headerHost.outerHTML = `
      <header class="site-header" data-header>
        <div class="header-inner shell">
          <a class="brand" href="/" aria-label="Home">
            <span class="brand-glyph" aria-hidden="true">N</span>
          </a>
          <nav class="desktop-nav" aria-label="Primary navigation">
            ${navigation.map((item) => navigationLink(item, activePage)).join("")}
          </nav>
          <div class="header-actions">
            <a class="button button-small button-primary header-cta${activePage === "contact" ? " is-current" : ""}" href="/contact"${activePage === "contact" ? ' aria-current="page"' : ""}>
              <span>Request consultation</span>
              <i data-lucide="arrow-up-right" aria-hidden="true"></i>
            </a>
            <button class="icon-button menu-toggle" type="button" data-menu-toggle data-tooltip="Open menu" aria-label="Open navigation menu" aria-controls="mobile-menu" aria-expanded="false">
              <i data-lucide="menu" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="mobile-menu" id="mobile-menu" data-mobile-menu aria-hidden="true">
          <nav aria-label="Mobile navigation">
            ${navigation.map((item) => navigationLink(item, activePage, "")).join("")}
            <a class="mobile-menu-cta${activePage === "contact" ? " is-active" : ""}" href="/contact"${activePage === "contact" ? ' aria-current="page"' : ""}>Request consultation</a>
          </nav>
          <p>Focused digital systems for real operational work.</p>
        </div>
      </header>`;
  }

  if (footerHost) {
    footerHost.outerHTML = `
      <footer class="site-footer">
        <div class="shell footer-main">
          <div class="footer-brand">
            <a class="brand" href="/" aria-label="Home"><span class="brand-glyph" aria-hidden="true">N</span></a>
            <p>Digital systems designed around real business operations.</p>
            <span>Surabaya, Indonesia</span>
          </div>
          <div class="footer-column">
            <h2>Expertise</h2>
            <a href="/prototype-work">Prototype Work</a>
            <a href="/services">Services</a>
            <a href="/solutions">Solutions</a>
          </div>
          <div class="footer-column">
            <h2>Company</h2>
            <a href="/process">Process</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </div>
          <div class="footer-column footer-contact">
            <h2>Start with context</h2>
            <p>Share the pressure point, workflow, or product idea that needs a clearer next step.</p>
            <a href="/contact"><i data-lucide="message-circle" aria-hidden="true"></i> Project inquiry</a>
          </div>
        </div>
        <div class="shell footer-bottom">
          <span>&copy; <span data-current-year></span> Digital Systems Studio. All rights reserved.</span>
          <div><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
        </div>
      </footer>
      <a class="floating-contact" href="/contact" data-tooltip="Start a conversation" aria-label="Start a conversation">
        <i data-lucide="message-circle" aria-hidden="true"></i><span>Let's talk</span>
      </a>
      <button class="back-to-top icon-button" type="button" data-back-top data-tooltip="Back to top" aria-label="Back to top">
        <i data-lucide="arrow-up" aria-hidden="true"></i>
      </button>
      <div class="toast" role="status" aria-live="polite" data-toast></div>`;
  }
};
