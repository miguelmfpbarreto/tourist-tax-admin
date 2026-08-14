import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "@/components/LoginForm";
import type { SystemSettings } from "@/types";

export default async function Page() {
    if (await getCurrentUser()) {
        redirect("/dashboard");
    }

    const system = await apiRequest<SystemSettings>(
        "/admin/settings/system"
    );

    const countryName =
        system.country_name ||
        "República Democrática de São Tomé e Príncipe";

    const institutionName =
        system.institution_name ||
        "Direção Geral do Turismo e Hotelaria";

    const systemName =
        system.system_name ||
        "Sistema Nacional de Gestão da Taxa Turística";

    const configuredLogo = system.logo?.trim() || "";
    const logo = configuredLogo
        ? (
            configuredLogo.startsWith("/") ||
            configuredLogo.startsWith("http://") ||
            configuredLogo.startsWith("https://")
                ? configuredLogo
                : `/${configuredLogo}`
        )
        : "/images/logo/turismo-sao-tome-principe.svg";

    return (
        <main className="login-page">
            <section className="card login-card">
                <header className="login-brand">
                    <div className="login-logo-wrap">
                        <img
                            src={logo}
                            alt={countryName}
                            className="login-logo"
                        />
                    </div>

                    <div className="login-identity">
                        <p className="login-country">
                            {countryName}
                        </p>

                        <h1>{institutionName}</h1>

                        <p className="login-system-name">
                            {systemName}
                        </p>
                    </div>
                </header>

                <div className="login-divider" />

                <div className="login-form-head">
                    <h2>Iniciar sessão</h2>
                    <p className="muted">
                        Introduza as suas credenciais para aceder à administração central.
                    </p>
                </div>

                <LoginForm />
            </section>
        </main>
    );
}
