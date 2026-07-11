import './globals.css';

export const metadata = {
  title: '덕킹 중고차 CRM Professional V4.1',
  description: 'DeKing Korea used car CRM Professional V4.1'
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="ko"><body>{children}</body></html>;
}
