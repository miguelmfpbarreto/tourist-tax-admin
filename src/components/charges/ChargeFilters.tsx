"use client";

import {
    CalendarDays,
    MapPin,
    Plane,
    Search,
    Target,
    X
} from "lucide-react";
import {
    useEffect,
    useState
} from "react";
import {
    useRouter,
    useSearchParams
} from "next/navigation";

type Option = {
    value: string;
    label: string;
};

type ConfigApiRow = {
    id?: string | number;
    uuid?: string;
    code?: string;
    name?: string;
    description?: string;
    origin?: string;
    company?: string;
    is_active?: boolean;
};

function rowsFromPayload(payload: unknown): ConfigApiRow[] {
    if (Array.isArray(payload)) {
        return payload as ConfigApiRow[];
    }

    if (
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray(
            (payload as { data?: unknown }).data
        )
    ) {
        return (
            payload as {
                data: ConfigApiRow[];
            }
        ).data;
    }

    return [];
}

export function ChargeFilters({
    basePath,
    action
}: {
    basePath: string;
    action: "PAGAMENTO" | "RECUSA" | "ISENÇÃO";
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [posts, setPosts] =
        useState<Option[]>([]);
    const [flights, setFlights] =
        useState<Option[]>([]);
    const [visitReasons, setVisitReasons] =
        useState<Option[]>([]);
    const [loadingOptions, setLoadingOptions] =
        useState(true);
    const [optionsError, setOptionsError] =
        useState("");

    useEffect(function() {
        let cancelled = false;

        async function loadOptions() {
            setLoadingOptions(true);
            setOptionsError("");

            try {
                const responses = await Promise.all([
                    fetch(
                        "/api/config/posts?limit=500",
                        { cache: "no-store" }
                    ),
                    fetch(
                        "/api/config/flights?limit=500",
                        { cache: "no-store" }
                    ),
                    fetch(
                        "/api/config/visit-reasons?limit=500",
                        { cache: "no-store" }
                    )
                ]);

                const results = await Promise.all(
                    responses.map(function(response) {
                        return response.json();
                    })
                );

                const failedIndex = responses.findIndex(
                    function(response, index) {
                        return (
                            !response.ok ||
                            !results[index]?.success
                        );
                    }
                );

                if (failedIndex >= 0) {
                    throw new Error(
                        results[failedIndex]?.message ||
                        "Não foi possível carregar as opções dos filtros."
                    );
                }

                if (cancelled) {
                    return;
                }

                const postRows = rowsFromPayload(
                    results[0].data
                );
                const flightRows = rowsFromPayload(
                    results[1].data
                );
                const reasonRows = rowsFromPayload(
                    results[2].data
                );

                setPosts(
                    postRows
                        .filter(function(row) {
                            return (
                                row.is_active !== false &&
                                Boolean(row.code)
                            );
                        })
                        .map(function(row) {
                            return {
                                value: String(row.code),
                                label:
                                    String(row.name || row.code) +
                                    " (" +
                                    String(row.code) +
                                    ")"
                            };
                        })
                );

                setFlights(
                    flightRows
                        .filter(function(row) {
                            return (
                                row.is_active !== false &&
                                Boolean(row.code)
                            );
                        })
                        .map(function(row) {
                            const details = [
                                row.origin,
                                row.company
                            ]
                                .filter(Boolean)
                                .join(" · ");

                            return {
                                value: String(row.code),
                                label:
                                    String(row.code) +
                                    (details
                                        ? " - " + details
                                        : "")
                            };
                        })
                );

                setVisitReasons(
                    reasonRows
                        .filter(function(row) {
                            return (
                                row.is_active !== false &&
                                Boolean(row.description)
                            );
                        })
                        .map(function(row) {
                            return {
                                value: String(row.description),
                                label: String(row.description)
                            };
                        })
                );
            } catch (error) {
                if (!cancelled) {
                    setOptionsError(
                        error instanceof Error
                            ? error.message
                            : "Falha ao carregar filtros."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingOptions(false);
                }
            }
        }

        loadOptions();

        return function() {
            cancelled = true;
        };
    }, []);

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

    const showCurrencyFilter =
    action === "PAGAMENTO";

    return (
        <form
            className="card charges-toolbar"
            onSubmit={submit}
        >
            <div className="charges-filter charges-filter-search">
                <label htmlFor="charge-search">
                    Pesquisa
                </label>
                <div className="charges-input-with-icon">
                    <Search size={17} />
                    <input
                        id="charge-search"
                        className="input"
                        name="search"
                        placeholder="Recibo, passaporte ou nome"
                        defaultValue={
                            searchParams.get("search") || ""
                        }
                    />
                </div>
            </div>

            <div className="charges-filter">
                <label htmlFor="charge-date-from">
                    Data inicial
                </label>
                <div className="charges-input-with-icon">
                    <CalendarDays size={17} />
                    <input
                        id="charge-date-from"
                        className="input"
                        type="date"
                        name="date_from"
                        defaultValue={
                            searchParams.get("date_from") || ""
                        }
                    />
                </div>
            </div>

            <div className="charges-filter">
                <label htmlFor="charge-date-to">
                    Data final
                </label>
                <div className="charges-input-with-icon">
                    <CalendarDays size={17} />
                    <input
                        id="charge-date-to"
                        className="input"
                        type="date"
                        name="date_to"
                        defaultValue={
                            searchParams.get("date_to") || ""
                        }
                    />
                </div>
            </div>

            <div className="charges-filter">
                <label htmlFor="charge-post">
                    Posto
                </label>
                <div className="charges-select-with-icon">
                    <MapPin size={17} />
                    <select
                        id="charge-post"
                        className="select"
                        name="post_code"
                        defaultValue={
                            searchParams.get("post_code") || ""
                        }
                        disabled={loadingOptions}
                    >
                        <option value="">
                            {loadingOptions
                                ? "A carregar postos..."
                                : "Todos os postos"}
                        </option>
                        {posts.map(function(option) {
                            return (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            <div className="charges-filter">
                <label htmlFor="charge-flight">
                    Ligação
                </label>
                <div className="charges-select-with-icon">
                    <Plane size={17} />
                    <select
                        id="charge-flight"
                        className="select"
                        name="flight_code"
                        defaultValue={
                            searchParams.get("flight_code") || ""
                        }
                        disabled={loadingOptions}
                    >
                        <option value="">
                            {loadingOptions
                                ? "A carregar ligações..."
                                : "Todas as ligações"}
                        </option>
                        {flights.map(function(option) {
                            return (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            <div className="charges-filter">
                <label htmlFor="charge-reason">
                    Motivo da viagem
                </label>
                <div className="charges-select-with-icon">
                    <Target size={17} />
                    <select
                        id="charge-reason"
                        className="select"
                        name="visit_reason"
                        defaultValue={
                            searchParams.get("visit_reason") || ""
                        }
                        disabled={loadingOptions}
                    >
                        <option value="">
                            {loadingOptions
                                ? "A carregar motivos..."
                                : "Todos os motivos"}
                        </option>
                        {visitReasons.map(function(option) {
                            return (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {showCurrencyFilter ? (
                <div className="charges-filter">
                    <label htmlFor="charge-currency">
                        Moeda
                    </label>

                    <select
                        id="charge-currency"
                        className="select"
                        name="currency"
                        defaultValue={
                            searchParams.get("currency") || ""
                        }
                    >
                        <option value="">
                            Todas as moedas
                        </option>

                        <option value="DOBRA">
                            Dobra
                        </option>

                        <option value="EURO">
                            Euro
                        </option>

                        <option value="DOLAR">
                            Dólar
                        </option>
                    </select>
                </div>
            ) : null}

            <div className="charges-filter-actions">
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
            </div>

            {optionsError ? (
                <p className="charges-options-error">
                    {optionsError}
                </p>
            ) : null}
        </form>
    );
}
