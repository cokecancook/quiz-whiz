
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ThemeSwitcher from "@/components/theme-switcher";
import BackgroundGrid from "@/components/background-grid";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "QuizWhiz",
  description: "A quiz trainer application to hone your skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`} suppressHydrationWarning>
        <div className="relative min-h-screen w-full">
            <BackgroundGrid />
            <div className="relative z-10">
                <ThemeSwitcher />
                {children}
                <Toaster />
            </div>
        </div>
      </body>
    </html>
  );
}
