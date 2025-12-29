import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProgramProvider } from "@/context/ProgramContext";
import { ChatProvider } from "@/context/ChatContext";
import { HealthProvider } from "@/context/HealthContext";
import { PWAProvider } from "@/context/PWAContext";
import ChatWidget from "@/components/chat/ChatWidget";
import SessionProvider from "@/components/auth/SessionProvider";
import UserMenu from "@/components/auth/UserMenu";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Yog - Yoga Asana Library",
  description: "Discover and create personalized yoga programs with our comprehensive asana library",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Yog",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Yog",
    title: "Yog - Yoga Asana Library",
    description: "Your personal yoga companion with 35+ asanas, guided programs, and practice tracking",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c9a73",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider>
          <PWAProvider>
          <HealthProvider>
            <ProgramProvider>
              <ChatProvider>
              <OfflineIndicator />
              <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sage-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16">
                    <a href="/" className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-sage-700">Yog</span>
                    </a>
                    <div className="flex items-center space-x-4 lg:space-x-6">
                      <a href="/" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Asanas
                      </a>
                      <a href="/compare" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Compare
                      </a>
                      <a href="/generate" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        AI Generate
                      </a>
                      <a href="/practice/camera" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Pose Check
                      </a>
                      <a href="/practice/breathing" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Breathing
                      </a>
                      <a href="/program" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        My Program
                      </a>
                      <a href="/dashboard" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Dashboard
                      </a>
                      <a href="/goals" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Goals
                      </a>
                      <a href="/reminders" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Reminders
                      </a>
                      <a href="/favorites" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Favorites
                      </a>
                      <a href="/journal" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Journal
                      </a>
                      <a href="/learn" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Learn
                      </a>
                      <a href="/quiz" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Quiz
                      </a>
                      <a href="/recovery" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Recovery
                      </a>
                      <a href="/meditation" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Meditation
                      </a>
                      <a href="/streaks" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Streaks
                      </a>
                      <a href="/stats" className="text-sage-600 hover:text-sage-800 font-medium text-sm lg:text-base">
                        Stats
                      </a>
                      <div className="border-l border-sage-200 h-6 mx-2" />
                      <UserMenu />
                    </div>
                  </div>
                </div>
              </nav>
              <main className="min-h-screen">
                {children}
              </main>
              <ChatWidget />
              <InstallPrompt />
              </ChatProvider>
            </ProgramProvider>
          </HealthProvider>
          </PWAProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
