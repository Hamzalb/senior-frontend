import type { Metadata } from "next";
import "./globals.css";
import "@/lib/axiosConfig";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Inter, Space_Grotesk } from "next/font/google";

// Inter - Clean, modern sans-serif for body text
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Space Grotesk - Trendy, geometric sans-serif for headings
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "yalla nbadel",
  description: "Trade it - Don't Waste it",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased bg-surface text-white font-sans overflow-x-hidden">
        <ErrorBoundary>
          <AuthProvider>
            <NotificationProvider>
              <Header />
              {children}
              <Footer />
            </NotificationProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
