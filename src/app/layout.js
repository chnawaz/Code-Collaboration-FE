// src/app/layout.js
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";

export const metadata = {
  title: "online code editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
