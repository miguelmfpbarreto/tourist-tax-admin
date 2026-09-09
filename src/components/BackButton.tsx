"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
    const router = useRouter();

    return (
        <button className="btn secondary" type="button" onClick={() => router.back()}>
            <ArrowLeft size={17} />
            Voltar
        </button>
    );
}
