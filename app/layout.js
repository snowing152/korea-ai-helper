import './globals.css';

export const metadata = {
  title: 'Korea AI Helper',
  description: 'AI assistant for foreigners navigating Korean government websites',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FAF9F5] min-h-screen">
        {children}
      </body>
    </html>
  );
}
