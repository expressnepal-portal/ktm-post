import type { Metadata } from "next";
import { Mukta, Poppins, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { MobileMenuProvider } from "./components/MobileMenuContext";
import BannerAdsTop from "./components/BannersAdsTop";

export const metadata: Metadata = {
    title: "KTM Post - Trusted News from Nepal",
    description: "Independent journalism and latest news from Nepal",
};

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-poppins",
});

const mukta = Mukta({
    subsets: ["devanagari", "latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-mukta",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
    subsets: ["devanagari", "latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-noto-serif-devanagari",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" >
            <body
                className={`${poppins.variable} ${mukta.variable} ${notoSerifDevanagari.variable} antialiased bg-white text-black`}
            >
                {/* <CHANGE> wrapped everything with MobileMenuProvider */}
                <MobileMenuProvider>
                    {/* FIXED HEADER */}
                    <Header />
                    {/* CONTENT OFFSET FOR FIXED HEADER */}
                    <main className="pt-24 sm:pt-28 lg:pt-54 min-h-screen" >
                        {children}
                    </main>

                    < Footer />
                </MobileMenuProvider>
            </body>
        </html>
    );
}