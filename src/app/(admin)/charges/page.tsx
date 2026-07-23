import Link from "next/link";
import {
    Ban,
    CreditCard,
    ShieldCheck
} from "lucide-react";

const modules = [
    {
        href: "/charges/payments",
        title: "Pagamentos",
        description:
            "Cobranças concluídas com valor registado.",
        icon: CreditCard,
        className: "success"
    },
    {
        href: "/charges/refusals",
        title: "Recusas",
        description:
            "Visitantes que recusaram pagar a taxa.",
        icon: Ban,
        className: "danger"
    },
    {
        href: "/charges/exemptions",
        title: "Isenções",
        description:
            "Registos isentos do pagamento da taxa.",
        icon: ShieldCheck,
        className: "warning"
    },
    {
        href: "../payments",
        title: "Todos os registos",
        description:
            "Todas as cobranças registadas.",
        icon: CreditCard,
        className: "success"
    }
];

export default function ChargesPage() {
    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>Cobranças</h1>
                    <p>
                        Consulta separada de pagamentos,
                        recusas e isenções.
                    </p>
                </div>
            </div>

            <section className="grid charges-module-grid">
                {modules.map(function(module) {
                    const Icon = module.icon;

                    return (
                        <Link
                            key={module.href}
                            href={module.href}
                            className="card charges-module-card"
                        >
                            <div
                                className={`charges-module-icon ${module.className}`}
                            >
                                <Icon size={25} />
                            </div>

                            <h2>{module.title}</h2>
                            <p>{module.description}</p>
                        </Link>
                    );
                })}
            </section>
        </main>
    );
}
