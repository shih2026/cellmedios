import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'細胞探索室｜物質進出細胞的方式',description:'國中七年級自然科：七頁互動學習、定性模擬與證據評量。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}
