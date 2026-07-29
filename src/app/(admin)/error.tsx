"use client";

import { useEffect } from "react";
import { AccessDenied } from "@/components/AccessDenied";

export default function AdminError({
    error,
    reset
}: {
    error: Error & { digest?: string; status?: number };
    reset: () => void;
}) {
    useEffect(function() {
        console.error("Erro da área administrativa:", error);
    }, [error]);

    const message = error.message || "Não foi possível abrir esta página.";
    const denied =
        error.status === 401 ||
        error.status === 403 ||
        /sem permissão|acesso negado|unauthorized|forbidden/i.test(message);

    if (denied) {
        return <AccessDenied message={message} />;
    }

    return (
        <main className="page">
            <section className="card access-denied">
                <h1>Não foi possível carregar a página</h1>
                <p>{message}</p>
                <button className="btn" type="button" onClick={reset}>
                    Tentar novamente
                </button>
            </section>
        </main>
    );
}
