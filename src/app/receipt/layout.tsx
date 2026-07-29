import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/images/favicon/favicon.ico"
  }
};

export default function ReceiptLayout({children}:{children:React.ReactNode}){
 return children;
}
