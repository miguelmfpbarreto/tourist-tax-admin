import Link from "next/link";
import {
    ArrowLeft,
    ShieldX
} from "lucide-react";

export function AccessDenied({
    message =
        "Não tem permissão para consultar esta área."
}: {
    message?: string;
}) {
    return (
        <main className="page">
            <section className="card access-denied">
                <div className="access-denied-icon">
                    <ShieldX size={42} />
                </div>

                <h1>Acesso negado</h1>

                <p>{message}</p>

                <Link
                    href="/dashboard"
                    className="btn"
                >
                    <ArrowLeft size={17} />
                    Voltar ao Dashboard
                </Link>
            </section>
        </main>
    );
}