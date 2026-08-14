import Link from "next/link";
import Image from "next/image";
import { BarChart3, FileBarChart, History, RefreshCcw, Settings2, ShieldCheck, WalletCards } from "lucide-react";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import type { CurrentUser, SystemSettings } from "@/types";

type SidebarProps = { system: SystemSettings; user: CurrentUser };

const items = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: BarChart3,
        permissions: [
            PERMISSIONS.dashboardView
        ]
    },
    {
        href: "/charges",
        label: "Cobranças",
        icon: WalletCards,
        permissions: [
            PERMISSIONS.recordsView,
            PERMISSIONS.paymentsView,
            PERMISSIONS.refusalsView,
            PERMISSIONS.exemptionsView
        ]
    },
    {
        href: "/reports",
        label: "Relatórios",
        icon: FileBarChart,
        permissions: [
            PERMISSIONS.reportsView,
            PERMISSIONS.reportsGeneralView,
            PERMISSIONS.reportsFinancialView,
            PERMISSIONS.reportsOperationalView,
            PERMISSIONS.reportsStatisticsView
        ]
    },
    {
        href: "/synchronization",
        label: "Sincronização",
        icon: RefreshCcw,
        permissions: [
            PERMISSIONS.synchronizationView,
            PERMISSIONS.syncDevicesView,
            PERMISSIONS.syncLogsView,
            PERMISSIONS.apiStatusView
        ]
    },
    {
        href: "/administration",
        label: "Administração",
        icon: ShieldCheck,
        permissions: [
            PERMISSIONS.usersView,
            PERMISSIONS.profilesView,
            PERMISSIONS.permissionsView
        ]
    },
    {
        href: "/configuration",
        label: "Configurações",
        icon: Settings2,
        permissions: [
            PERMISSIONS.postsStatus,
            PERMISSIONS.devicesView,
            PERMISSIONS.flightsStatus,
            PERMISSIONS.countriesView,
            PERMISSIONS.visitReasonsCreate,
            PERMISSIONS.taxesCreate,
            PERMISSIONS.settingsView
        ]
    },
    {
        href: "/audit",
        label: "Auditoria",
        icon: History,
        permissions: [
            PERMISSIONS.auditView
        ]
    }
] as const;

export function Sidebar({ system, user }: SidebarProps) {
    const visibleItems = items.filter(item => hasAnyPermission(user, item.permissions));
    const configuredLogo = String(system.logo || "").trim();
    const logo = configuredLogo
        ? (
            configuredLogo.startsWith("/") ||
            configuredLogo.startsWith("http://") ||
            configuredLogo.startsWith("https://")
                ? configuredLogo
                : `/${configuredLogo}`
        )
        : "/images/logo/turismo-sao-tome-principe.svg";

    return <aside className="sidebar"><div className="sidebar-brand"><Image src={logo} alt={system.country_name || "Turismo de São Tomé e Príncipe"} width={120} height={120} className="brand-logo" priority unoptimized/><h1>{system.institution_name}</h1></div><nav className="nav">{visibleItems.map(item=>{const Icon=item.icon;return <Link key={item.href} href={item.href}><Icon size={18}/>{item.label}</Link>})}</nav></aside>;
}
