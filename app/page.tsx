import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-8";
import Features from "@/components/features-1";
import Footer from "@/components/footer";
import StatsSection from "@/components/stats";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Homer - Your All-in-One Productivity Hub. Manage projects and tasks effortlessly, track your budget with ease, chat with friends, and more.",
};

export default function Home() {
  return (
    <>
    <HeroSection />
    <StatsSection />
    <Features />
    <FeaturesSection />
    <Footer />
    </>

  );
}

