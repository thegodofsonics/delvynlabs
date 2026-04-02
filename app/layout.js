import './globals.css'; // MUST BE AT THE TOP

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a]">{children}</body>
    </html>
  );
}