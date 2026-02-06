import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Bowl Squares",
  description: "Real-time Super Bowl squares betting pool app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
