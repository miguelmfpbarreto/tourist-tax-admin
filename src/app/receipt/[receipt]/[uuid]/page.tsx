import {
    BadgeCheck,
    CalendarDays,
    CircleX,
    CreditCard,
    FileCheck2,
    Globe2,
    MapPin,
    Plane,
    UserRound
} from "lucide-react";
import { env } from "@/lib/env";
import { dateOnly, dateTime, money } from "@/lib/format";
import type { SystemSettings } from "@/types";
import styles from "./receipt.module.css";

type PublicReceipt = {
    uuid: string;
    receipt_no: string;
    passport: string;
    name: string;
    surname: string | null;
    nationality: string | null;
    flight_code: string | null;
    flight_origin: string | null;
    flight_company: string | null;
    visit_reason: string | null;
    post_code: string;
    post_name: string;
    checkin_date: string;
    checkout_date: string | null;
    nights: number;
    payment_type: string | null;
    currency: string | null;
    amount: string | number;
    payment_action: "PAGAMENTO" | "RECUSA" | "ISENÇÃO";
    status: number;
    local_created_at: string;
};

type VerificationData = {
    valid: boolean;
    verified_at: string;
    receipt: PublicReceipt;
};

type ApiEnvelope<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

function loadSystem(): SystemSettings {
    return {
        country_name: "República Democrática de São Tomé e Príncipe",
        institution_name: "Direção Geral do Turismo e Hotelaria",
        system_name: "Sistema Nacional de Gestão da Taxa Turística"
    } as SystemSettings;
}

async function verifyReceipt(
    receipt: string,
    uuid: string
): Promise<{
    data: VerificationData | null;
    message: string;
}> {
    try {
        const response = await fetch(
            `${env.apiUrl}/receipt/${encodeURIComponent(receipt)}/${encodeURIComponent(uuid)}`,
            { cache: "no-store" }
        );
        const payload = (await response.json()) as ApiEnvelope<VerificationData>;

        if (!response.ok || payload.success !== true || !payload.data) {
            return {
                data: null,
                message: payload.message || "Recibo inexistente ou inválido."
            };
        }

        return {
            data: payload.data,
            message: payload.message || "Recibo autêntico."
        };
    } catch {
        return {
            data: null,
            message: "Não foi possível verificar o recibo neste momento."
        };
    }
}

function actionLabel(action: PublicReceipt["payment_action"]): string {
    if (action === "PAGAMENTO") return "Pagamento";
    if (action === "ISENÇÃO") return "Isenção";
    return "Recusa";
}

export default async function Page({
    params
}: {
    params: Promise<{
        receipt: string;
        uuid: string;
    }>;
}) {
    const { receipt, uuid } = await params;
    const verification = await verifyReceipt(receipt, uuid);
    const system = loadSystem();

    const countryName =
        system?.country_name ||
        "República Democrática de São Tomé e Príncipe";
    const institutionName =
        system?.institution_name ||
        "Direção Geral do Turismo e Hotelaria";
    const systemName =
        system?.system_name ||
        "Sistema Nacional de Gestão da Taxa Turística";

    if (!verification.data) {
        return (
            <main className={styles.page}>
                <section className={`${styles.panel} ${styles.invalidPanel}`}>
                    <div className={styles.brandMark}>
                        <img
                            src="/images/logo/turismo-sao-tome-principe.svg"
                            alt={countryName}
                            width={72}
                            height={72}
                            className={styles.brandLogo}
                        />
                    </div>
                    <p className={styles.country}>{countryName}</p>
                    <h1>{institutionName}</h1>
                    <p className={styles.systemName}>{systemName}</p>

                    <div className={styles.invalidIcon}>
                        <CircleX size={54} />
                    </div>
                    <h2>Recibo inválido</h2>
                    <p className={styles.message}>{verification.message}</p>
                    <p className={styles.helpText}>
                        Confirme se o endereço do QR Code foi aberto por completo.
                        Caso o problema persista, contacte a instituição emissora.
                    </p>
                </section>
            </main>
        );
    }

    const payment = verification.data.receipt;
    const fullName = `${payment.name} ${payment.surname || ""}`.trim();
    const flight = [payment.flight_company, payment.flight_code]
        .filter(Boolean)
        .join(" — ") || "—";
    const post = [payment.post_code, payment.post_name]
        .filter(Boolean)
        .join(" — ");

    const details = [
        {
            label: "Titular",
            value: fullName,
            icon: UserRound
        },
        {
            label: "Passaporte",
            value: payment.passport,
            icon: FileCheck2
        },
        {
            label: "Nacionalidade",
            value: payment.nationality || "—",
            icon: Globe2
        },
        {
            label: "Ligação",
            value: flight,
            icon: Plane
        },
        {
            label: "Estadia",
            value: `${dateOnly(payment.checkin_date)} a ${dateOnly(payment.checkout_date)} · ${payment.nights} noite(s)`,
            icon: CalendarDays
        },
        {
            label: "Posto de emissão",
            value: post || "—",
            icon: MapPin
        },
        {
            label: "Tipo de registo",
            value: actionLabel(payment.payment_action),
            icon: BadgeCheck
        },
        {
            label: "Forma de pagamento",
            value: payment.payment_type || "—",
            icon: CreditCard
        }
    ];

    return (
        <main className={styles.page}>
            <section className={styles.panel}>
                <header className={styles.header}>
                    <div className={styles.brandMark}>
                        <img
                            src="/images/logo/turismo-sao-tome-principe.svg"
                            alt={countryName}
                            width={58}
                            height={58}
                            className={styles.brandLogo}
                        />
                    </div>
                    <div>
                        <p className={styles.country}>{countryName}</p>
                        <h1>{institutionName}</h1>
                        <p className={styles.systemName}>{systemName}</p>
                    </div>
                </header>

                <div className={styles.validBanner}>
                    <BadgeCheck size={38} />
                    <div>
                        <strong>Recibo autêntico</strong>
                        <span>Os dados do QR Code correspondem ao registo oficial.</span>
                    </div>
                </div>

                <section className={styles.receiptHero}>
                    <span>Número do recibo</span>
                    <strong>{payment.receipt_no}</strong>
                    <small>Emitido em {dateTime(payment.local_created_at)}</small>
                </section>

                <section className={styles.amountCard}>
                    <span>Valor registado</span>
                    <strong>
                        {payment.payment_action === "PAGAMENTO"
                            ? money(payment.amount, payment.currency)
                            : actionLabel(payment.payment_action)}
                    </strong>
                    <small>{payment.visit_reason || "Taxa turística"}</small>
                </section>

                <section className={styles.detailsGrid}>
                    {details.map(function(item) {
                        const Icon = item.icon;

                        return (
                            <article key={item.label} className={styles.detailItem}>
                                <Icon size={19} />
                                <div>
                                    <span>{item.label}</span>
                                    <strong>{item.value}</strong>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <footer className={styles.footer}>
                    <span>
                        Verificado em {dateTime(verification.data.verified_at)}
                    </span>
                    <small>
                        Identificador: {payment.uuid}
                    </small>
                </footer>
            </section>
        </main>
    );
}
