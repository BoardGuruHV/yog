import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProgramProvider } from "@/context/ProgramContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Yog - Yoga Asana Library",
  description: "Discover and create personalized yoga programs with our comprehensive asana library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ProgramProvider>
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sage-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <a href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-sage-700">Yog</span>
                </a>
                <div className="flex items-center space-x-6">
                  <a href="/" className="text-sage-600 hover:text-sage-800 font-medium">
                    Asanas
                  </a>
                  <a href="/program" className="text-sage-600 hover:text-sage-800 font-medium">
                    My Program
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main className="min-h-screen">
            {children}
          </main>
        </ProgramProvider>
      </body>
    </html>
  );
}
