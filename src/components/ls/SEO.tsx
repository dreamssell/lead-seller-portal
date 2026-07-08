import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const SITE_URL = "https://leadseller.com.br";
const OG_IMAGE = `${SITE_URL}/__l5e/assets-v1/78b0219d-e100-45bb-8ef8-39730e576b8a/social-1781449981696-Graph.webp`;
const OG_IMAGE_WIDTH = "1200";
const OG_IMAGE_HEIGHT = "630";
const OG_IMAGE_TYPE = "image/webp";
const TWITTER_SITE = "@leadseller";

interface SEOProps {
  /** Path of the current page (e.g. "/", "/privacidade") */
  path?: string;
  /** Override default title */
  title?: string;
  /** Override default description */
  description?: string;
  /** Path for the English alternate (defaults to same path) */
  enPath?: string;
  /** Path for the PT-BR alternate (defaults to same path) */
  ptPath?: string;
  /** Optional absolute image URL override for og:image/twitter:image */
  image?: string;
  /** Optional alt text for the social image */
  imageAlt?: string;
  /** Optional JSON-LD object (will be stringified) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Centralized SEO: title, meta description, canonical, hreflang, Open Graph,
 * Twitter Card and optional JSON-LD. Renders into <head> via react-helmet-async.
 *
 * Kept in sync with the fallback tags in index.html so crawlers that don't run
 * JS (LinkedIn, Facebook) still see a valid preview.
 */
export const SEO = ({
  path = "/",
  title,
  description,
  enPath,
  ptPath,
  image,
  imageAlt,
  jsonLd,
}: SEOProps) => {
  const { i18n, t } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const lang = isEn ? "en" : "pt-BR";
  const ogLocale = isEn ? "en_US" : "pt_BR";
  const ogLocaleAlt = isEn ? "pt_BR" : "en_US";

  const canonical = `${SITE_URL}${path}`;
  const ptHref = `${SITE_URL}${ptPath ?? path}`;
  const enHref = `${SITE_URL}${enPath ?? path}`;

  const socialImage = image ?? OG_IMAGE;
  const socialImageAlt =
    imageAlt ?? (isEn
      ? "Lead Seller — Enterprise CRM with Autonomous AI"
      : "Lead Seller — CRM Enterprise com IA Autônoma");

  return (
    <Helmet>
      <html lang={lang} />
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="pt-BR" href={ptHref} />
      <link rel="alternate" hrefLang="en" href={enHref} />
      <link rel="alternate" hrefLang="x-default" href={ptHref} />

      {/* Open Graph */}
      <meta property="og:site_name" content="Lead Seller" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={ogLocaleAlt} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:secure_url" content={socialImage} />
      <meta property="og:image:type" content={OG_IMAGE_TYPE} />
      <meta property="og:image:width" content={OG_IMAGE_WIDTH} />
      <meta property="og:image:height" content={OG_IMAGE_HEIGHT} />
      <meta property="og:image:alt" content={socialImageAlt} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_SITE} />
      <meta name="twitter:creator" content={TWITTER_SITE} />
      <meta name="twitter:url" content={canonical} />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={socialImage} />
      <meta name="twitter:image:alt" content={socialImageAlt} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
