import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Equishare",
  description: "Smart expense manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/equishare-app/public/favicon_io/favicon-32x32.png"
          sizes="any"
        />
      </head>
      <body className={`${inter.className}`}>
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
