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

const updateSchema = z.object({
    device_name:
        z.string().trim().min(2).max(50)
            .optional(),
    post_uuid:
        z.string().uuid()
            .optional(),
    app_version:
        z.string().trim().max(30)
            .optional().nullable(),
    operating_system:
        z.string().trim().max(100)
            .optional().nullable(),
    is_active:
        z.boolean().optional()
});

export async function PATCH(
    request: Request,
    {
        params
    }: {
        params:
            Promise<{
                uuid: string
            }>
    }
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

        const {
            uuid
        } = await params;

        const body =
            updateSchema.parse(
                await request.json()
            );

        const data =
            await apiRequest(
                `/admin/devices/${uuid}`,
                {
                    method: "PATCH",
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
}
