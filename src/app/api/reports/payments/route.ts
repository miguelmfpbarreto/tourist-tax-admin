import { NextResponse } from "next/server";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { getToken } from "@/lib/session";
import type {
    Payment,
    PaymentList,
    PaymentReport,
    ReportDailyRow,
    ReportFilters,
    ReportGroupRow,
    ReportOptions,
    ReportSummary
} from "@/types";

const API_FILTERS = [
    "search",
    "payment_action",
    "currency",
    "date_from",
    "date_to",
    "post_code"
] as const;

const LOCAL_FILTERS = [
    "flight_code",
    "visit_reason",
    "flight_company",
    "flight_origin",
    "nationality",
    "device_name",
    "operator_name",
    "payment_type",
    "status"
] as const;

function normalized(value: unknown): string {
    return String(value || "").trim().toUpperCase();
}

function uniqueSorted(values: Array<string | null | undefined>): string[] {
    return Array.from(
        new Set(
            values
                .map(function(value) {
                    return String(value || "").trim();
                })
                .filter(Boolean)
        )
    ).sort(function(a, b) {
        return a.localeCompare(b, "pt");
    });
}

function buildOptions(rows: Payment[]): ReportOptions {
    return {
        posts: uniqueSorted(rows.map(function(row) {
            return row.post_code;
        })),
        flights: uniqueSorted(rows.map(function(row) {
            return row.flight_code;
        })),
        visit_reasons: uniqueSorted(rows.map(function(row) {
            return row.visit_reason;
        })),
        companies: uniqueSorted(rows.map(function(row) {
            return row.flight_company;
        })),
        origins: uniqueSorted(rows.map(function(row) {
            return row.flight_origin;
        })),
        nationalities: uniqueSorted(rows.map(function(row) {
            return row.nationality;
        })),
        devices: uniqueSorted(rows.map(function(row) {
            return row.device_name;
        })),
        operators: uniqueSorted(rows.map(function(row) {
            return row.operator_name;
        })),
        payment_types: uniqueSorted(rows.map(function(row) {
            return row.payment_type;
        }))
    };
}

function filterRows(
    rows: Payment[],
    filters: Partial<ReportFilters>
): Payment[] {
    return rows.filter(function(row) {
        if (
            filters.flight_code &&
            normalized(row.flight_code) !== normalized(filters.flight_code)
        ) {
            return false;
        }

        if (
            filters.visit_reason &&
            normalized(row.visit_reason) !== normalized(filters.visit_reason)
        ) {
            return false;
        }

        if (
            filters.flight_company &&
            normalized(row.flight_company) !==
                normalized(filters.flight_company)
        ) {
            return false;
        }

        if (
            filters.flight_origin &&
            normalized(row.flight_origin) !==
                normalized(filters.flight_origin)
        ) {
            return false;
        }

        if (
            filters.nationality &&
            normalized(row.nationality) !== normalized(filters.nationality)
        ) {
            return false;
        }

        if (
            filters.device_name &&
            normalized(row.device_name) !== normalized(filters.device_name)
        ) {
            return false;
        }

        if (
            filters.operator_name &&
            normalized(row.operator_name) !== normalized(filters.operator_name)
        ) {
            return false;
        }

        if (
            filters.payment_type &&
            normalized(row.payment_type) !== normalized(filters.payment_type)
        ) {
            return false;
        }

        if (
            filters.status &&
            String(row.status) !== String(filters.status)
        ) {
            return false;
        }

        return true;
    });
}

function calculateSummary(rows: Payment[]): ReportSummary {
    const passports = new Set<string>();
    let payments = 0;
    let refusals = 0;
    let exemptions = 0;
    let totalNights = 0;
    let dobraTotal = 0;
    let euroTotal = 0;
    let dollarTotal = 0;

    rows.forEach(function(payment) {
        if (payment.passport) {
            passports.add(normalized(payment.passport));
        }

        totalNights += Number(payment.nights || 0);

        if (payment.payment_action === "PAGAMENTO") {
            payments++;

            const amount = Number(payment.amount || 0);

            if (payment.currency === "DOBRA") {
                dobraTotal += amount;
            } else if (payment.currency === "EURO") {
                euroTotal += amount;
            } else if (payment.currency === "DOLAR") {
                dollarTotal += amount;
            }
        } else if (payment.payment_action === "RECUSA") {
            refusals++;
        } else if (payment.payment_action === "ISENÇÃO") {
            exemptions++;
        }
    });

    return {
        total_records: rows.length,
        payments,
        refusals,
        exemptions,
        total_nights: totalNights,
        average_nights:
            rows.length > 0
                ? Number((totalNights / rows.length).toFixed(2))
                : 0,
        unique_passports: passports.size,
        dobra_total: Number(dobraTotal.toFixed(2)),
        euro_total: Number(euroTotal.toFixed(2)),
        dollar_total: Number(dollarTotal.toFixed(2))
    };
}

function createGroupRow(name: string): ReportGroupRow {
    return {
        name,
        records: 0,
        payments: 0,
        refusals: 0,
        exemptions: 0,
        dobra_total: 0,
        euro_total: 0,
        dollar_total: 0
    };
}

function groupRows(
    rows: Payment[],
    selector: (payment: Payment) => string | null | undefined
): ReportGroupRow[] {
    const groups = new Map<string, ReportGroupRow>();

    rows.forEach(function(payment) {
        const name = String(selector(payment) || "NÃO INFORMADO").trim();
        const row = groups.get(name) || createGroupRow(name);

        row.records++;

        if (payment.payment_action === "PAGAMENTO") {
            row.payments++;
            const amount = Number(payment.amount || 0);

            if (payment.currency === "DOBRA") {
                row.dobra_total += amount;
            } else if (payment.currency === "EURO") {
                row.euro_total += amount;
            } else if (payment.currency === "DOLAR") {
                row.dollar_total += amount;
            }
        } else if (payment.payment_action === "RECUSA") {
            row.refusals++;
        } else if (payment.payment_action === "ISENÇÃO") {
            row.exemptions++;
        }

        groups.set(name, row);
    });

    return Array.from(groups.values())
        .map(function(row) {
            return {
                ...row,
                dobra_total: Number(row.dobra_total.toFixed(2)),
                euro_total: Number(row.euro_total.toFixed(2)),
                dollar_total: Number(row.dollar_total.toFixed(2))
            };
        })
        .sort(function(a, b) {
            return b.records - a.records || a.name.localeCompare(b.name, "pt");
        });
}

function buildDaily(rows: Payment[]): ReportDailyRow[] {
    const groups = new Map<string, ReportDailyRow>();

    rows.forEach(function(payment) {
        const date = String(payment.local_created_at || "").substring(0, 10);

        if (!date) {
            return;
        }

        const row = groups.get(date) || {
            date,
            payments: 0,
            refusals: 0,
            exemptions: 0,
            dobra_total: 0,
            euro_total: 0,
            dollar_total: 0
        };

        if (payment.payment_action === "PAGAMENTO") {
            row.payments++;
            const amount = Number(payment.amount || 0);

            if (payment.currency === "DOBRA") {
                row.dobra_total += amount;
            } else if (payment.currency === "EURO") {
                row.euro_total += amount;
            } else if (payment.currency === "DOLAR") {
                row.dollar_total += amount;
            }
        } else if (payment.payment_action === "RECUSA") {
            row.refusals++;
        } else if (payment.payment_action === "ISENÇÃO") {
            row.exemptions++;
        }

        groups.set(date, row);
    });

    return Array.from(groups.values())
        .map(function(row) {
            return {
                ...row,
                dobra_total: Number(row.dobra_total.toFixed(2)),
                euro_total: Number(row.euro_total.toFixed(2)),
                dollar_total: Number(row.dollar_total.toFixed(2))
            };
        })
        .sort(function(a, b) {
            return a.date.localeCompare(b.date);
        });
}

async function loadAllPayments(
    token: string,
    queryFilters: URLSearchParams
): Promise<Payment[]> {
    const limit = 100;
    let page = 1;
    let total = 0;
    const payments: Payment[] = [];

    do {
        const query = new URLSearchParams(queryFilters);
        query.set("page", String(page));
        query.set("limit", String(limit));

        const result = await apiRequest<PaymentList>(
            `/admin/payments?${query.toString()}`,
            { token }
        );

        payments.push(...result.data);
        total = result.total;

        if (result.data.length === 0) {
            break;
        }

        page++;
    } while (payments.length < total && page <= 1000);

    return payments;
}

export async function GET(request: Request) {
    try {
        const token = await getToken();

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Sessão expirada."
                },
                { status: 401 }
            );
        }

        const requestUrl = new URL(request.url);
        const apiFilters = new URLSearchParams();
        const localFilters: Partial<ReportFilters> = {};

        API_FILTERS.forEach(function(key) {
            const value = requestUrl.searchParams.get(key);

            if (value) {
                apiFilters.set(key, value);
            }
        });

        LOCAL_FILTERS.forEach(function(key) {
            const value = requestUrl.searchParams.get(key);

            if (value) {
                localFilters[key] = value;
            }
        });

        const baseRows = await loadAllPayments(token, apiFilters);
        const options = buildOptions(baseRows);
        const rows = filterRows(baseRows, localFilters);

        const report: PaymentReport = {
            generated_at: new Date().toISOString(),
            summary: calculateSummary(rows),
            options,
            analytics: {
                daily: buildDaily(rows),
                by_flight: groupRows(rows, function(payment) {
                    return payment.flight_code;
                }),
                by_visit_reason: groupRows(rows, function(payment) {
                    return payment.visit_reason;
                }),
                by_nationality: groupRows(rows, function(payment) {
                    return payment.nationality;
                }),
                by_post: groupRows(rows, function(payment) {
                    return payment.post_code;
                }),
                by_operator: groupRows(rows, function(payment) {
                    return payment.operator_name;
                }),
                by_company: groupRows(rows, function(payment) {
                    return payment.flight_company;
                }),
                by_origin: groupRows(rows, function(payment) {
                    return payment.flight_origin;
                })
            },
            data: rows
        };

        return NextResponse.json({
            success: true,
            data: report
        });
    } catch (error) {
        if (error instanceof ApiRequestError) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message
                },
                { status: error.status }
            );
        }

        console.error("Erro ao gerar relatório:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Erro interno ao gerar o relatório."
            },
            { status: 500 }
        );
    }
}
