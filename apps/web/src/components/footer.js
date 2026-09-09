import { escapeHtml } from "../utils/escapeHtml.js";

export const FOOTER_CONTENT = {
  brand: "Forno Rosso",
  hours: "Kitchen Hours: Tue–Sun, 5:00 PM – 11:00 PM",
  address: "48 Ember Lane, Brooklyn, NY 11201",
  contact: "(718) 555-0142",
  socialLinks: [
    { id: "facebook", label: "Facebook", href: "https://facebook.com/fornorosso" },
    { id: "instagram", label: "Instagram", href: "https://instagram.com/fornorosso" },
  ],
  legalLinks: [
    { id: "privacy-policy", label: "Privacy Policy", href: "/privacy-policy" },
    { id: "terms", label: "Terms", href: "/terms" },
  ],
};

function renderSocialLink(social) {
  return `<a class="site-footer__social-link" data-id="${escapeHtml(social.id)}" href="${escapeHtml(social.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(social.label)}</a>`;
}

function renderLegalLink(legal) {
  return `<a class="site-footer__legal-link" data-id="${escapeHtml(legal.id)}" href="${escapeHtml(legal.href)}">${escapeHtml(legal.label)}</a>`;
}

export function renderFooter(content = FOOTER_CONTENT) {
  return `
    <div class="site-footer__info">
      <span class="site-footer__brand">${escapeHtml(content.brand)}</span>
      <p class="site-footer__hours">${escapeHtml(content.hours)}</p>
      <p class="site-footer__address">${escapeHtml(content.address)}</p>
      <p class="site-footer__contact">${escapeHtml(content.contact)}</p>
    </div>
    <nav class="site-footer__social" aria-label="Social links">
      ${content.socialLinks.map(renderSocialLink).join("")}
    </nav>
    <nav class="site-footer__legal" aria-label="Legal links">
      ${content.legalLinks.map(renderLegalLink).join("")}
    </nav>
  `;
}

export function mountFooter(container, content = FOOTER_CONTENT) {
  container.innerHTML = renderFooter(content);
}
