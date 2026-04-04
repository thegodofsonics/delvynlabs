import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Delvyn Labs",
  description: "Personal Productivity OS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] flex min-h-screen">
        {/* 1. This sidebar will now stay on the left of every page */}
        <Sidebar />
        
        {/* 2. This main tag holds the content of whatever page you are on */}
        <main className="flex-1 ml-20 md:ml-24">
          {children}
        </main>
      </body>
    </html>
  );
}