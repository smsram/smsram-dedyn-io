import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: 'SMSRam - Developer & Content Creator',
  description: 'AI & ML Student | Developer | YouTuber sharing coding tutorials and tech content',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
