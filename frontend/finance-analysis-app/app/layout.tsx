import "./globals.css";
import Link from "next/link";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Header />
                {children}
            </body>
        </html>
    );
}

function Header() {
    return (
        <div className="fixed top-4 left-4 right-4">
            <div className="rounded-full dark:bg-gray-700 h-10 px-20 py-5 mx-10 items-center flex justify-between">
                <div>
                    <Link href="/">Home</Link>
                </div>
                <div className="gap-5 flex">
                    <Link href="/data">Data</Link>
                    <Link href="/">Analysis</Link>
                </div>
            </div>
        </div>
    );
}
