import Link from "next/link";

import {
    AccessDenied
} from "@/components/AccessDenied";

import {
    ChargeFilters
} from "@/components/charges/ChargeFilters";

import {
    ApiRequestError,
    apiRequest
} from "@/lib/api";

import {
    getToken
} from "@/lib/session";

import {
    dateTime,
    money
} from "@/lib/format";

import type {
    ChargePageConfig,
    PaymentList
} from "@/types";

type SearchParams = Promise<
    Record<
        string,
        string | string[] | undefined
    >
>;

function text(
    value: string | string[] | undefined
): string {
    return Array.isArray(value)
        ? value[0] || ""
        : value || "";
}

function statusLabel(
    status: number
): string {
    if (status === 2) {
        return "PAGO";
    }

    if (status === 3) {
        return "RECUSADO";
    }

    if (status === 4) {
        return "ISENTO";
    }

    if (status === 1) {
        return "EM PROCESSAMENTO";
    }

    return "PENDENTE";
}

function statusClass(
    status: number
): string {
    if (status === 2) {
        return "success";
    }

    if (status === 4) {
        return "warning";
    }

    if (status === 3) {
        return "danger";
    }

    return "";
}

export async function ChargeListPage({
    config,
    searchParams,
    basePath
}: {
    config: ChargePageConfig;
    searchParams: SearchParams;
    basePath: string;
}) {
    const params =
        await searchParams;

    const token =
        await getToken();

    const query =
        new URLSearchParams();

    [
        "search",
        "currency",
        "date_from",
        "date_to",
        "post_code",
        "flight_code",
        "visit_reason",
        "page"
    ].forEach(
        function(key) {
            const value =
                text(
                    params[key]
                );

            if (value) {
                query.set(
                    key,
                    value
                );
            }
        }
    );

    query.set(
        "payment_action",
        config.action
    );

    query.set(
        "limit",
        "20"
    );

    let result: PaymentList;

    try {
        result =
            await apiRequest<PaymentList>(
                `/admin/payments?${query.toString()}`,
                {
                    token:
                        token ||
                        undefined
                }
            );
    } catch (error) {
        if (
            error instanceof
                ApiRequestError &&
            (
                error.status === 401 ||
                error.status === 403
            )
        ) {
            return (
                <AccessDenied
                    message={
                        error.message
                    }
                />
            );
        }

        throw error;
    }

    const totalPages =
        Math.max(
            Math.ceil(
                result.total /
                result.limit
            ),
            1
        );

    function pageUrl(
        page: number
    ): string {
        const next =
            new URLSearchParams(
                query
            );

        next.set(
            "page",
            String(page)
        );

        return `${basePath}?${next.toString()}`;
    }

    const dobraTotal =
        result.data
            .filter(
                function(row) {
                    return (
                        row.currency ===
                        "DOBRA"
                    );
                }
            )
            .reduce(
                function(
                    total,
                    row
                ) {
                    return (
                        total +
                        Number(
                            row.amount ||
                            0
                        )
                    );
                },
                0
            );

    const euroTotal =
        result.data
            .filter(
                function(row) {
                    return (
                        row.currency ===
                        "EURO"
                    );
                }
            )
            .reduce(
                function(
                    total,
                    row
                ) {
                    return (
                        total +
                        Number(
                            row.amount ||
                            0
                        )
                    );
                },
                0
            );

    const dollarTotal =
        result.data
            .filter(
                function(row) {
                    return (
                        row.currency ===
                        "DOLAR"
                    );
                }
            )
            .reduce(
                function(
                    total,
                    row
                ) {
                    return (
                        total +
                        Number(
                            row.amount ||
                            0
                        )
                    );
                },
                0
            );

    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>
                        {config.title}
                    </h1>

                    <p>
                        {
                            config.description
                        }
                    </p>
                </div>
            </div>

            <section className="grid charges-summary-grid">
                <article className="card charges-stat">
                    <span>
                        Total de registos
                    </span>

                    <strong>
                        {result.total}
                    </strong>
                </article>

                <article className="card charges-stat">
                    <span>
                        Total Dobras
                    </span>

                    <strong>
                        {money(
                            dobraTotal,
                            "DOBRA"
                        )}
                    </strong>
                </article>

                <article className="card charges-stat">
                    <span>
                        Total Euros
                    </span>

                    <strong>
                        {money(
                            euroTotal,
                            "EURO"
                        )}
                    </strong>
                </article>

                <article className="card charges-stat">
                    <span>
                        Total Dólares
                    </span>

                    <strong>
                        {money(
                            dollarTotal,
                            "DOLAR"
                        )}
                    </strong>
                </article>
            </section>

            <ChargeFilters
                basePath={
                    basePath
                }
                action={
                    config.action
                }
            />

            <section className="card">
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>
                                    Data
                                </th>

                                <th>
                                    Recibo
                                </th>

                                <th>
                                    Passaporte
                                </th>

                                <th>
                                    Nome
                                </th>

                                <th>
                                    Nacionalidade
                                </th>

                                <th>
                                    Ligação
                                </th>

                                <th>
                                    Motivo
                                </th>

                                <th>
                                    Pagamento
                                </th>

                                <th>
                                    Moeda
                                </th>

                                <th>
                                    Valor
                                </th>

                                <th>
                                    Estado
                                </th>

                                <th>
                                    Posto
                                </th>

                                <th>
                                    Dispositivo
                                </th>

                                <th>
                                    Operador
                                </th>

                                <th>
                                    Observação
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {result.data.map(
                                function(row) {
                                    return (
                                        <tr
                                            key={
                                                row.uuid
                                            }
                                        >
                                            <td>
                                                {dateTime(
                                                    row.local_created_at
                                                )}
                                            </td>

                                            <td>
                                                <Link
                                                    href={`/payments/${row.uuid}`}
                                                >
                                                    {
                                                        row.receipt_no
                                                    }
                                                </Link>
                                            </td>

                                            <td>
                                                {
                                                    row.passport
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.name
                                                }{" "}
                                                {
                                                    row.surname ||
                                                    ""
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.nationality ||
                                                    "—"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.flight_code ||
                                                    "—"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.visit_reason ||
                                                    "—"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.payment_type ||
                                                    "—"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.currency ||
                                                    "—"
                                                }
                                            </td>

                                            <td>
                                                {money(
                                                    row.amount,
                                                    row.currency
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${statusClass(
                                                        row.status
                                                    )}`}
                                                >
                                                    {statusLabel(
                                                        row.status
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                {
                                                    row.post_code
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.device_name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.operator_name ||
                                                    "—"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    row.obs ||
                                                    "—"
                                                }
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                        </tbody>
                    </table>
                </div>

                {result.data.length ===
                0 ? (
                    <div className="empty">
                        {
                            config.emptyMessage
                        }
                    </div>
                ) : null}

                <div className="pagination">
                    <span className="muted">
                        Página{" "}
                        {result.page} de{" "}
                        {totalPages} ·{" "}
                        {result.total}{" "}
                        registo(s)
                    </span>

                    <div
                        style={{
                            display:
                                "flex",
                            gap: 8
                        }}
                    >
                        {result.page >
                        1 ? (
                            <Link
                                className="btn secondary"
                                href={pageUrl(
                                    result.page -
                                        1
                                )}
                            >
                                Anterior
                            </Link>
                        ) : null}

                        {result.page <
                        totalPages ? (
                            <Link
                                className="btn secondary"
                                href={pageUrl(
                                    result.page +
                                        1
                                )}
                            >
                                Seguinte
                            </Link>
                        ) : null}
                    </div>
                </div>
            </section>
        </main>
    );
}