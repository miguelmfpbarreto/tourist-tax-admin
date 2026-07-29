import { NextResponse } from "next/server";
import {
    apiRequest,
    ApiRequestError
} from "@/lib/api";
import { getToken } from "@/lib/session";
import type {
    DashboardData,
    PaymentList,
    PaymentReport,
    Summary,
    SyncOverview
} from "@/types";

function startDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);

    return date.toISOString().substring(0, 10);
}

export async function GET() {
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

        const [
            summary,
            payments,
            report,
            synchronization
        ] = await Promise.all([
            apiRequest<Summary>(
                "/admin/dashboard/summary",
                { token }
            ),
            apiRequest<PaymentList>(
                "/admin/payments?page=1&limit=8",
                { token }
            ),
            apiRequest<PaymentReport>(
                `/admin/reports/payments?date_from=${startDate()}`,
                { token }
            ),
            apiRequest<SyncOverview>(
                "/admin/synchronization/status",
                { token }
            )
        ]);

        const data: DashboardData = {
            generated_at:
                new Date().toISOString(),
            summary,
            recent_payments:
                payments.data,
            report,
            synchronization
        };

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        if (error instanceof ApiRequestError) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message
                },
                {
                    status: error.status
                }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "Erro interno ao carregar o dashboard."
            },
            {
                status: 500
            }
        );
    }
}
