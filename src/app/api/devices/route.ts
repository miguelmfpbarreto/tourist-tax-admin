import {
    NextResponse
} from "next/server";

import { z } from "zod";

import {
    apiRequest,
    ApiRequestError
} from "@/lib/api";

import {
    getToken
} from "@/lib/session";

const createSchema = z.object({
    device_name:
        z.string().trim().min(2).max(50),
    post_uuid:
        z.string().uuid(),
    app_version:
        z.string().trim().max(30)
            .optional().nullable(),
    operating_system:
        z.string().trim().max(100)
            .optional().nullable(),
    is_active:
        z.boolean().optional()
});

export async function GET(
    request: Request
) {
    try {
        const token =
            await getToken();

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Sessão expirada."
                },
                {
                    status: 401
                }
            );
        }

        const query =
            new URL(request.url)
                .searchParams
                .toString();

        const data =
            await apiRequest(
                `/admin/devices${
                    query
                        ? `?${query}`
                        : ""
                }`,
                {
                    token
                }
            );

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(
    request: Request
) {
    try {
        const token =
            await getToken();

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Sessão expirada."
                },
                {
                    status: 401
                }
            );
        }

        const body =
            createSchema.parse(
                await request.json()
            );

        const data =
            await apiRequest(
                "/admin/devices",
                {
                    method: "POST",
                    token,
                    body:
                        JSON.stringify(
                            body
                        )
                }
            );

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        return handleError(error);
    }
}

function handleError(
    error: unknown
) {
    if (
        error instanceof
        z.ZodError
    ) {
        return NextResponse.json(
            {
                success: false,
                message:
                    "Dados do dispositivo inválidos.",
                details:
                    error.flatten()
            },
            {
                status: 400
            }
        );
    }

    if (
        error instanceof
        ApiRequestError
    ) {
        return NextResponse.json(
            {
                success: false,
                message:
                    error.message
            },
            {
                status:
                    error.status
            }
        );
    }

    return NextResponse.json(
        {
            success: false,
            message:
                "Erro interno."
        },
        {
            status: 500
        }
    );
}
