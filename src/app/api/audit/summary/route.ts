import { NextResponse } from "next/server";
import {
    apiRequest,
    ApiRequestError
} from "@/lib/api";
import { getToken } from "@/lib/session";

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

        const data = await apiRequest(
            "/admin/audit/summary",
            { token }
        );

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
                    "Erro interno ao carregar o resumo da auditoria."
            },
            {
                status: 500
            }
        );
    }
}
