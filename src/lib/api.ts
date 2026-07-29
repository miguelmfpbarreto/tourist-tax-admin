import { env } from "@/lib/env";

export class ApiRequestError extends Error {
    public status: number;
    public details: unknown;

    constructor(
        message: string,
        status: number,
        details: unknown = null
    ) {
        super(message);

        this.name = "ApiRequestError";
        this.status = status;
        this.details = details;

        Object.setPrototypeOf(
            this,
            ApiRequestError.prototype
        );
    }
}

type Envelope<T> = {
    success: boolean;
    message?: string;
    data?: T;
    details?: unknown;
};

type ApiRequestOptions =
    RequestInit & {
        token?: string;
    };

export async function apiRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const {
        token,
        headers,
        ...requestOptions
    } = options;

    const response = await fetch(
        `${env.apiUrl}${endpoint}`,
        {
            ...requestOptions,

            headers: {
                "Content-Type":
                    "application/json",

                ...(token
                    ? {
                        Authorization:
                            `Bearer ${token}`
                    }
                    : {}),

                ...headers
            },

            cache: "no-store"
        }
    );

    let payload: Envelope<T>;

    try {
        payload =
            await response.json();
    } catch {
        throw new ApiRequestError(
            `Resposta inválida da API. HTTP ${response.status}.`,
            response.status
        );
    }

    if (
        !response.ok ||
        payload.success !== true
    ) {
        throw new ApiRequestError(
            payload.message ||
                `Erro HTTP ${response.status}.`,
            response.status,
            payload.details || null
        );
    }

    if (
        payload.data === undefined
    ) {
        throw new ApiRequestError(
            "A API respondeu com sucesso, mas não devolveu dados.",
            response.status,
            payload.details || null
        );
    }

    return payload.data;
}
