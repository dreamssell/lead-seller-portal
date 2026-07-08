import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Forces the i18n language based on the URL prefix. Wrap route elements
 * so pre-rendered `/en/*` snapshots ship English HTML/OG tags and `/*`
 * ships PT-BR, regardless of localStorage / navigator detection.
 */
export const LocaleRoute = ({
  lang,
  children,
}: {
  lang: "pt-BR" | "en";
  children: React.ReactNode;
}) => {
  const { i18n } = useTranslation();

  // Sync change on first render so Helmet emits the correct locale
  // immediately during prerender snapshotting.
  if (i18n.language !== lang) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    i18n.changeLanguage(lang);
  }

  useEffect(() => {
    if (i18n.language !== lang) i18n.changeLanguage(lang);
    try {
      localStorage.setItem("leadseller_lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang, i18n]);

  return <>{children}</>;
};
