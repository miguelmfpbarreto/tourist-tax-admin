import {
    Edit3,
    Power
} from "lucide-react";

import type {
    AdminRow
} from "@/types";

type Props = {
    rows: AdminRow[];
    onEdit: (row: AdminRow) => void;
    onToggleStatus: (
        row: AdminRow
    ) => void;
};

export function ProfileCards({
    rows,
    onEdit,
    onToggleStatus
}: Props) {
    return (
        <section className="profile-grid">
            {rows.map(function(profile) {
                const permissions =
                    Array.isArray(
                        profile.permissions
                    )
                        ? profile.permissions
                        : [];

                return (
                    <article
                        key={profile.uuid}
                        className="card profile-card"
                    >
                        <header className="profile-card-header">
                            <div>
                                <h3>
                                    {String(
                                        profile.name ||
                                        "SEM NOME"
                                    )}
                                </h3>

                                <p>
                                    {String(
                                        profile.description ||
                                        "Sem descrição."
                                    )}
                                </p>
                            </div>

                            <span
                                className={`badge ${
                                    profile.is_active
                                        ? "success"
                                        : "danger"
                                }`}
                            >
                                {profile.is_active
                                    ? "ATIVO"
                                    : "INATIVO"}
                            </span>
                        </header>

                        <div className="profile-permissions">
                            {permissions.length > 0 ? (
                                permissions.map(
                                    function(permission) {
                                        const label =
                                            typeof permission ===
                                            "string"
                                                ? permission
                                                : String(
                                                    permission.name ||
                                                    permission.description ||
                                                    ""
                                                );

                                        return (
                                            <span
                                                key={label}
                                                className="profile-permission-tag"
                                            >
                                                {label}
                                            </span>
                                        );
                                    }
                                )
                            ) : (
                                <span className="muted">
                                    Sem permissões associadas.
                                </span>
                            )}
                        </div>

                        <footer className="profile-card-actions">
                            <button
                                className="profile-action edit"
                                type="button"
                                onClick={function() {
                                    onEdit(profile);
                                }}
                            >
                                <Edit3 size={15} />
                                Editar
                            </button>

                            <button
                                className={`profile-action ${
                                    profile.is_active
                                        ? "danger"
                                        : "success"
                                }`}
                                type="button"
                                onClick={function() {
                                    onToggleStatus(
                                        profile
                                    );
                                }}
                            >
                                <Power size={15} />

                                {profile.is_active
                                    ? "Desativar"
                                    : "Ativar"}
                            </button>
                        </footer>
                    </article>
                );
            })}

            {rows.length === 0 ? (
                <div className="empty">
                    Nenhum perfil encontrado.
                </div>
            ) : null}
        </section>
    );
}