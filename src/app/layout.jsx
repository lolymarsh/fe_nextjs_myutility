// app/layout.js
import { Chakra_Petch } from "next/font/google";
import "./globals.css";
import NavbarComponent from "@/components/NavbarComponent";
import NextTopLoader from "nextjs-toploader";
import ThemeProvider from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import FooterComponent from "@/components/FooterComponent";

const ChakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "LolyApp",
  description: "LolyAppEIEI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${ChakraPetch.className} antialiased bg-gray-100 dark:bg-gray-900`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <NextTopLoader
            color="#6B7280"
            height={5}
            showSpinner={false}
            zIndex={50}
            shadow="0 0 10px #ffffff, 0 0 5px #ffffff"
          />
          <NavbarComponent />
          <div className="min-h-screen flex">
            <main className="flex-grow">{children}</main>
          </div>
          <FooterComponent />
        </ThemeProvider>
      </body>
    </html>
  );
}
