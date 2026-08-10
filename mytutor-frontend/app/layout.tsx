import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import "./style.css";
import StoreProvider from "@/state/StoreProvider";
import Loading from "./loading";
import { Suspense } from "react";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mytutor",
  description: "Mytutor is a platform for tutoring and learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={" min-h-dvh flex flex-col"}>
        <Suspense fallback={<Loading />}>
          <StoreProvider>{children}</StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}
