import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ModalProvider } from "@/context/ModalContext";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Preloader from "@/components/ui/Preloader";
import CustomCursor from "@/components/ui/CustomCursor";

export const metadata: Metadata = {
  title: "Md. Nihal Uddin | Full-Stack & MERN Developer",
  description: "Portfolio of Md. Nihal Uddin, a Full-Stack Developer specializing in React, Next.js, Node.js, MongoDB, TypeScript, Python, Golang, Docker, and REST APIs. View projects, skills and experience.",
  keywords: [
    "Md Nihal Uddin",
    "nihalxofficial",
    "MERN Stack Developer",
    "Full-Stack Developer",
    "Next.js Developer",
    "React.js Expert",
    "Software Architecture",
    "Portfolio",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Express.js",
    "MongoDB",
    "SQL",
    "Python",
    "Golang",
    "Docker",
    "REST API",
    "Web Development",
    "UI/UX Design",
    "Frontend Developer",
    "Backend Developer",
  ],
  authors: [{ name: "Md. Nihal Uddin", url: "https://github.com/nihalxofficial" }],
  creator: "Md. Nihal Uddin",
  metadataBase: new URL("https://nihalxofficial.vercel.app"),
  openGraph: {
    title: "Md. Nihal Uddin | Full-Stack Developer",
    description: "Full-Stack Developer specializing in modern web technologies. Check out my projects and skills.",
    url: "https://nihalxofficial.vercel.app",
    siteName: "Md. Nihal Uddin Portfolio",
    images: [
      {
        url: "/og-image.jpg", // Create an og-image.jpg in the public folder for best results
        width: 1200,
        height: 630,
        alt: "Md. Nihal Uddin Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Md. Nihal Uddin | Full-Stack Developer",
    description: "Full-Stack Developer specializing in modern web technologies.",
    creator: "@nihalxofficial", // Assuming from Github handle, update if different
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
