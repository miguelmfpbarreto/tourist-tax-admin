import "@/app/globals.css"; 
import {
    apiRequest
} from "@/lib/api";

import type {
    SystemSettings
} from "@/types"; 
import type {
    Metadata
} from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const system =
        await apiRequest<SystemSettings>(
            "/admin/settings/system"
        );

    return {
        title: `${system.system_name} - Administração central`,

        icons: {
            icon: [
                {
                    url: "/images/favicon/favicon.ico"
                }
            ],

            apple:
                "/images/favicon/apple-touch-icon.png"
        }
    };
}

export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-PT"><body>{children}</body></html>;}
