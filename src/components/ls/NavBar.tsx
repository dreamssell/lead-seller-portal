import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ls/Button";
import { LanguageSwitcher } from "@/components/ls/LanguageSwitcher";
import { cn } from "@/lib/utils";
import logoLeadSeller from "@/assets/leadseller-logo.png";

const AUTH_URL = "https://acesso.leadseller.com.br/";

interface NavBarProps {
  onOpenDemo: () => void;
}

export const NavBar = ({ onOpenDemo }: NavBarProps) => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "bg-surface/85 backdrop-blur-xl border-navy/10 shadow-glass"
          : "bg-surface/40 backdrop-blur-sm border-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2.5 group">
          <img
            src={logoLeadSeller}
            alt="Lead Seller"
            className="h-10 w-auto transition-transform group-hover:scale-105"
            width={40}
            height={40}
          />
          <span className="hidden md:inline text-lg font-extrabold tracking-tighter uppercase text-navy">
            Lead Seller
          </span>
        </a>

        <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-navy/60">
          <a href="#ecosystem" className="hover:text-navy transition-colors">
            {t("nav.platform")}
          </a>
          <a href="#funnel" className="hover:text-navy transition-colors">
            {t("nav.solutions")}
          </a>
          <a href="#advantages" className="hover:text-navy transition-colors">
            {t("nav.enterprise")}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden sm:flex" />
          <Button
            variant="secondary"
            size="sm"
            asChild
          >
            <a href={AUTH_URL}>{t("nav.login")}</a>
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenDemo}>
            {t("nav.demo")}
          </Button>
        </div>
      </div>
    </nav>
  );
};
