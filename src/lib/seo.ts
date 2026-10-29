// Single source of the public site address. Change SITE_URL here once a custom domain is connected.
export const SITE_URL = 'https://lapadellaolomouc.pages.dev';
export const SITE_NAME = 'La Padella Olomouc';
export const OG_IMAGE = { path: '/images/og-lapadella-olomouc.png', width: 1200, height: 630, alt: 'La Padella Olomouc – italská restaurace' };

export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`;

/** Full head (title, description, canonical, Open Graph, Twitter) for one public page. */
export function seoHead(title: string, description: string, path: string) {
  const url = absoluteUrl(path);
  const image = absoluteUrl(OG_IMAGE.path);
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: String(OG_IMAGE.width) },
      { property: 'og:image:height', content: String(OG_IMAGE.height) },
      { property: 'og:image:alt', content: OG_IMAGE.alt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    links: [{ rel: 'canonical', href: url }],
  };
}

/** Restaurant JSON-LD built only from verified data shown on the site. */
export function restaurantJsonLd(s: { address?: string; phone?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    image: absoluteUrl(OG_IMAGE.path),
    servesCuisine: ['Italská', 'Neapolská pizza'],
    menu: absoluteUrl('/menu'),
    acceptsReservations: true,
    ...(s.phone ? { telephone: s.phone } : {}),
    address: { '@type': 'PostalAddress', streetAddress: 'Wurmova 1208/6', postalCode: '779 00', addressLocality: 'Olomouc', addressCountry: 'CZ' },
  };
}
