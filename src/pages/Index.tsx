import { useState } from "react";
import { NavBar } from "@/components/ls/NavBar";
import { SchedulingModal } from "@/components/ls/SchedulingModal";
import { HeroSection } from "@/components/ls/sections/HeroSection";
import { ProblemSection } from "@/components/ls/sections/ProblemSection";
import { EcosystemSection } from "@/components/ls/sections/EcosystemSection";
import { FunnelSection } from "@/components/ls/sections/FunnelSection";
import { AdvantagesSection } from "@/components/ls/sections/AdvantagesSection";
import { FinalCTASection } from "@/components/ls/sections/FinalCTASection";
import { Footer } from "@/components/ls/Footer";

const Index = () => {
  const [demoOpen, setDemoOpen] = useState(false);
  const open = () => setDemoOpen(true);

  return (
    <div className="min-h-screen bg-surface">
      <NavBar onOpenDemo={open} />
      <main>
        <HeroSection onOpenDemo={open} />
        <ProblemSection />
        <EcosystemSection />
        <FunnelSection />
        <AdvantagesSection />
        <FinalCTASection onOpenDemo={open} />
      </main>
      <Footer />
      <SchedulingModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
};

export default Index;
