import WhyUseDakesh from "@/components/WhyUseDakesh";
import AboutSection from "../components/About";
import CategoriesSection from "../components/CategoriesSection";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import HowItWorks from "@/components/HowItWorks";

export default function Home() {
  return (
    <div>
      <Hero />
      <AboutSection />
      <WhyUseDakesh />
      <HowItWorks />
      <CategoriesSection />
      <ProductGrid />
    </div>
  );
}
