import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-navy text-white py-14 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <div className="size-4 rounded-sm bg-cyan shadow-cyan" />
          </div>
          <div>
            <div className="font-extrabold uppercase tracking-tighter">Lead Seller</div>
            <div className="text-[11px] text-white/50">{t("footer.tagline")}</div>
          </div>
        </div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};
