import './globals.css';

export const metadata = {
  title: 'DeKing CRM V4.1',
  description: '덕킹 한국 중고차 개인 업무 시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
