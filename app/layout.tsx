import './globals.css';

export const metadata = {
  title: '덕킹 CRM Lite v1.5',
  description: 'Korea Used Car Auction Broker CRM Lite',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>{children}</body></html>;
}
