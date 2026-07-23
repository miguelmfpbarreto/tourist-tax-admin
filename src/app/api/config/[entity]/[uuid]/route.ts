import { NextResponse } from "next/server";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { getToken } from "@/lib/session";

export async function PATCH(
    request: Request,
    context: {
        params: Promise<{
            entity: string;
            uuid: string;
        }>;
    }
) {
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

        const { entity, uuid } = await context.params;
        const body = await request.json();

        const data = await apiRequest(
            `/admin/config/${entity}/${uuid}`,
            {
                method: "PATCH",
                token,
                body: JSON.stringify(body)
            }
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
                    message: error.message,
                    details: error.details
                },
                { status: error.status }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Erro interno ao atualizar."
            },
            { status: 500 }
        );
    }
}
