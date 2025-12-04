import { Inter, Google_Sans_Code } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/tailwind";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  fallback: [
    "system-ui",
    "-apple-system",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

const googleSansCode = Google_Sans_Code({
  variable: "--font-google-sans-code",
  weight: ["400", "500", "600"],
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "monospace",
  ],
});

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, googleSansCode.variable)}>
        {children}
      </body>
    </html>
  );
}
