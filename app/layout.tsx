import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chong Jong Cho",
  description: "Nhật ký đánh giá thành viên",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
