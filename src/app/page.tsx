"use client";

import {
  Hero,
  DiscoverSection,
  HowItWorks,
  Features,
  Categories,
  CitiesSection,
  FinalCTA,
} from "@/components/home/home";
import { Marquee } from "@/components/home/marquee";
import { HomeLoggedIn } from "@/components/home/home-logged-in";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user } = useAuth();
  return user ? (
    <HomeLoggedIn />
  ) : (
    <>
      <Hero />
      <Marquee />
      <DiscoverSection />
      <HowItWorks />
      <Features />
      <Categories />
      <CitiesSection />
      <FinalCTA />
    </>
  );
}
