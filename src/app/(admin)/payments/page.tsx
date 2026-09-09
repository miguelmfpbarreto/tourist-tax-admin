import Link from "next/link";

import {
    AccessDenied
} from "@/components/AccessDenied";

import {
    PaymentFilters
} from "@/components/PaymentFilters";

import {
    ApiRequestError,
    apiRequest
} from "@/lib/api";

import {
    dateTime,
    money
} from "@/lib/format";

import {
    getToken
} from "@/lib/session";

import type {
    PaymentList
} from "@/types";

type SearchParams = Promise<
    Record<
        string,
        string | undefined
    >
>;

export default async function Page({
    searchParams
}: {
    searchParams: SearchParams;
}) {
    const params =
        await searchParams;

    const verificationStatus =
        params.verification_status || "";

    const pageTitle =
        verificationStatus === "verified"
            ? "Recibos verificados"
            : verificationStatus === "unverified"
              ? "Recibos não verificados"
              : "Todos os registos";

    const pageDescription =
        verificationStatus === "verified"
            ? "Recibos já confirmados e utilizados no controlo de saída."
            : verificationStatus === "unverified"
              ? "Recibos que ainda não foram utilizados no controlo de saída."
              : "Pesquisa e consulta de todas as cobranças, recusas e isenções.";

    const token =
        await getToken();

    const query =
        new URLSearchParams();

    [
        "search",
        "payment_action",
        "currency",
        "date_from",
        "date_to",
        "verification_status",
        "page"
    ].forEach(
        function(key) {
            const value =
                params[key];

            if (value) {
                query.set(
                    key,
                    value
                );
            }
        }
    );

    query.set(
        "limit",
        "20"
    );

    let result:
        PaymentList;

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
                error.status ===
                    401 ||
                error.status ===
                    403
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

        return `/payments?${next.toString()}`;
    }

    return (
        <main className="page">
            <div className="page-head">
                <h1>
                    {pageTitle}
                </h1>

                <p className="muted">
                    {pageDescription}
                </p>
            </div>

            <PaymentFilters />

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
                                    Ação
                                </th>

                                <th>
                                    Valor
                                </th>

                                <th>
                                    Posto
                                </th>

                                <th>
                                    Dispositivo
                                </th>

                                <th>
                                    Verificação
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {result.data.map(
                                function(payment) {
                                    return (
                                        <tr
                                            key={
                                                payment.uuid
                                            }
                                        >
                                            <td>
                                                {dateTime(
                                                    payment.local_created_at
                                                )}
                                            </td>

                                            <td>
                                                <Link
                                                    href={`/payments/${payment.uuid}`}
                                                >
                                                    {
                                                        payment.receipt_no
                                                    }
                                                </Link>
                                            </td>

                                            <td>
                                                {
                                                    payment.passport
                                                }
                                            </td>

                                            <td>
                                                {
                                                    payment.name
                                                }{" "}
                                                {
                                                    payment.surname ||
                                                    ""
                                                }
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${
                                                        payment.payment_action ===
                                                        "PAGAMENTO"
                                                            ? "success"
                                                            : payment.payment_action ===
                                                              "ISENÇÃO"
                                                                ? "warning"
                                                                : "danger"
                                                    }`}
                                                >
                                                    {
                                                        payment.payment_action
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {money(
                                                    payment.amount,
                                                    payment.currency
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    payment.post_code
                                                }
                                            </td>

                                            <td>
                                                {
                                                    payment.device_name
                                                }
                                            </td>

                                            <td>
                                                <span className={`badge ${payment.exit_finalized ? "success" : ""}`}>
                                                    {payment.exit_finalized ? "VERIFICADO" : "NÃO VERIFICADO"}
                                                </span>
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
                        Nenhum registo encontrado.
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
