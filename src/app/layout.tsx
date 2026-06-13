import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const cabinetGrotesk = localFont({
  src: [
    { path: "../../public/fonts/CabinetGrotesk-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/CabinetGrotesk-Medium.woff2", weight: "500" },
    { path: "../../public/fonts/CabinetGrotesk-Bold.woff2", weight: "700" },
    { path: "../../public/fonts/CabinetGrotesk-ExtraBold.woff2", weight: "800" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Color Palettes",
  description: "Create beautiful color palettes with AI, harmonies, and image extraction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cabinetGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
