import { NextResponse } from "next/server";

import {
    apiRequest,
    ApiRequestError
} from "@/lib/api";

import {
    getToken
} from "@/lib/session";

import type {
    PermissionOption
} from "@/types";

export async function GET() {
    try {
        const token =
            await getToken();

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Sessão expirada."
                },
                {
                    status: 401
                }
            );
        }

        const data =
            await apiRequest<PermissionOption[]>(
                "/admin/profiles/permission-options",
                {
                    token
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
                    message: error.message,
                    details: error.details
                },
                {
                    status: error.status
                }
            );
        }

        console.error(
            "Erro ao carregar opções de permissões:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Erro interno ao carregar as permissões."
            },
            {
                status: 500
            }
        );
    }
}
