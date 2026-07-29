"use client";

import { useEffect, useMemo, useState } from "react";
import {
    ClipboardCopy,
    Download,
    FileDown,
    FileJson,
    FileSpreadsheet,
    LoaderCircle,
    Printer,
    Search,
    X
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { dateOnly, dateTime, money } from "@/lib/format";
import type {
    CurrentUser,
    Payment,
    PaymentReport,
    ReportFilters,
    ReportGroupRow,
    SystemSettings
} from "@/types";



const initialFilters: ReportFilters = {
    search: "",
    payment_action: "",
    currency: "",
    date_from: "",
    date_to: "",
    post_code: "",
    flight_code: "",
    visit_reason: "",
    flight_company: "",
    flight_origin: "",
    nationality: "",
    device_name: "",
    operator_name: "",
    payment_type: "",
    status: ""
};

const pieColors = [
    "#22c55e",
    "#ef4444",
    "#f59e0b"
];

function reportFileName(extension: string): string {
    const now = new Date();
    const stamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
        "_",
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0")
    ].join("");

    return `relatorio-taxa-turistica-${stamp}.${extension}`;
}

function actionLabel(value: string): string {
    if (value === "PAGAMENTO") return "Pagamento";
    if (value === "RECUSA") return "Recusa";
    if (value === "ISENÇÃO") return "Isenção";
    return value || "—";
}

function statusLabel(value: string | number): string {
    const status = String(value);

    if (status === "0") return "Pendente";
    if (status === "1") return "Em processamento";
    if (status === "2") return "Pago";
    if (status === "3") return "Recusado";
    if (status === "4") return "Isento";

    return status;
}

function filtersDescription(filters: ReportFilters): string {
    const labels: Record<keyof ReportFilters, string> = {
        search: "Pesquisa",
        payment_action: "Ação",
        currency: "Moeda",
        date_from: "Data inicial",
        date_to: "Data final",
        post_code: "Posto",
        flight_code: "Ligação",
        visit_reason: "Motivo",
        flight_company: "Companhia",
        flight_origin: "Proveniência",
        nationality: "Nacionalidade",
        device_name: "Dispositivo",
        operator_name: "Operador",
        payment_type: "Pagamento",
        status: "Estado"
    };

    const parts: string[] = [];

    Object.entries(filters).forEach(function([key, value]) {
        if (!value) {
            return;
        }

        let finalValue = value;

        if (key === "payment_action") {
            finalValue = actionLabel(value);
        } else if (key === "date_from" || key === "date_to") {
            finalValue = dateOnly(value);
        } else if (key === "status") {
            finalValue = statusLabel(value);
        }

        parts.push(
            `${labels[key as keyof ReportFilters]}: ${finalValue}`
        );
    });

    return parts.length > 0
        ? parts.join(" | ")
        : "Todos os registos";
}

function toExportRows(payments: Payment[]) {
    return payments.map(function(payment) {
        return {
            Data: dateTime(payment.local_created_at),
            Recibo: payment.receipt_no,
            Passaporte: payment.passport,
            Nome: `${payment.name} ${payment.surname || ""}`.trim(),
            Nacionalidade: payment.nationality || "",
            Sexo: payment.gender || "",
            Ligação: payment.flight_code || "",
            Companhia: payment.flight_company || "",
            Proveniência: payment.flight_origin || "",
            Entrada: dateOnly(payment.checkin_date),
            Saída: dateOnly(payment.checkout_date),
            Noites: payment.nights,
            Motivo: payment.visit_reason || "",
            Ação: actionLabel(payment.payment_action),
            Estado: statusLabel(payment.status),
            Pagamento: payment.payment_type || "",
            Moeda: payment.currency || "",
            Valor: Number(payment.amount || 0),
            Posto: payment.post_code,
            Dispositivo: payment.device_name,
            Operador: payment.operator_name || "",
            Observação: payment.obs || ""
        };
    });
}

function groupExportRows(rows: ReportGroupRow[]) {
    return rows.map(function(row) {
        return {
            Designação: row.name,
            Registos: row.records,
            Pagamentos: row.payments,
            Recusas: row.refusals,
            Isenções: row.exemptions,
            Dobras: row.dobra_total,
            Euros: row.euro_total,
            Dólares: row.dollar_total
        };
    });
}

function downloadText(
    text: string,
    fileName: string,
    mimeType: string
) {
    const blob = new Blob([text], {
        type: mimeType
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escapeCsvValue(value: unknown): string {
    const text = String(value == null ? "" : value);

    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

function topRows(rows: ReportGroupRow[], limit = 10) {
    return rows.slice(0, limit);
}

function GroupTable({
    title,
    rows
}: {
    title: string;
    rows: ReportGroupRow[];
}) {
    return (
        <section className="card report-group-card">
            <div className="report-card-head">
                <h3>{title}</h3>
                <span>{rows.length} grupo(s)</span>
            </div>

            <div className="table-wrap report-small-table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Designação</th>
                            <th>Registos</th>
                            <th>Pagamentos</th>
                            <th>Recusas</th>
                            <th>Isenções</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.slice(0, 12).map(function(row) {
                            return (
                                <tr key={row.name}>
                                    <td>{row.name}</td>
                                    <td>{row.records}</td>
                                    <td>{row.payments}</td>
                                    <td>{row.refusals}</td>
                                    <td>{row.exemptions}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

type ReportsClientProps = {
    initialView?: "summary" | "analytics" | "table";
    fixedView?: boolean;
    system: SystemSettings;
    user: CurrentUser;
};

export function ReportsClient({
    initialView = "summary",
    fixedView = false,
    system,
    user
}: ReportsClientProps) {
    const [filters, setFilters] =
        useState<ReportFilters>(initialFilters);
    const [appliedFilters, setAppliedFilters] =
        useState<ReportFilters>(initialFilters);
    const [report, setReport] =
        useState<PaymentReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] =
        useState<"summary" | "analytics" | "table">(initialView);

    const rows = report ? report.data : [];

    const queryString = useMemo(function() {
        const query = new URLSearchParams();

        Object.entries(appliedFilters).forEach(function([key, value]) {
            if (value.trim()) {
                query.set(key, value.trim());
            }
        });

        return query.toString();
    }, [appliedFilters]);

    async function loadReport() {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `/api/reports/payments${
                    queryString ? `?${queryString}` : ""
                }`,
                {
                    cache: "no-store"
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(
                    result.message ||
                    "Não foi possível carregar o relatório."
                );
                return;
            }

            setReport(result.data);
        } catch (requestError) {
            console.error(
                "Erro ao carregar relatório:",
                requestError
            );
            setError(
                "Falha de comunicação ao carregar o relatório."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(function() {
        loadReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryString]);

    function updateFilter(
        event: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) {
        const { name, value } = event.target;

        setFilters(function(current) {
            return {
                ...current,
                [name]: value
            };
        });
    }

    function applyFilters(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setAppliedFilters({ ...filters });
    }

    function clearFilters() {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
    }

    function exportPdf() {
        if (!report || rows.length === 0) {
            setMessage("Não existem registos para exportar.");
            return;
        }

        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        const pageWidth =
            doc.internal.pageSize.getWidth();

        const pageHeight =
            doc.internal.pageSize.getHeight();

        const centerX =
            pageWidth / 2;

        const countryName =
            system.country_name ||
            "República Democrática de São Tomé e Príncipe";

        const institutionName =
            system.institution_name ||
            "Direção Geral do Turismo e Hotelaria";

        const systemName =
            system.system_name ||
            "Sistema Nacional de Gestão da Taxa Turística";

        const generatedBy =
            user.full_name ||
            user.user_name ||
            "Utilizador";

        /*
         * Cabeçalho institucional centralizado.
         */
        doc.setTextColor(
            15,
            23,
            42
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(15);

        doc.text(
            countryName.toUpperCase(),
            centerX,
            12,
            {
                align: "center"
            }
        );

        doc.setFontSize(12);

        doc.text(
            institutionName.toUpperCase(),
            centerX,
            19,
            {
                align: "center"
            }
        );

        doc.setFontSize(10);

        doc.text(
            systemName.toUpperCase(),
            centerX,
            25,
            {
                align: "center"
            }
        );

        doc.setFontSize(13);

        doc.text(
            "RELATÓRIO GERAL",
            centerX,
            34,
            {
                align: "center"
            }
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);

        doc.setTextColor(
            51,
            65,
            85
        );

        doc.text(
            `Gerado em: ${dateTime(
                report.generated_at
            )} — por: ${generatedBy}`,
            centerX,
            40,
            {
                align: "center"
            }
        );

        const description =
            filtersDescription(
                appliedFilters
            );

        const wrappedDescription =
            doc.splitTextToSize(
                `Filtros: ${description}`,
                pageWidth - 28
            );

        doc.setTextColor(
            15,
            23,
            42
        );

        doc.text(
            wrappedDescription,
            14,
            47
        );

        const filtersHeight =
            wrappedDescription.length * 4;

        const summaryY =
            51 + filtersHeight;

        doc.text(
            `Registos: ${report.summary.total_records} | ` +
            `Passaportes únicos: ${report.summary.unique_passports} | ` +
            `Pagamentos: ${report.summary.payments} | ` +
            `Recusas: ${report.summary.refusals} | ` +
            `Isenções: ${report.summary.exemptions}`,
            14,
            summaryY
        );

        doc.text(
            `Totais: ${money(
                report.summary.dobra_total,
                "DOBRA"
            )} | ` +
            `${money(
                report.summary.euro_total,
                "EURO"
            )} | ` +
            `${money(
                report.summary.dollar_total,
                "DOLAR"
            )} | ` +
            `Noites: ${report.summary.total_nights} | ` +
            `Média: ${report.summary.average_nights}`,
            14,
            summaryY + 5
        );

        autoTable(doc, {
            startY: summaryY + 10,

            head: [[
                "Data",
                "Recibo",
                "Passaporte",
                "Nome",
                "Ligação",
                "Motivo",
                "Ação",
                "Pagamento",
                "Moeda",
                "Valor",
                "Posto"
            ]],

            body: rows.map(
                function(payment) {
                    return [
                        dateTime(
                            payment.local_created_at
                        ),

                        payment.receipt_no,

                        payment.passport,

                        `${payment.name} ${
                            payment.surname ||
                            ""
                        }`.trim(),

                        payment.flight_code ||
                        "—",

                        payment.visit_reason ||
                        "—",

                        actionLabel(
                            payment.payment_action
                        ),

                        payment.payment_type ||
                        "—",

                        payment.currency ||
                        "—",

                        Number(
                            payment.amount ||
                            0
                        ).toFixed(2),

                        payment.post_code
                    ];
                }
            ),

            styles: {
                fontSize: 6.3,
                cellPadding: 1.4,
                overflow: "linebreak"
            },

            headStyles: {
                fillColor: [
                    15,
                    27,
                    45
                ],

                textColor: [
                    255,
                    255,
                    255
                ]
            },

            alternateRowStyles: {
                fillColor: [
                    241,
                    245,
                    249
                ]
            },

            margin: {
                left: 8,
                right: 8,
                bottom: 10
            },

            showHead:
                "everyPage",

            rowPageBreak:
                "avoid",

            didDrawPage:
                function(data) {
                    doc.setFont(
                        "helvetica",
                        "normal"
                    );

                    doc.setFontSize(7);

                    doc.setTextColor(
                        71,
                        85,
                        105
                    );

                    doc.text(
                        `Página ${data.pageNumber}`,
                        pageWidth - 10,
                        pageHeight - 5,
                        {
                            align: "right"
                        }
                    );
                }
        });

        doc.save(
            reportFileName(
                "pdf"
            )
        );

        setMessage(
            "PDF gerado com sucesso."
        );
    }

    function exportExcel() {
        if (!report || rows.length === 0) {
            setMessage("Não existem registos para exportar.");
            return;
        }

        const workbook = XLSX.utils.book_new();

        const summaryRows = [
            [
                (
                    system.country_name ||
                    "República Democrática de São Tomé e Príncipe"
                ).toUpperCase()
            ],
            [
                (
                    system.institution_name ||
                    "Direção Geral do Turismo e Hotelaria"
                ).toUpperCase()
            ],
            [
                (
                    system.system_name ||
                    "Sistema Nacional de Gestão da Taxa Turística"
                ).toUpperCase()
            ],
            ["RELATÓRIO GERAL"],
            [],
            [
                "Gerado em",
                `${dateTime(
                    report.generated_at
                )} — por: ${
                    user.full_name ||
                    user.user_name ||
                    "Utilizador"
                }`
            ],
            [
                "Filtros",
                filtersDescription(
                    appliedFilters
                )
            ],
            [],
            ["Indicador", "Valor"],
            ["Total de registos", report.summary.total_records],
            ["Passaportes únicos", report.summary.unique_passports],
            ["Pagamentos", report.summary.payments],
            ["Recusas", report.summary.refusals],
            ["Isenções", report.summary.exemptions],
            ["Total de noites", report.summary.total_nights],
            ["Média de noites", report.summary.average_nights],
            ["Total Dobras", report.summary.dobra_total],
            ["Total Euros", report.summary.euro_total],
            ["Total Dólares", report.summary.dollar_total]
        ];

        const summarySheet =
            XLSX.utils.aoa_to_sheet(summaryRows);

        summarySheet["!cols"] = [
            {
                wch: 28
            },
            {
                wch: 65
            }
        ];

        const recordsSheet =
            XLSX.utils.json_to_sheet(toExportRows(rows));

        recordsSheet["!cols"] =
            Object.keys(toExportRows(rows)[0]).map(function(key) {
                return {
                    wch:
                        key === "Nome" ||
                        key === "Observação"
                            ? 35
                            : key === "Recibo"
                              ? 36
                              : 18
                };
            });

        const sheets: Array<{
            name: string;
            rows: ReportGroupRow[];
        }> = [
            {
                name: "Por Ligação",
                rows: report.analytics.by_flight
            },
            {
                name: "Por Motivo",
                rows: report.analytics.by_visit_reason
            },
            {
                name: "Por Nacionalidade",
                rows: report.analytics.by_nationality
            },
            {
                name: "Por Posto",
                rows: report.analytics.by_post
            },
            {
                name: "Por Operador",
                rows: report.analytics.by_operator
            },
            {
                name: "Por Companhia",
                rows: report.analytics.by_company
            },
            {
                name: "Por Proveniência",
                rows: report.analytics.by_origin
            }
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            summarySheet,
            "Resumo"
        );
        XLSX.utils.book_append_sheet(
            workbook,
            recordsSheet,
            "Registos"
        );

        sheets.forEach(function(item) {
            const sheet = XLSX.utils.json_to_sheet(
                groupExportRows(item.rows)
            );

            sheet["!cols"] = [
                {
                    wch: 35
                },
                {
                    wch: 12
                },
                {
                    wch: 13
                },
                {
                    wch: 10
                },
                {
                    wch: 10
                },
                {
                    wch: 16
                },
                {
                    wch: 16
                },
                {
                    wch: 16
                }
            ];

            XLSX.utils.book_append_sheet(
                workbook,
                sheet,
                item.name.substring(0, 31)
            );
        });

        const dailySheet =
            XLSX.utils.json_to_sheet(
                report.analytics.daily.map(function(row) {
                    return {
                        Data: dateOnly(row.date),
                        Pagamentos: row.payments,
                        Recusas: row.refusals,
                        Isenções: row.exemptions,
                        Dobras: row.dobra_total,
                        Euros: row.euro_total,
                        Dólares: row.dollar_total
                    };
                })
            );

        XLSX.utils.book_append_sheet(
            workbook,
            dailySheet,
            "Evolução Diária"
        );

        XLSX.writeFile(
            workbook,
            reportFileName("xlsx")
        );

        setMessage(
            "Ficheiro Excel gerado com sucesso."
        );
    }

    function exportCsv() {
        if (rows.length === 0) {
            setMessage("Não existem registos para exportar.");
            return;
        }

        const exportRows = toExportRows(rows);
        const headers = Object.keys(exportRows[0]);

        const csv = [
            headers
                .map(escapeCsvValue)
                .join(","),
            ...exportRows.map(function(row) {
                return headers
                    .map(function(header) {
                        return escapeCsvValue(
                            row[
                                header as keyof typeof row
                            ]
                        );
                    })
                    .join(",");
            })
        ].join("\r\n");

        downloadText(
            "\uFEFF" + csv,
            reportFileName("csv"),
            "text/csv;charset=utf-8"
        );

        setMessage("CSV gerado com sucesso.");
    }

    function exportJson() {
        if (!report) {
            setMessage("Não existem dados para exportar.");
            return;
        }

        downloadText(
            JSON.stringify(
                {
                    generated_at: report.generated_at,
                    filters: appliedFilters,
                    summary: report.summary,
                    analytics: report.analytics,
                    data: report.data
                },
                null,
                2
            ),
            reportFileName("json"),
            "application/json;charset=utf-8"
        );

        setMessage("JSON gerado com sucesso.");
    }

    async function copyToClipboard() {
        if (rows.length === 0) {
            setMessage("Não existem registos para copiar.");
            return;
        }

        const exportRows = toExportRows(rows);
        const headers = Object.keys(exportRows[0]);

        const lines = [
            headers.join("\t"),
            ...exportRows.map(function(row) {
                return headers
                    .map(function(header) {
                        const value =
                            row[
                                header as keyof typeof row
                            ];

                        return String(
                            value == null ? "" : value
                        )
                            .replace(/\t/g, " ")
                            .replace(/\r?\n/g, " ");
                    })
                    .join("\t");
            })
        ];

        const text = lines.join("\n");

        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const textArea =
                document.createElement("textarea");

            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
        }

        setMessage(
            `${rows.length} registo(s) copiado(s).`
        );
    }

    function printReport() {
        window.print();
    }

    const pieData = report
        ? [
            {
                name: "Pagamentos",
                value: report.summary.payments
            },
            {
                name: "Recusas",
                value: report.summary.refusals
            },
            {
                name: "Isenções",
                value: report.summary.exemptions
            }
        ]
        : [];

    const options = report
        ? report.options
        : {
            posts: [],
            flights: [],
            visit_reasons: [],
            companies: [],
            origins: [],
            nationalities: [],
            devices: [],
            operators: [],
            payment_types: []
        };

    return (
        <>
            <form
                className="card report-filters"
                onSubmit={applyFilters}
            >
                <div className="report-filter-grid">
                    <label className="report-field report-search-field">
                        <span>Pesquisa</span>
                        <input
                            className="input"
                            name="search"
                            value={filters.search}
                            onChange={updateFilter}
                            placeholder="Recibo, passaporte ou nome"
                        />
                    </label>

                    <label className="report-field">
                        <span>Data inicial</span>
                        <input
                            className="input"
                            type="date"
                            name="date_from"
                            value={filters.date_from}
                            onChange={updateFilter}
                        />
                    </label>

                    <label className="report-field">
                        <span>Data final</span>
                        <input
                            className="input"
                            type="date"
                            name="date_to"
                            value={filters.date_to}
                            onChange={updateFilter}
                        />
                    </label>

                    <label className="report-field">
                        <span>Posto</span>
                        <select
                            className="select"
                            name="post_code"
                            value={filters.post_code}
                            onChange={updateFilter}
                        >
                            <option value="">
                                Todos os postos
                            </option>
                            {options.posts.map(function(value) {
                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Ligação</span>
                        <select
                            className="select"
                            name="flight_code"
                            value={filters.flight_code}
                            onChange={updateFilter}
                        >
                            <option value="">
                                Todas as ligações
                            </option>
                            {options.flights.map(function(value) {
                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Motivo da viagem</span>
                        <select
                            className="select"
                            name="visit_reason"
                            value={filters.visit_reason}
                            onChange={updateFilter}
                        >
                            <option value="">
                                Todos os motivos
                            </option>
                            {options.visit_reasons.map(function(value) {
                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Companhia</span>
                        <select
                            className="select"
                            name="flight_company"
                            value={filters.flight_company}
                            onChange={updateFilter}
                        >
                            <option value="">
                                Todas as companhias
                            </option>
                            {options.companies.map(function(value) {
                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Proveniência</span>
                        <select
                            className="select"
                            name="flight_origin"
                            value={filters.flight_origin}
                            onChange={updateFilter}
                        >
                            <option value="">
                                Todas as proveniências
                            </option>
                            {options.origins.map(function(value) {
                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Nacionalidade</span>
                        <select
                            className="select"
                            name="nationality"
                            value={filters.nationality}
                            onChange={updateFilter}
                        >
                            <option value="">
                                Todas as nacionalidades
                            </option>
                            {options.nationalities.map(function(value) {
                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Dispositivo</span>
                        <select
                            className="select"
                            name="device_name"
                            value={filters.device_name}
                            onChange={updateFilter}
                        >
                            <option value="">
                                Todos os dispositivos
                            </option>
                            {options.devices.map(function(value) {
                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Operador</span>
                        <select
                            className="select"
                            name="operator_name"
                            value={filters.operator_name}
                            onChange={updateFilter}
                        >
                            <option value="">
                                Todos os operadores
                            </option>
                            {options.operators.map(function(value) {
                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Forma de pagamento</span>
                        <select
                            className="select"
                            name="payment_type"
                            value={filters.payment_type}
                            onChange={updateFilter}
                        >
                            <option value="">
                                Todas as formas
                            </option>
                            {options.payment_types.map(function(value) {
                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Moeda</span>
                        <select
                            className="select"
                            name="currency"
                            value={filters.currency}
                            onChange={updateFilter}
                        >
                            <option value="">Todas</option>
                            <option value="DOBRA">Dobra</option>
                            <option value="EURO">Euro</option>
                            <option value="DOLAR">Dólar</option>
                            <option value="ISENTO">Isento</option>
                            <option value="RECUSA">Recusa</option>
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Tipo de registo</span>
                        <select
                            className="select"
                            name="payment_action"
                            value={filters.payment_action}
                            onChange={updateFilter}
                        >
                            <option value="">Todos</option>
                            <option value="PAGAMENTO">
                                Pagamento
                            </option>
                            <option value="RECUSA">
                                Recusa
                            </option>
                            <option value="ISENÇÃO">
                                Isenção
                            </option>
                        </select>
                    </label>

                    <label className="report-field">
                        <span>Estado</span>
                        <select
                            className="select"
                            name="status"
                            value={filters.status}
                            onChange={updateFilter}
                        >
                            <option value="">
                                Todos os estados
                            </option>
                            <option value="0">Pendente</option>
                            <option value="1">
                                Em processamento
                            </option>
                            <option value="2">Pago</option>
                            <option value="3">
                                Recusado
                            </option>
                            <option value="4">Isento</option>
                        </select>
                    </label>
                </div>

                <div className="report-filter-actions">
                    <button
                        className="btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <LoaderCircle
                                className="spin"
                                size={17}
                            />
                        ) : (
                            <Search size={17} />
                        )}
                        Aplicar filtros
                    </button>

                    <button
                        className="btn secondary"
                        type="button"
                        onClick={clearFilters}
                        disabled={loading}
                    >
                        <X size={17} />
                        Limpar
                    </button>
                </div>
            </form>

            {error ? (
                <div className="report-alert error">
                    {error}
                </div>
            ) : null}

            {message ? (
                <div className="report-alert success">
                    {message}
                </div>
            ) : null}

            {!fixedView ? (
            <section className="report-tabs no-print">
                <button
                    type="button"
                    className={
                        activeTab === "summary"
                            ? "active"
                            : ""
                    }
                    onClick={function() {
                        setActiveTab("summary");
                    }}
                >
                    Resumo
                </button>

                <button
                    type="button"
                    className={
                        activeTab === "analytics"
                            ? "active"
                            : ""
                    }
                    onClick={function() {
                        setActiveTab("analytics");
                    }}
                >
                    Análises
                </button>

                <button
                    type="button"
                    className={
                        activeTab === "table"
                            ? "active"
                            : ""
                    }
                    onClick={function() {
                        setActiveTab("table");
                    }}
                >
                    Tabela
                </button>
            </section>
            ) : null}

            {loading ? (
                <section className="card report-loading-panel">
                    <LoaderCircle
                        className="spin"
                        size={28}
                    />
                    <span>A carregar relatório...</span>
                </section>
            ) : null}

            {!loading && report ? (
                <>
                    {activeTab === "summary" ? (
                        <>
                            <section className="grid report-summary-grid">
                                <article className="card report-stat">
                                    <span>Total de registos</span>
                                    <strong>
                                        {report.summary.total_records}
                                    </strong>
                                </article>

                                <article className="card report-stat">
                                    <span>Passaportes únicos</span>
                                    <strong>
                                        {report.summary.unique_passports}
                                    </strong>
                                </article>

                                <article className="card report-stat">
                                    <span>Pagamentos</span>
                                    <strong>
                                        {report.summary.payments}
                                    </strong>
                                </article>

                                <article className="card report-stat">
                                    <span>Recusas</span>
                                    <strong>
                                        {report.summary.refusals}
                                    </strong>
                                </article>

                                <article className="card report-stat">
                                    <span>Isenções</span>
                                    <strong>
                                        {report.summary.exemptions}
                                    </strong>
                                </article>

                                <article className="card report-stat">
                                    <span>Total de noites</span>
                                    <strong>
                                        {report.summary.total_nights}
                                    </strong>
                                </article>

                                <article className="card report-stat">
                                    <span>Média de noites</span>
                                    <strong>
                                        {report.summary.average_nights}
                                    </strong>
                                </article>

                                <article className="card report-stat">
                                    <span>Gerado em</span>
                                    <strong className="report-small-value">
                                        {dateTime(
                                            report.generated_at
                                        )}
                                    </strong>
                                </article>
                            </section>

                            <section className="grid report-money-grid">
                                <article className="card report-money">
                                    <span>Total Dobras</span>
                                    <strong>
                                        {money(
                                            report.summary.dobra_total,
                                            "DOBRA"
                                        )}
                                    </strong>
                                </article>

                                <article className="card report-money">
                                    <span>Total Euros</span>
                                    <strong>
                                        {money(
                                            report.summary.euro_total,
                                            "EURO"
                                        )}
                                    </strong>
                                </article>

                                <article className="card report-money">
                                    <span>Total Dólares</span>
                                    <strong>
                                        {money(
                                            report.summary.dollar_total,
                                            "DOLAR"
                                        )}
                                    </strong>
                                </article>
                            </section>

                            <section className="grid report-chart-grid">
                                <article className="card report-chart-card">
                                    <div className="report-card-head">
                                        <h3>
                                            Pagamentos, recusas e isenções
                                        </h3>
                                    </div>

                                    <div className="report-chart">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={95}
                                                    label
                                                >
                                                    {pieData.map(
                                                        function(
                                                            entry,
                                                            index
                                                        ) {
                                                            return (
                                                                <Cell
                                                                    key={
                                                                        entry.name
                                                                    }
                                                                    fill={
                                                                        pieColors[
                                                                            index %
                                                                                pieColors.length
                                                                        ]
                                                                    }
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </article>

                                <article className="card report-chart-card">
                                    <div className="report-card-head">
                                        <h3>Evolução diária</h3>
                                    </div>

                                    <div className="report-chart">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <LineChart
                                                data={
                                                    report.analytics
                                                        .daily
                                                }
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#23354d"
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{
                                                        fill: "#91a4be",
                                                        fontSize: 11
                                                    }}
                                                />
                                                <YAxis
                                                    tick={{
                                                        fill: "#91a4be",
                                                        fontSize: 11
                                                    }}
                                                />
                                                <Tooltip />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="payments"
                                                    name="Pagamentos"
                                                    stroke="#22c55e"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="refusals"
                                                    name="Recusas"
                                                    stroke="#ef4444"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="exemptions"
                                                    name="Isenções"
                                                    stroke="#f59e0b"
                                                    strokeWidth={2}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </article>
                            </section>

                            <section className="grid report-chart-grid">
                                <article className="card report-chart-card">
                                    <div className="report-card-head">
                                        <h3>
                                            Ligações mais utilizadas
                                        </h3>
                                    </div>

                                    <div className="report-chart">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={topRows(
                                                    report.analytics
                                                        .by_flight
                                                )}
                                                layout="vertical"
                                                margin={{
                                                    left: 25,
                                                    right: 20
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#23354d"
                                                />
                                                <XAxis
                                                    type="number"
                                                    tick={{
                                                        fill: "#91a4be",
                                                        fontSize: 11
                                                    }}
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    width={90}
                                                    tick={{
                                                        fill: "#91a4be",
                                                        fontSize: 11
                                                    }}
                                                />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="records"
                                                    name="Registos"
                                                    fill="#3b82f6"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </article>

                                <article className="card report-chart-card">
                                    <div className="report-card-head">
                                        <h3>
                                            Motivos de viagem
                                        </h3>
                                    </div>

                                    <div className="report-chart">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={topRows(
                                                    report.analytics
                                                        .by_visit_reason
                                                )}
                                                layout="vertical"
                                                margin={{
                                                    left: 25,
                                                    right: 20
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#23354d"
                                                />
                                                <XAxis
                                                    type="number"
                                                    tick={{
                                                        fill: "#91a4be",
                                                        fontSize: 11
                                                    }}
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    width={105}
                                                    tick={{
                                                        fill: "#91a4be",
                                                        fontSize: 11
                                                    }}
                                                />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="records"
                                                    name="Registos"
                                                    fill="#8b5cf6"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </article>
                            </section>
                        </>
                    ) : null}

                    {activeTab === "analytics" ? (
                        <section className="grid report-analytics-grid">
                            <GroupTable
                                title="Por ligação"
                                rows={
                                    report.analytics.by_flight
                                }
                            />
                            <GroupTable
                                title="Por motivo da viagem"
                                rows={
                                    report.analytics
                                        .by_visit_reason
                                }
                            />
                            <GroupTable
                                title="Por nacionalidade"
                                rows={
                                    report.analytics
                                        .by_nationality
                                }
                            />
                            <GroupTable
                                title="Por posto"
                                rows={
                                    report.analytics.by_post
                                }
                            />
                            <GroupTable
                                title="Por operador"
                                rows={
                                    report.analytics
                                        .by_operator
                                }
                            />
                            <GroupTable
                                title="Por companhia"
                                rows={
                                    report.analytics
                                        .by_company
                                }
                            />
                            <GroupTable
                                title="Por proveniência"
                                rows={
                                    report.analytics.by_origin
                                }
                            />
                        </section>
                    ) : null}

                    {activeTab === "table" ? (
                        <section className="card report-results">
                            <div className="report-results-header">
                                <div>
                                    <h2>Registos</h2>
                                    <p className="muted">
                                        {rows.length} resultado(s) ·{" "}
                                        {filtersDescription(
                                            appliedFilters
                                        )}
                                    </p>
                                </div>

                                <div className="report-export-actions no-print">
                                    <button
                                        className="btn report-pdf-btn"
                                        type="button"
                                        onClick={exportPdf}
                                    >
                                        <FileDown size={16} />
                                        PDF
                                    </button>

                                    <button
                                        className="btn report-excel-btn"
                                        type="button"
                                        onClick={exportExcel}
                                    >
                                        <FileSpreadsheet
                                            size={16}
                                        />
                                        Excel
                                    </button>

                                    <button
                                        className="btn secondary"
                                        type="button"
                                        onClick={exportCsv}
                                    >
                                        <Download size={16} />
                                        CSV
                                    </button>

                                    <button
                                        className="btn secondary"
                                        type="button"
                                        onClick={exportJson}
                                    >
                                        <FileJson size={16} />
                                        JSON
                                    </button>

                                    <button
                                        className="btn secondary"
                                        type="button"
                                        onClick={
                                            copyToClipboard
                                        }
                                    >
                                        <ClipboardCopy
                                            size={16}
                                        />
                                        Copiar
                                    </button>

                                    <button
                                        className="btn secondary"
                                        type="button"
                                        onClick={printReport}
                                    >
                                        <Printer size={16} />
                                        Imprimir
                                    </button>
                                </div>
                            </div>

                            <div className="table-wrap report-table-wrap">
                                <table className="table report-table">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Recibo</th>
                                            <th>Passaporte</th>
                                            <th>Nome</th>
                                            <th>Ligação</th>
                                            <th>Motivo</th>
                                            <th>Ação</th>
                                            <th>Estado</th>
                                            <th>Pagamento</th>
                                            <th>Moeda</th>
                                            <th>Valor</th>
                                            <th>Posto</th>
                                            <th>Dispositivo</th>
                                            <th>Operador</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows.map(function(payment) {
                                            const badgeClass =
                                                payment.payment_action ===
                                                "PAGAMENTO"
                                                    ? "success"
                                                    : payment.payment_action ===
                                                        "ISENÇÃO"
                                                      ? "warning"
                                                      : "danger";

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
                                                        {
                                                            payment.receipt_no
                                                        }
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
                                                        {payment.surname ||
                                                            ""}
                                                    </td>
                                                    <td>
                                                        {payment.flight_code ||
                                                            "—"}
                                                    </td>
                                                    <td>
                                                        {payment.visit_reason ||
                                                            "—"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${badgeClass}`}
                                                        >
                                                            {actionLabel(
                                                                payment.payment_action
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {statusLabel(
                                                            payment.status
                                                        )}
                                                    </td>
                                                    <td>
                                                        {payment.payment_type ||
                                                            "—"}
                                                    </td>
                                                    <td>
                                                        {payment.currency ||
                                                            "—"}
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
                                                        {payment.operator_name ||
                                                            "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {rows.length === 0 ? (
                                <div className="empty">
                                    Nenhum registo encontrado.
                                </div>
                            ) : null}
                        </section>
                    ) : null}

                    {activeTab !== "table" ? (
                        <section className="card report-export-panel no-print">
                            <div>
                                <strong>Exportações</strong>
                                <p className="muted">
                                    Os ficheiros incluem todos os
                                    registos filtrados.
                                </p>
                            </div>

                            <div className="report-export-actions">
                                <button
                                    className="btn report-pdf-btn"
                                    type="button"
                                    onClick={exportPdf}
                                >
                                    <FileDown size={16} />
                                    PDF
                                </button>
                                <button
                                    className="btn report-excel-btn"
                                    type="button"
                                    onClick={exportExcel}
                                >
                                    <FileSpreadsheet size={16} />
                                    Excel
                                </button>
                                <button
                                    className="btn secondary"
                                    type="button"
                                    onClick={exportCsv}
                                >
                                    <Download size={16} />
                                    CSV
                                </button>
                                <button
                                    className="btn secondary"
                                    type="button"
                                    onClick={exportJson}
                                >
                                    <FileJson size={16} />
                                    JSON
                                </button>
                                <button
                                    className="btn secondary"
                                    type="button"
                                    onClick={copyToClipboard}
                                >
                                    <ClipboardCopy size={16} />
                                    Copiar
                                </button>
                                <button
                                    className="btn secondary"
                                    type="button"
                                    onClick={printReport}
                                >
                                    <Printer size={16} />
                                    Imprimir
                                </button>
                            </div>
                        </section>
                    ) : null}
                </>
            ) : null}
        </>
    );
}
