"use client";

import {
    Edit3,
    LoaderCircle,
    Plus,
    Power,
    Search,
    ShieldCheck,
    X
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState
} from "react";

import { AccessDenied } from "@/components/AccessDenied";

import type {
    AdminDefinition
} from "@/lib/adminEntities";

import type {
    AdminRow,
    PermissionOption,
    ProfileOption
} from "@/types";

function value(
    row: AdminRow,
    key: string
) {
    if (key === "is_active") {
        return row.is_active
            ? "ATIVO"
            : "INATIVO";
    }

    if (key === "full_name") {
        return `${row.name || ""} ${
            row.sur_name || ""
        }`.trim();
    }

    if (key === "permissions_count") {
        return Array.isArray(
            row.permission_ids
        )
            ? row.permission_ids.length
            : row.permissions_count || 0;
    }

    return String(
        row[key] ?? "—"
    );
}

function initial(
    definition: AdminDefinition
) {
    const output:
        Record<string, unknown> = {};

    definition.fields.forEach(
        function(field) {
            output[field.name] =
                field.name ===
                "permission_ids"
                    ? []
                    : "";
        }
    );

    return output;
}

function normalize(
    definition: AdminDefinition,
    form: Record<string, unknown>
) {
    const output = {
        ...form
    };

    if (
        definition.entity === "users" &&
        output.profile_id !== ""
    ) {
        output.profile_id =
            Number(output.profile_id);
    }

   if (
        definition.entity ===
        "profiles"
    ) {
        output.permission_ids =
            Array.isArray(
                output.permission_ids
            )
                ? output.permission_ids
                    .map(function(value) {
                        return Number(value);
                    })
                    .filter(
                        Number.isFinite
                    )
                : [];
    }

    if (
        definition.entity === "users" &&
        !output.password
    ) {
        delete output.password;
    }

    return output;
}

function getPermissionNames(
    row: AdminRow
): string[] {
    if (
        Array.isArray(row.permissions)
    ) {
        return row.permissions.map(
            function(permission) {
                if (
                    typeof permission ===
                    "string"
                ) {
                    return permission;
                }

                if (
                    permission &&
                    typeof permission ===
                        "object"
                ) {
                    const object =
                        permission as Record<
                            string,
                            unknown
                        >;

                    return String(
                        object.name ||
                        object.description ||
                        ""
                    );
                }

                return "";
            }
        ).filter(Boolean);
    }

    if (
        Array.isArray(
            row.permission_names
        )
    ) {
        return row.permission_names
            .map(String)
            .filter(Boolean);
    }

    return [];
}

export function AdminCrud({
    definition,
    access
}: {
    definition: AdminDefinition;
    access: { canCreate: boolean; canUpdate: boolean; canStatus: boolean; canViewPermissions: boolean; canViewProfiles: boolean };
}) {
    const [rows, setRows] =
        useState<AdminRow[]>([]);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [modal, setModal] =
        useState(false);

    const [editing, setEditing] =
        useState<AdminRow | null>(
            null
        );

    const [form, setForm] =
        useState<
            Record<string, unknown>
        >(
            initial(definition)
        );

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [accessDenied, setAccessDenied] =
        useState("");

    const [
        permissions,
        setPermissions
    ] = useState<PermissionOption[]>([]);

    const [
        loadingPermissions,
        setLoadingPermissions
    ] = useState(false);

    const [profiles, setProfiles] =
    useState<ProfileOption[]>([]);

const [loadingProfiles, setLoadingProfiles] =
    useState(false);

    const load =
        useCallback(
            async function() {
                setLoading(true);
                setError("");

                try {
                    const query =
                        new URLSearchParams({
                            page: "1",
                            limit: "200"
                        });

                    if (search.trim()) {
                        query.set(
                            "search",
                            search.trim()
                        );
                    }

                    const response =
                        await fetch(
                            `/api/administration/${definition.entity}?${query.toString()}`,
                            {
                                cache:
                                    "no-store"
                            }
                        );

                    const result =
                        await response.json();

                    if (response.status === 401 || response.status === 403) {
                        setAccessDenied(result.message || "Acesso negado.");
                        return;
                    }

                    if (
                        !response.ok ||
                        !result.success
                    ) {
                        setError(
                            result.message ||
                            "Erro ao carregar."
                        );

                        return;
                    }

                    const payload =
                        result.data;

                    setRows(
                        Array.isArray(
                            payload
                        )
                            ? payload
                            : payload.data ||
                              []
                    );
                } catch {
                    setError(
                        "Falha de comunicação."
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                definition.entity,
                search
            ]
        );

        const loadPermissions =
        useCallback(
            async function() {
                if (
                    definition.entity !==
                    "profiles"
                ) {
                    setPermissions([]);
                    return;
                }

                setLoadingPermissions(true);

                try {
                    const response =
                        await fetch(
                            "/api/administration/profiles/permission-options",
                            {
                                cache: "no-store"
                            }
                        );

                    const rawResponse =
                        await response.text();

                    let result: {
                        success?: boolean;
                        data?: PermissionOption[];
                        message?: string;
                    } = {};

                    if (rawResponse.trim()) {
                        try {
                            result =
                                JSON.parse(
                                    rawResponse
                                );
                        } catch {
                            throw new Error(
                                `Resposta inválida do servidor. HTTP ${response.status}.`
                            );
                        }
                    }

                    if (
                        !response.ok ||
                        !result.success
                    ) {
                        throw new Error(
                            result.message ||
                            `Não foi possível carregar as permissões. HTTP ${response.status}.`
                        );
                    }

                    const data =
                        Array.isArray(
                            result.data
                        )
                            ? result.data
                            : [];

                    const normalizedPermissions =
                        data
                            .map(
                                function(permission) {
                                    return {
                                        ...permission,

                                        id: Number(
                                            permission.id
                                        )
                                    };
                                }
                            )
                            .filter(
                                function(permission) {
                                    return (
                                        Number.isFinite(
                                            permission.id
                                        ) &&
                                        permission.is_active !==
                                            false
                                    );
                                }
                            );

                    setPermissions(
                        normalizedPermissions
                    );
                } catch (loadError) {
                    console.error(
                        "Erro ao carregar opções de permissões:",
                        loadError
                    );

                    setPermissions([]);

                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Não foi possível carregar as permissões."
                    );
                } finally {
                    setLoadingPermissions(
                        false
                    );
                }
            },
            [definition.entity]
        );

        const loadProfiles =
    useCallback(
        async function() {
            if (definition.entity !== "users" || !access.canViewProfiles) {
                setProfiles([]);
                return;
            }

            setLoadingProfiles(true);

            try {
                const response =
                    await fetch(
                        "/api/administration/profiles?page=1&limit=500",
                        {
                            cache: "no-store"
                        }
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {
                    throw new Error(
                        result.message ||
                        "Não foi possível carregar os perfis."
                    );
                }

                const payload =
                    result.data;

                const rows =
                    Array.isArray(payload)
                        ? payload
                        : Array.isArray(
                            payload &&
                            payload.data
                        )
                            ? payload.data
                            : [];

                setProfiles(
                    rows
                        .filter(
                            function(profile) {
                                return (
                                    profile.is_active !==
                                    false
                                );
                            }
                        )
                        .map(
                            function(profile) {
                                return {
                                    ...profile,
                                    id:
                                        Number(
                                            profile.id
                                        ) ||
                                        profile.id
                                };
                            }
                        )
                );
            } catch (loadError) {
                console.error(
                    "Erro ao carregar perfis:",
                    loadError
                );

                setProfiles([]);

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Não foi possível carregar os perfis."
                );
            } finally {
                setLoadingProfiles(false);
            }
        },
        [definition.entity, access.canViewProfiles]
    );

    useEffect(
        function() {
            load();
            loadPermissions();
            loadProfiles();
        },
        [
            load,
            loadPermissions,
            loadProfiles
        ]
    );

    function create() {
        setEditing(null);
        setForm(
            initial(definition)
        );
        setModal(true);
        setError("");
        setMessage("");
    }

    function togglePermission(
    rawPermissionId:
        number | string
) {
    const permissionId =
        Number(rawPermissionId);

    if (
        !Number.isFinite(
            permissionId
        )
    ) {
        return;
    }

    setForm(
        function(current) {
            const selectedIds =
                Array.isArray(
                    current.permission_ids
                )
                    ? current.permission_ids
                        .map(Number)
                        .filter(
                            Number.isFinite
                        )
                    : [];

            const alreadySelected =
                selectedIds.includes(
                    permissionId
                );

            return {
                ...current,

                permission_ids:
                    alreadySelected
                        ? selectedIds.filter(
                            function(id) {
                                return (
                                    id !==
                                    permissionId
                                );
                            }
                        )
                        : [
                            ...selectedIds,
                            permissionId
                        ]
            };
        }
    );
}

    function selectAllPermissions() {
    setForm(
        function(current) {
            return {
                ...current,

                permission_ids:
                    permissions
                        .map(
                            function(permission) {
                                return Number(
                                    permission.id
                                );
                            }
                        )
                        .filter(
                            Number.isFinite
                        )
            };
        }
    );
}

function clearAllPermissions() {
    setForm(
        function(current) {
            return {
                ...current,
                permission_ids: []
            };
        }
    );
}


function edit(
    row: AdminRow
) {
    const nextForm =
        initial(definition);

    definition.fields.forEach(
        function(field) {
            if (
                definition.entity ===
                    "profiles" &&
                field.name ===
                    "permission_ids"
            ) {
                nextForm.permission_ids =
                    Array.isArray(
                        row.permission_ids
                    )
                        ? row.permission_ids
                            .map(Number)
                            .filter(
                                Number.isFinite
                            )
                        : [];

                return;
            }

            nextForm[field.name] =
                row[field.name] ?? "";
        }
    );

    setEditing(row);
    setForm(nextForm);
    setError("");
    setMessage("");
    setModal(true);
}

    async function save(
        event:
            React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const url =
                editing
                    ? `/api/administration/${definition.entity}/${editing.uuid}`
                    : `/api/administration/${definition.entity}`;

            const response =
                await fetch(
                    url,
                    {
                        method:
                            editing
                                ? "PATCH"
                                : "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                normalize(
                                    definition,
                                    form
                                )
                            )
                    }
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                setError(
                    result.message ||
                    "Erro ao guardar."
                );

                return;
            }

            setModal(false);

            setMessage(
                `${definition.singular} guardado com sucesso.`
            );

            await load();
        } catch {
            setError(
                "Falha ao guardar."
            );
        } finally {
            setSaving(false);
        }
    }

    async function toggle(
        row: AdminRow
    ) {
        const active =
            !row.is_active;

        if (
            !window.confirm(
                `Deseja ${
                    active
                        ? "ativar"
                        : "desativar"
                } este registo?`
            )
        ) {
            return;
        }

        const response =
            await fetch(
                `/api/administration/${definition.entity}/${row.uuid}/status`,
                {
                    method:
                        "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            is_active:
                                active
                        })
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            setError(
                result.message ||
                "Erro ao alterar estado."
            );

            return;
        }

        await load();
    }

    function renderProfiles() {
        return (
            <section className="profile-grid">
                {rows.map(
                    function(row) {
                        const permissions =
                            getPermissionNames(
                                row
                            );

                        return (
                            <article
                                key={
                                    row.uuid
                                }
                                className="card profile-card"
                            >
                                <header className="profile-card-header">
                                    <div className="profile-card-icon">
                                        <ShieldCheck
                                            size={
                                                22
                                            }
                                        />
                                    </div>

                                    <span
                                        className={`badge ${
                                            row.is_active
                                                ? "success"
                                                : "danger"
                                        }`}
                                    >
                                        {row.is_active
                                            ? "ATIVO"
                                            : "INATIVO"}
                                    </span>
                                </header>

                                <div className="profile-card-content">
                                    <h3>
                                        {String(
                                            row.name ||
                                            "SEM NOME"
                                        )}
                                    </h3>

                                    <p>
                                        {String(
                                            row.description ||
                                            "Sem descrição."
                                        )}
                                    </p>
                                </div>

                                <div className="profile-card-permissions-title">
                                    Permissões
                                </div>

                                <div className="profile-permissions">
                                    {permissions.length >
                                    0 ? (
                                        permissions.map(
                                            function(
                                                permission,
                                                index
                                            ) {
                                                return (
                                                    <span
                                                        key={`${permission}-${index}`}
                                                        className="profile-permission-tag"
                                                    >
                                                        {
                                                            permission
                                                        }
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
                                    {access.canUpdate ? (<button
                                        className="profile-action edit"
                                        type="button"
                                        onClick={function() {
                                            edit(
                                                row
                                            );
                                        }}
                                    >
                                        <Edit3
                                            size={
                                                16
                                            }
                                        />

                                        Editar
                                    </button>) : null}

                                    {access.canStatus ? (<button
                                        className={`profile-action ${
                                            row.is_active
                                                ? "danger"
                                                : "success"
                                        }`}
                                        type="button"
                                        onClick={function() {
                                            toggle(
                                                row
                                            );
                                        }}
                                    >
                                        <Power
                                            size={
                                                16
                                            }
                                        />

                                        {row.is_active
                                            ? "Desativar"
                                            : "Ativar"}
                                    </button>) : null}
                                </footer>
                            </article>
                        );
                    }
                )}

                {rows.length === 0 ? (
                    <div className="empty">
                        Nenhum perfil encontrado.
                    </div>
                ) : null}
            </section>
        );
    }

    function renderTable() {
        return (
            <section className="card">
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                {definition.columns.map(
                                    function(
                                        column
                                    ) {
                                        return (
                                            <th
                                                key={
                                                    column.key
                                                }
                                            >
                                                {
                                                    column.label
                                                }
                                            </th>
                                        );
                                    }
                                )}

                                <th>
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map(
                                function(
                                    row,
                                    index
                                ) {
                                    return (
                                        <tr
                                            key={String(
                                                row.uuid ||
                                                index
                                            )}
                                        >
                                            {definition.columns.map(
                                                function(
                                                    column
                                                ) {
                                                    return (
                                                        <td
                                                            key={
                                                                column.key
                                                            }
                                                        >
                                                            {column.key ===
                                                            "is_active" ? (
                                                                <span
                                                                    className={`badge ${
                                                                        row.is_active
                                                                            ? "success"
                                                                            : "danger"
                                                                    }`}
                                                                >
                                                                    {value(
                                                                        row,
                                                                        column.key
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                value(
                                                                    row,
                                                                    column.key
                                                                )
                                                            )}
                                                        </td>
                                                    );
                                                }
                                            )}

                                            <td>
                                                <div className="admin-row-actions">
                                                    {access.canUpdate ? (<button
                                                        className="icon-btn"
                                                        type="button"
                                                        title="Editar"
                                                        onClick={function() {
                                                            edit(
                                                                row
                                                            );
                                                        }}
                                                    >
                                                        <Edit3
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>) : null}

                                                    {access.canStatus ? (<button
                                                        className={`icon-btn ${
                                                            row.is_active
                                                                ? "danger"
                                                                : "success"
                                                        }`}
                                                        type="button"
                                                        title={
                                                            row.is_active
                                                                ? "Desativar"
                                                                : "Ativar"
                                                        }
                                                        onClick={function() {
                                                            toggle(
                                                                row
                                                            );
                                                        }}
                                                    >
                                                        <Power
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                        </tbody>
                    </table>

                    {rows.length === 0 ? (
                        <div className="empty">
                            Nenhum registo encontrado.
                        </div>
                    ) : null}
                </div>
            </section>
        );
    }

    if (accessDenied) {
        return <AccessDenied message={accessDenied} />;
    }

    return (
        <>
            <section className="card admin-toolbar">
                <form
                    onSubmit={function(
                        event
                    ) {
                        event.preventDefault();
                        load();
                    }}
                >
                    <div className="admin-search">
                        <Search
                            size={
                                17
                            }
                        />

                        <input
                            className="input"
                            value={
                                search
                            }
                            onChange={function(
                                event
                            ) {
                                setSearch(
                                    event
                                        .target
                                        .value
                                );
                            }}
                            placeholder="Pesquisar..."
                        />
                    </div>

                    <button
                        className="btn"
                        type="submit"
                    >
                        Pesquisar
                    </button>
                </form>

                {access.canCreate ? (
                    <button className="btn" type="button" onClick={create}>
                        <Plus size={17} /> Novo
                    </button>
                ) : null}
            </section>

            {error ? (
                <div className="report-alert error">
                    {error}
                </div>
            ) : null}

            {message ? (
                <div className="report-alert success">
                    {message}
                </div>
            ) : null}

            {loading ? (
                <section className="card">
                    <div className="admin-loading">
                        <LoaderCircle
                            className="spin"
                        />

                        A carregar...
                    </div>
                </section>
            ) : definition.entity ===
              "profiles" ? (
                renderProfiles()
            ) : (
                renderTable()
            )}

            {modal ? (
                <div className="admin-modal-overlay">
                    <section className="card admin-modal">
                        <header className="admin-modal-header">
                            <h2>
                                {editing
                                    ? "Editar"
                                    : "Novo"}{" "}
                                {
                                    definition.singular
                                }
                            </h2>

                            <button
                                className="icon-btn"
                                type="button"
                                onClick={function() {
                                    setModal(
                                        false
                                    );
                                }}
                            >
                                <X
                                    size={
                                        18
                                    }
                                />
                            </button>
                        </header>

                        <form
                            onSubmit={
                                save
                            }
                        >
                            <div className="admin-form-grid">
                                {definition.fields.map(
                                    function(field) {
                                        /*
                                         * As permissões dos perfis são
                                         * apresentadas numa secção própria.
                                         */
                                        if (
                                            definition.entity === "profiles" &&
                                            field.name === "permission_ids"
                                        ) {
                                            return null;
                                        }

                                        /*
                                         * O perfil do utilizador é carregado
                                         * dinamicamente da base de dados.
                                         */
                                        if (
                                            definition.entity === "users" &&
                                            field.name === "profile_id"
                                        ) {
                                            return (
                                                <label
                                                    key={field.name}
                                                    className="report-field"
                                                >
                                                    <span>
                                                        {field.label}
                                                        {field.required
                                                            ? " *"
                                                            : ""}
                                                    </span>

                                                    <select
                                                        className="select"
                                                        value={String(
                                                            form.profile_id ??
                                                            ""
                                                        )}
                                                        required={
                                                            field.required
                                                        }
                                                        disabled={
                                                            loadingProfiles
                                                        }
                                                        onChange={function(
                                                            event
                                                        ) {
                                                            const selectedValue =
                                                                event.target
                                                                    .value;

                                                            setForm(
                                                                function(
                                                                    current
                                                                ) {
                                                                    return {
                                                                        ...current,
                                                                        profile_id:
                                                                            selectedValue ===
                                                                            ""
                                                                                ? ""
                                                                                : Number(
                                                                                      selectedValue
                                                                                  )
                                                                    };
                                                                }
                                                            );
                                                        }}
                                                    >
                                                        <option value="">
                                                            {loadingProfiles
                                                                ? "A CARREGAR PERFIS..."
                                                                : "SELECIONE O PERFIL"}
                                                        </option>

                                                        {profiles.map(
                                                            function(profile) {
                                                                return (
                                                                    <option
                                                                        key={
                                                                            profile.uuid ||
                                                                            String(
                                                                                profile.id
                                                                            )
                                                                        }
                                                                        value={
                                                                            profile.id
                                                                        }
                                                                    >
                                                                        {
                                                                            profile.name
                                                                        }
                                                                    </option>
                                                                );
                                                            }
                                                        )}
                                                    </select>
                                                </label>
                                            );
                                        }

                                        return (
                                            <label
                                                key={field.name}
                                                className="report-field"
                                            >
                                                <span>
                                                    {field.label}
                                                    {field.required
                                                        ? " *"
                                                        : ""}
                                                </span>

                                                {field.type ===
                                                "textarea" ? (
                                                    <textarea
                                                        className="input admin-textarea"
                                                        value={String(
                                                            form[
                                                                field.name
                                                            ] ?? ""
                                                        )}
                                                        required={
                                                            field.required
                                                        }
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        onChange={function(
                                                            event
                                                        ) {
                                                            setForm(
                                                                function(
                                                                    current
                                                                ) {
                                                                    return {
                                                                        ...current,
                                                                        [field.name]:
                                                                            event.target.value.toLocaleUpperCase(
                                                                                "pt-PT"
                                                                            )
                                                                    };
                                                                }
                                                            );
                                                        }}
                                                    />
                                                ) : (
                                                    <input
                                                        className="input"
                                                        type={
                                                            field.type ===
                                                            "select"
                                                                ? "text"
                                                                : field.type
                                                        }
                                                        value={String(
                                                            form[
                                                                field.name
                                                            ] ?? ""
                                                        )}
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        required={
                                                            field.required &&
                                                            !(
                                                                editing &&
                                                                field.name ===
                                                                    "password"
                                                            )
                                                        }
                                                        onChange={function(
                                                            event
                                                        ) {
                                                            const nextValue =
                                                                field.type ===
                                                                "password"
                                                                    ? event
                                                                          .target
                                                                          .value
                                                                    : event.target.value.toLocaleUpperCase(
                                                                          "pt-PT"
                                                                      );

                                                            setForm(
                                                                function(
                                                                    current
                                                                ) {
                                                                    return {
                                                                        ...current,
                                                                        [field.name]:
                                                                            nextValue
                                                                    };
                                                                }
                                                            );
                                                        }}
                                                    />
                                                )}
                                            </label>
                                        );
                                    }
                                )}
                            </div>

{definition.entity ===
"profiles" ? (
    <section className="profile-permission-selector">
        <header className="profile-permission-selector-header">
            <div>
                <h3>
                    Permissões do perfil
                </h3>

                <p>
                    Selecione as permissões
                    atribuídas a este perfil.
                </p>
            </div>

            <div className="profile-permission-selector-actions">
                <button
                    className="btn secondary small"
                    type="button"
                    onClick={
                        selectAllPermissions
                    }
                >
                    Selecionar todas
                </button>

                <button
                    className="btn secondary small"
                    type="button"
                    onClick={
                        clearAllPermissions
                    }
                >
                    Limpar
                </button>
            </div>
        </header>

        {loadingPermissions ? (
            <div className="profile-permissions-loading">
                <LoaderCircle
                    className="spin"
                    size={20}
                />

                A carregar permissões...
            </div>
        ) : (
            <div className="profile-permission-options">
                {permissions.map(
                    function(permission) {
                        const permissionId =
                            Number(
                                permission.id
                            );

                        const selectedIds =
                            Array.isArray(
                                form.permission_ids
                            )
                                ? form.permission_ids
                                    .map(Number)
                                    .filter(
                                        Number.isFinite
                                    )
                                : [];

                        const checked =
                            selectedIds.includes(
                                permissionId
                            );

                        return (
                            <label
                                key={
                                    permission.uuid ||
                                    String(
                                        permissionId
                                    )
                                }
                                className={`profile-permission-option ${
                                    checked
                                        ? "selected"
                                        : ""
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={
                                        checked
                                    }
                                    onChange={function() {
                                        togglePermission(
                                            permissionId
                                        );
                                    }}
                                />

                                <span className="profile-permission-check">
                                    {checked
                                        ? "✓"
                                        : ""}
                                </span>

                                <span className="profile-permission-option-info">
                                    <strong>
                                        {
                                            permission.name
                                        }
                                    </strong>

                                    <small>
                                        {
                                            permission.description ||
                                            "Sem descrição."
                                        }
                                    </small>
                                </span>
                            </label>
                        );
                    }
                )}

                {permissions.length ===
                0 ? (
                    <div className="empty">
                        Nenhuma permissão ativa disponível.
                    </div>
                ) : null}
            </div>
        )}

        <div className="profile-selected-count">
            {
                (
                    Array.isArray(
                        form.permission_ids
                    )
                        ? form.permission_ids
                        : []
                ).length
            }{" "}
            permissão(ões) selecionada(s)
        </div>
    </section>
) : null}

                            <footer className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="btn secondary"
                                    onClick={function() {
                                        setModal(
                                            false
                                        );
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="btn"
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "A guardar..."
                                        : "Guardar"}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            ) : null}
        </>
    );
}