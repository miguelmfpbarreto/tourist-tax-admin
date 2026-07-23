import Link from "next/link";
import {
    BarChart3,
    CreditCard,
    FileBarChart,
    Globe2,
    MonitorCog,
    Settings2,
    ShieldCheck,
    WalletCards
} from "lucide-react";

const items = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: BarChart3
    },
    {
        href: "/charges",
        label: "Cobranças",
        icon: WalletCards
    },
    {
        href: "/reports",
        label: "Relatórios",
        icon: FileBarChart
    },
    {
        href: "/devices",
        label: "Dispositivos",
        icon: MonitorCog
    },
    {
        href: "/administration",
        label: "Administração",
        icon: ShieldCheck
    },
    {
        href: "/configuration",
        label: "Configuração",
        icon: Settings2
    }
];

export function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-mark">
                    <Globe2 size={23} />
                </div>

                <div>
                    <strong>Tourist Tax</strong>
                    <span>Administração central</span>
                </div>
            </div>

            <nav className="nav">
                {items.map(function(item) {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
