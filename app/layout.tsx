import './globals.css';

export const metadata = {
  title: '덕킹 중고차 CRM Professional V4.0',
  description: 'Korea used car sales CRM'
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="ko"><body>{children}</body></html>;
}
