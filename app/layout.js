import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

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
          href="/favicon_io/android-chrome-192x192.png"
          sizes="any"
        />
      </head>
      <ClerkProvider>
        <ConvexClientProvider>
          <body className={`${inter.className}`}>
            <Header />
            <main className="min-h-screen">
              {children}
              <Toaster />
            </main>
          </body>
        </ConvexClientProvider>
      </ClerkProvider>
    </html>
  );
}
