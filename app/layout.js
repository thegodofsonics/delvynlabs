import './globals.css'; // MUST BE AT THE TOP

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a]">{children}</body>
    </html>
  );
}

import Sidebar from '../components/Sidebar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] flex">
        <Sidebar />
        <main className="flex-1 ml-20 md:ml-24">
          {children}
        </main>
      </body>
    </html>
  );
}