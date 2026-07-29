import "@/app/globals.css"; 
export const metadata = {
    title: "Tourist Tax Central",

    icons: {
        icon: [
            {
                url: "images/favicon/favicon.ico"
            },
            {
                url: "images/favicon/favicon-32x32.png",
                sizes: "32x32",
                type: "image/png"
            },
            {
                url: "images/favicon/favicon-16x16.png",
                sizes: "16x16",
                type: "image/png"
            }
        ],

        apple:
            "/apple-touch-icon.png"
    }
}; 
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-PT"><body>{children}</body></html>;}
