import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title:"Notice PDF Generator", description:"Structured document and notice generator" };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
