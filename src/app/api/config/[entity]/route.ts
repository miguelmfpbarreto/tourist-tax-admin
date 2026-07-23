import { NextResponse } from "next/server";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { ConfigEntityName } from "@/types";

const allowed = new Set<ConfigEntityName>([
    "posts",
    "flights",
    "countries",
    "visit-reasons",
    "taxes",
    "settings"
]);

function validateEntity(value: string): ConfigEntityName | null {
    return allowed.has(value as ConfigEntityName)
        ? (value as ConfigEntityName)
        : null;
}

export async function GET(
    request: Request,
    context: {
        params: Promise<{ entity: string }>;
    }
) {
    try {
        const token = await getToken();
        const { entity: rawEntity } = await context.params;
        const entity = validateEntity(rawEntity);

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Sessão expirada."
                },
                { status: 401 }
            );
        }

        if (!entity) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Entidade inválida."
                },
                { status: 404 }
            );
        }

        const url = new URL(request.url);
        const query = url.searchParams.toString();
        const data = await apiRequest(
            `/admin/config/${entity}${
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

export async function POST(
    request: Request,
    context: {
        params: Promise<{ entity: string }>;
    }
) {
    try {
        const token = await getToken();
        const { entity: rawEntity } = await context.params;
        const entity = validateEntity(rawEntity);

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Sessão expirada."
                },
                { status: 401 }
            );
        }

        if (!entity) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Entidade inválida."
                },
                { status: 404 }
            );
        }

        const body = await request.json();

        const data = await apiRequest(
            `/admin/config/${entity}`,
            {
                method: "POST",
                token,
                body: JSON.stringify(body)
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

function handleError(error: unknown) {
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

    console.error(error);

    return NextResponse.json(
        {
            success: false,
            message: "Erro interno no módulo de configuração."
        },
        { status: 500 }
    );
}
