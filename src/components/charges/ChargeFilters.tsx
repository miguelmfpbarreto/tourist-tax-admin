"use client";

import {
    Search,
    X
} from "lucide-react";
import {
    useRouter,
    useSearchParams
} from "next/navigation";

export function ChargeFilters({
    basePath
}: {
    basePath: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function submit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const form = new FormData(event.currentTarget);
        const params = new URLSearchParams();

        for (const [key, value] of form.entries()) {
            const text = String(value).trim();

            if (text) {
                params.set(key, text);
            }
        }

        params.set("page", "1");

        router.push(
            `${basePath}?${params.toString()}`
        );
    }

    function clear() {
        router.push(basePath);
    }

    return (
        <form
            className="card charges-toolbar"
            onSubmit={submit}
        >
            <input
                className="input charges-search-input"
                name="search"
                placeholder="Recibo, passaporte ou nome"
                defaultValue={
                    searchParams.get("search") || ""
                }
            />

            <input
                className="input"
                type="date"
                name="date_from"
                defaultValue={
                    searchParams.get("date_from") || ""
                }
            />

            <input
                className="input"
                type="date"
                name="date_to"
                defaultValue={
                    searchParams.get("date_to") || ""
                }
            />

            <input
                className="input"
                name="post_code"
                placeholder="Código do posto"
                defaultValue={
                    searchParams.get("post_code") || ""
                }
            />

            <input
                className="input"
                name="flight_code"
                placeholder="Ligação"
                defaultValue={
                    searchParams.get("flight_code") || ""
                }
            />

            <input
                className="input"
                name="visit_reason"
                placeholder="Motivo da viagem"
                defaultValue={
                    searchParams.get("visit_reason") || ""
                }
            />

            <select
                className="select"
                name="currency"
                defaultValue={
                    searchParams.get("currency") || ""
                }
            >
                <option value="">
                    Todas as moedas
                </option>
                <option value="DOBRA">Dobra</option>
                <option value="EURO">Euro</option>
                <option value="DOLAR">Dólar</option>
                <option value="ISENTO">Isento</option>
                <option value="RECUSA">Recusa</option>
            </select>

            <button
                className="btn"
                type="submit"
            >
                <Search size={17} />
                Pesquisar
            </button>

            <button
                className="btn secondary"
                type="button"
                onClick={clear}
            >
                <X size={17} />
                Limpar
            </button>
        </form>
    );
}
