import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { CookiePreferencesModal } from "@/components/ls/CookiePreferencesModal";
import { openPreferences } from "@/lib/consent";

const setViewport = (w: number, h = 800) => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: w });
  Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: h });
  window.dispatchEvent(new Event("resize"));
};

const renderModal = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <CookiePreferencesModal />
    </I18nextProvider>
  );

const openModal = () => act(() => { openPreferences(); });

const BREAKPOINTS = [320, 768, 1024, 1440];

describe("CookiePreferencesModal — responsive", () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => cleanup());

  for (const lng of ["pt-BR", "en"] as const) {
    describe(`locale ${lng}`, () => {
      beforeEach(async () => { await i18n.changeLanguage(lng); });

      for (const w of BREAKPOINTS) {
        it(`renders all 3 footer buttons visible at ${w}px`, () => {
          setViewport(w);
          renderModal();
          openModal();

          const footer = screen.getByTestId("prefs-footer");
          expect(footer).toBeInTheDocument();

          const buttons = footer.querySelectorAll("button");
          expect(buttons.length).toBe(3);
          buttons.forEach((b) => {
            expect(b).toBeVisible();
            expect((b as HTMLElement).textContent?.trim().length).toBeGreaterThan(0);
          });
        });
      }

      it("scroll area is independent so footer never overlaps content", () => {
        setViewport(1024);
        renderModal();
        openModal();
        const scroll = screen.getByTestId("prefs-scroll");
        expect(scroll.className).toMatch(/overflow-y-auto/);
        expect(scroll.className).toMatch(/min-h-0/);
      });
    });
  }
});
