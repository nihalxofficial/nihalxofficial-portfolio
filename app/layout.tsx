import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ModalProvider } from "@/context/ModalContext";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Preloader from "@/components/ui/Preloader";
import CustomCursor from "@/components/ui/CustomCursor";

export const metadata: Metadata = {
  title: "Md. Nihal Uddin · Full-Stack Developer",
  description: "Full-Stack Developer specializing in React, Next.js, Node.js, MongoDB, SQL, TypeScript, Golang, Python and responsive design.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SmoothScrollProvider>
            <Preloader />
            <CustomCursor />
            <ModalProvider>{children}</ModalProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
