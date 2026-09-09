"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function PaymentFilters() {
    const router = useRouter();
    const params = useSearchParams();

    return (
        <form className="card toolbar" onSubmit={event => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const query = new URLSearchParams();
            for (const [key, value] of form.entries()) {
                const text = String(value).trim();
                if (text) query.set(key, text);
            }
            query.set("page", "1");
            router.push(`/payments?${query.toString()}`);
        }}>
            <input className="input search" name="search" placeholder="Recibo, passaporte ou nome" defaultValue={params.get("search") || ""} />
            <select className="select" name="payment_action" defaultValue={params.get("payment_action") || ""}>
                <option value="">Todas as ações</option><option>PAGAMENTO</option><option>RECUSA</option><option>ISENÇÃO</option>
            </select>
            <select className="select" name="currency" defaultValue={params.get("currency") || ""}>
                <option value="">Todas as moedas</option><option>DOBRA</option><option>EURO</option><option>DOLAR</option>
            </select>
            <select className="select" name="verification_status" defaultValue={params.get("verification_status") || ""}>
                <option value="">Todos os recibos</option>
                <option value="verified">Recibos verificados</option>
                <option value="unverified">Recibos não verificados</option>
            </select>
            <input className="input" type="date" name="date_from" defaultValue={params.get("date_from") || ""} />
            <input className="input" type="date" name="date_to" defaultValue={params.get("date_to") || ""} />
            <button className="btn">Pesquisar</button>
        </form>
    );
}
