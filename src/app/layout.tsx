import "@/app/globals.css"; 
import {
    apiRequest
} from "@/lib/api";

import type {
    SystemSettings
} from "@/types"; 

const system =
        await apiRequest<SystemSettings>(
            "/admin/settings/system"
        );

export const metadata = {
    title: `${system.system_name} - Administração central`,

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
