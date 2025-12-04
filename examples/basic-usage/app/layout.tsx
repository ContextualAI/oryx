import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Oryx Basic Usage Example",
  description: "Basic usage example for Oryx React library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"font-sans text-neutral-900 bg-neutral-50"}>
        {children}
      </body>
    </html>
  );
}
