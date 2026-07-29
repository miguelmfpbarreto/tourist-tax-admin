import { NextResponse } from "next/server";
import {
    apiRequest,
    ApiRequestError
} from "@/lib/api";
import { getToken } from "@/lib/session";

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

        const query =
            new URL(request.url).searchParams.toString();

        const data = await apiRequest(
            `/admin/synchronization/logs${
                query ? `?${query}` : ""
            }`,
            { token }
        );

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        return handleError(error);
    }
}

function handleError(error: unknown) {
    if (error instanceof ApiRequestError) {
        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            { status: error.status }
        );
    }

    return NextResponse.json(
        {
            success: false,
            message:
                "Erro interno ao carregar os logs."
        },
        { status: 500 }
    );
}
