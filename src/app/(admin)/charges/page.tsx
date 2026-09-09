import Link from "next/link";
import { Ban, BadgeCheck, CreditCard, ShieldCheck } from "lucide-react";
import { AccessDenied } from "@/components/AccessDenied";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { requireUser } from "@/lib/session";

const modules = [
    {
        href: "/charges/payments",
        title: "Pagamentos",
        description:
            "Cobranças concluídas com valor registado.",
        icon: CreditCard,
        className: "success",
        permission:
            PERMISSIONS.paymentsView
    },
    {
        href: "/charges/refusals",
        title: "Recusas",
        description:
            "Visitantes que recusaram pagar a taxa.",
        icon: Ban,
        className: "danger",
        permission:
            PERMISSIONS.refusalsView
    },
    {
        href: "/charges/exemptions",
        title: "Isenções",
        description:
            "Registos isentos do pagamento da taxa.",
        icon: ShieldCheck,
        className: "warning",
        permission:
            PERMISSIONS.exemptionsView
    },
    {
        href: "/payments",
        title: "Todos os registos",
        description:
            "Todas as cobranças registadas.",
        icon: CreditCard,
        className: "success",
        permission:
            PERMISSIONS.recordsView
    },
    {
        href: "/payments?verification_status=verified",
        title: "Recibos verificados",
        description:
            "Recibos já utilizados e confirmados no controlo de saída.",
        icon: BadgeCheck,
        className: "verified",
        permission:
            PERMISSIONS.recordsView
    }
] as const;

export default async function ChargesPage() {
    const user = await requireUser();
    const visible = modules.filter(module => hasPermission(user, module.permission));
    if (visible.length === 0) return <AccessDenied message="Sem permissão: Registos." />;
    return <main className="page"><div className="page-header"><div><h1>Cobranças</h1><p>Consulta separada de pagamentos, recusas e isenções.</p></div></div><section className="grid charges-module-grid">{visible.map(module=>{const Icon=module.icon;return <Link key={module.href} href={module.href} className="card charges-module-card"><div className={`charges-module-icon ${module.className}`}><Icon size={25}/></div><h2>{module.title}</h2><p>{module.description}</p></Link>})}</section></main>;
}
