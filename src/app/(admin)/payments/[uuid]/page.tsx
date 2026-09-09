import { BadgeCheck, CircleDashed } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/session";
import { dateOnly, dateTime, money } from "@/lib/format";
import { PERMISSIONS } from "@/lib/permissions";
import type { Payment } from "@/types";

function DetailGrid({ rows }: { rows: Array<[string, string]> }) {
    return (
        <div className="payment-detail-grid">
            {rows.map(([label, content]) => (
                <div key={label}>
                    <span className="muted">{label}</span>
                    <strong>{content}</strong>
                </div>
            ))}
        </div>
    );
}

export default async function Page({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;
    const token = await getToken();
    const payment = await apiRequest<Payment>(`/admin/payments/${uuid}`, { token: token || undefined });

    const paymentRows: Array<[string, string]> = [
        ["Recibo", payment.receipt_no],
        ["Passaporte", payment.passport],
        ["Nome", `${payment.name} ${payment.surname || ""}`.trim()],
        ["Nacionalidade", payment.nationality || "—"],
        ["Nascimento", dateOnly(payment.birth_date)],
        ["Ligação", `${payment.flight_company || "—"} ${payment.flight_code || ""}`.trim()],
        ["Entrada", dateOnly(payment.checkin_date)],
        ["Saída registada", dateOnly(payment.checkout_date)],
        ["Noites", String(payment.nights)],
        ["Ação", payment.payment_action],
        ["Pagamento", payment.payment_type || "—"],
        ["Valor", money(payment.amount, payment.currency)],
        ["Posto de emissão", `${payment.post_code} — ${payment.post_name}`],
        ["Dispositivo de emissão", payment.device_name],
        ["Operador de emissão", payment.operator_name || "—"],
        ["Criado", dateTime(payment.local_created_at)],
        ["Recebido", dateTime(payment.received_at)],
        ["Observação", payment.obs || "—"]
    ];

    const verificationRows: Array<[string, string]> = payment.exit_finalized
        ? [
            ["Estado", "RECIBO VERIFICADO E UTILIZADO"],
            ["Data de saída", dateOnly(payment.exit_date)],
            ["Verificado em", dateTime(payment.exit_finalized_at)],
            ["Posto de verificação", [payment.exit_post_code, payment.exit_post_name].filter(Boolean).join(" — ") || "—"],
            ["Dispositivo", payment.exit_device_name || "—"],
            ["Operador", payment.exit_operator_name || "—"]
        ]
        : [["Estado", "RECIBO AINDA NÃO VERIFICADO NO CONTROLO DE SAÍDA"]];

    return (
        <PermissionGate permission={PERMISSIONS.recordsView}>
            <main className="page payment-detail-page">
                <div className="page-head payment-detail-head">
                    <div><h1>Detalhe da cobrança</h1><p className="muted">{payment.receipt_no}</p></div>
                    <BackButton />
                </div>

                <section className="card payment-detail-section">
                    <div className="payment-detail-title"><h2>Informações da cobrança</h2><span className={`badge ${payment.payment_action === "PAGAMENTO" ? "success" : payment.payment_action === "ISENÇÃO" ? "warning" : "danger"}`}>{payment.payment_action}</span></div>
                    <DetailGrid rows={paymentRows} />
                </section>

                <section className={`card payment-detail-section verification-card ${payment.exit_finalized ? "verified" : "pending"}`}>
                    <div className="payment-detail-title">
                        <div className="verification-title-icon">{payment.exit_finalized ? <BadgeCheck size={24} /> : <CircleDashed size={24} />}</div>
                        <div><h2>Verificação no controlo de saída</h2><p>{payment.exit_finalized ? "Este recibo já foi utilizado." : "Este recibo ainda pode ser verificado na saída."}</p></div>
                    </div>
                    <DetailGrid rows={verificationRows} />
                </section>
            </main>
        </PermissionGate>
    );
}
