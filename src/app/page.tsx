import CategoryNav from "@/components/CategoryNav";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import NewArrivals from "@/components/NewArrivals";
import OfferSection from "@/components/OfferSection";
import ProductSection from "@/components/ProductSection";
import WhyChooseUs from "@/components/WhyChooseUs";

export default function Home() {
  return (
    <>
    <Navbar />
    <CategoryNav />
     <Hero />
     <OfferSection />
     <ProductSection />
     <NewArrivals />
     <WhyChooseUs />
     <Footer />
    </>
  );
}