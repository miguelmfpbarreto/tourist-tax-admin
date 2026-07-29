import { PermissionGate } from "@/components/PermissionGate";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/session";
import { dateOnly, dateTime, money } from "@/lib/format";
import { PERMISSIONS } from "@/lib/permissions";
import type { Payment } from "@/types";

export default async function Page({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;
    const token = await getToken();
    const payment = await apiRequest<Payment>(`/admin/payments/${uuid}`, { token: token || undefined });
    const rows = [
        ["Recibo", payment.receipt_no], ["Passaporte", payment.passport], ["Nome", `${payment.name} ${payment.surname || ""}`],
        ["Nacionalidade", payment.nationality || "—"], ["Nascimento", dateOnly(payment.birth_date)], ["Ligação", `${payment.flight_company || "—"} ${payment.flight_code || ""}`],
        ["Entrada", dateOnly(payment.checkin_date)], ["Saída", dateOnly(payment.checkout_date)], ["Noites", String(payment.nights)],
        ["Ação", payment.payment_action], ["Pagamento", payment.payment_type || "—"], ["Valor", money(payment.amount, payment.currency)],
        ["Posto", `${payment.post_code} — ${payment.post_name}`], ["Dispositivo", payment.device_name], ["Operador", payment.operator_name || "—"],
        ["Criado", dateTime(payment.local_created_at)], ["Recebido", dateTime(payment.received_at)], ["Observação", payment.obs || "—"]
    ];
    return (
        <PermissionGate permission={PERMISSIONS.recordsView}>
            <main className="page"><div className="page-head"><h1>Detalhe do pagamento</h1><p className="muted">{payment.receipt_no}</p></div><section className="card section detail-grid">{rows.map(([label,content])=><div key={label}><span className="muted">{label}</span><strong style={{display:"block",marginTop:6}}>{content}</strong></div>)}</section></main>
        </PermissionGate>
    );
}
