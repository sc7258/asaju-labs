import { ServiceWorkerRegister } from "@repo/ui/service-worker-register";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/branding";
import { DEFAULT_SITE_URL } from "@repo/saju-core";
import { withPwaAssetVersion } from "@/lib/pwa-assets";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  ),
  applicationName: APP_NAME,
  manifest: withPwaAssetVersion("/manifest.webmanifest"),
  title: APP_NAME,
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: "#efe7da",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
