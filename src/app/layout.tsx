import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/lib/theme";
import { LangProvider } from "@/lib/i18n";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Background } from "@/components/layout/background";
import { RouteGuard } from "@/components/layout/route-guard";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { LoadingScreen } from "@/components/layout/loader";
import { ToastViewport } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skill India Hub — Discover · Match · Learn · Build · Prove · Get Hired",
  description:
    "AI-powered career platform for Indian youth. Discover what you're good at, find skill gaps, and connect with personalized training, internships and jobs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ThemeProvider>
          <LangProvider>
            <AuthProvider>
              <StoreProvider>
                <Background>
                  <ScrollProgress />
                  <Navbar />
                  <main className="relative z-10 flex-1">
                    <RouteGuard>{children}</RouteGuard>
                  </main>
                  <Footer />
                  <ToastViewport />
                  <LoadingScreen />
                </Background>
              </StoreProvider>
            </AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
