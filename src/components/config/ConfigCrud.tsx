"use client";

import {
    Edit3,
    LoaderCircle,
    Plus,
    Power,
    Search,
    X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AccessDenied } from "@/components/AccessDenied";

import type {
    ConfigEntityDefinition
} from "@/lib/configEntities";
import type {
    ConfigField,
    ConfigRow,
    PostOption
} from "@/types";

type Props = {
    definition: ConfigEntityDefinition;
    access: { canCreate: boolean; canUpdate: boolean; canStatus: boolean };
};

function displayValue(row: ConfigRow, key: string): string {
    const value = row[key];

    if (key === "is_active") {
        return value === true ? "ATIVO" : "INATIVO";
    }

    if (key === "is_downloadable") {
        return value === true ? "SIM" : "NÃO";
    }

    if (
        key === "updated_at" &&
        typeof value === "string"
    ) {
        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleString("pt-PT");
    }

    return value == null || value === ""
        ? "—"
        : String(value);
}

function initialForm(fields: ConfigField[]) {
    const data: Record<string, unknown> = {};

    fields.forEach(function(field) {
        data[field.name] =
            field.type === "boolean"
                ? true
                : "";
    });

    return data;
}

export function ConfigCrud({
    definition,
    access
}: Props) {
    const [rows, setRows] = useState<ConfigRow[]>([]);
    const [posts, setPosts] = useState<PostOption[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [accessDenied, setAccessDenied] =
        useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] =
        useState<ConfigRow | null>(null);
    const [form, setForm] = useState<
        Record<string, unknown>
    >(initialForm(definition.fields));

    const loadRows = useCallback(async function() {
        setLoading(true);
        setError("");

        try {
            const query = new URLSearchParams();

            if (search.trim()) {
                query.set("search", search.trim());
            }

            const response = await fetch(
                `/api/config/${definition.entity}?${query.toString()}`,
                {
                    cache: "no-store"
                }
            );

            const result = await response.json();

            if (response.status === 401 || response.status === 403) {
                setAccessDenied(result.message || "Acesso negado.");
                return;
            }

            if (!response.ok || !result.success) {
                setError(
                    result.message ||
                        "Não foi possível carregar os dados."
                );
                return;
            }

            const payload = result.data;
            setRows(
                Array.isArray(payload)
                    ? payload
                    : payload.data || []
            );
        } catch {
            setError("Falha de comunicação.");
        } finally {
            setLoading(false);
        }
    }, [definition.entity, search]);

    const loadPosts =
    useCallback(
        async function() {
            /*
             * Os postos só são necessários
             * no formulário de Ligações.
             */
            if (
                definition.entity !==
                "flights"
            ) {
                setPosts([]);
                return;
            }

            setLoadingPosts(true);

            try {
                const response =
                    await fetch(
                        "/api/config/posts",
                        {
                            cache:
                                "no-store"
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
                        "Não foi possível carregar os postos."
                    );
                }

                const payload =
                    result.data;

                const postRows: PostOption[] =
                    Array.isArray(payload)
                        ? payload as PostOption[]
                        : Array.isArray(
                            payload &&
                            payload.data
                        )
                            ? payload.data as PostOption[]
                            : [];

                setPosts(
                    postRows.filter(
                        function(post) {
                            return (
                                post.is_active ===
                                true
                            );
                        }
                    )
                );
            } catch (loadError) {
                console.error(
                    "Erro ao carregar postos:",
                    loadError
                );

                setPosts([]);

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Não foi possível carregar os postos."
                );
            } finally {
                setLoadingPosts(false);
            }
        },
        [definition.entity]
    );

    useEffect(
        function() {
            loadRows();
            loadPosts();
        },
        [
            loadRows,
            loadPosts
        ]
    );

    function openCreate() {
        setEditing(null);
        setForm(initialForm(definition.fields));
        setModalOpen(true);
        setError("");
        setMessage("");
    }

    function openEdit(row: ConfigRow) {
        const next = initialForm(definition.fields);

        definition.fields.forEach(function(field) {
            next[field.name] =
                row[field.name] ??
                (field.type === "boolean" ? true : "");
        });

        setEditing(row);
        setForm(next);
        setModalOpen(true);
    }

    function updateField(
    field: ConfigField,
    event: React.ChangeEvent<
        HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
) {
    const target = event.target;
    let value: unknown = target.value;

    if (
        field.type === "boolean" &&
        target instanceof HTMLInputElement
    ) {
        value = target.checked;
    } else if (
        field.type === "number"
    ) {
        value =
            target.value === ""
                ? ""
                : Number(target.value);
    } else if (
        field.type === "text"
    ) {
        value =
            target.value.toLocaleUpperCase(
                "pt-PT"
            );
    }

    setForm(function(current) {
        return {
            ...current,
            [field.name]: value
        };
    });
}

    async function save(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const editingIdentifier = editing
                ? (
                    editing.uuid ||
                    (
                        definition.entity === "settings"
                            ? String(editing.setting_key || "")
                            : ""
                    )
                )
                : "";

            const url = editing && editingIdentifier
                ? `/api/config/${definition.entity}/${encodeURIComponent(editingIdentifier)}`
                : `/api/config/${definition.entity}`;

            const payload =
                Object.fromEntries(
                    Object.entries(form).map(
                        function([key, value]) {
                            if (
                                typeof value === "string"
                            ) {
                                if (definition.entity === "settings") {
                                    return [
                                        key,
                                        key === "setting_key"
                                            ? value.trim().toLocaleLowerCase("pt-PT")
                                            : value.trim()
                                    ];
                                }

                                return [
                                    key,
                                    value
                                        .trim()
                                        .toLocaleUpperCase(
                                            "pt-PT"
                                        )
                                ];
                            }

                            return [
                                key,
                                value
                            ];
                        }
                    )
                );

            const response = await fetch(url, {
                method: editing ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.status === 401 || response.status === 403) {
                setAccessDenied(result.message || "Acesso negado.");
                return;
            }

            if (!response.ok || !result.success) {
                setError(
                    result.message ||
                        "Não foi possível guardar."
                );
                return;
            }

            setMessage(
                `${definition.singular} ${
                    editing ? "atualizado" : "criado"
                } com sucesso.`
            );
            setModalOpen(false);
            await loadRows();
        } catch {
            setError("Falha ao guardar.");
        } finally {
            setSaving(false);
        }
    }

    async function toggleStatus(row: ConfigRow) {
        if (!row.uuid) return;

        const nextStatus = row.is_active !== true;
        const verb = nextStatus ? "ativar" : "desativar";

        if (
            !window.confirm(
                `Deseja ${verb} este registo?`
            )
        ) {
            return;
        }

        const response = await fetch(
            `/api/config/${definition.entity}/${row.uuid}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    is_active: nextStatus
                })
            }
        );

        const result = await response.json();

        if (response.status === 401 || response.status === 403) {
                setAccessDenied(result.message || "Acesso negado.");
                return;
            }

            if (!response.ok || !result.success) {
            setError(
                result.message ||
                    "Não foi possível alterar o estado."
            );
            return;
        }

        await loadRows();
    }

    if (accessDenied) {
        return <AccessDenied message={accessDenied} />;
    }

    return (
        <>
            <section className="card config-toolbar">
                <form
                    onSubmit={function(event) {
                        event.preventDefault();
                        loadRows();
                    }}
                >
                    <div className="config-search">
                        <Search size={17} />
                        <input
                            className="input"
                            value={search}
                            onChange={function(event) {
                                setSearch(event.target.value);
                            }}
                            placeholder="Pesquisar..."
                        />
                    </div>

                    <button className="btn" type="submit">
                        Pesquisar
                    </button>
                </form>

                {access.canCreate ? (
                    <button className="btn" type="button" onClick={openCreate}>
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

            <section className="card">
                {loading ? (
                    <div className="config-loading">
                        <LoaderCircle
                            className="spin"
                            size={25}
                        />
                        A carregar...
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    {definition.columns.map(
                                        function(column) {
                                            return (
                                                <th key={column.key}>
                                                    {column.label}
                                                </th>
                                            );
                                        }
                                    )}
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(function(row, index) {
                                    return (
                                        <tr
                                            key={
                                                String(
                                                    row.uuid ||
                                                    row.id ||
                                                    index
                                                )
                                            }
                                        >
                                            {definition.columns.map(
                                                function(column) {
                                                    return (
                                                        <td key={column.key}>
                                                            {displayValue(
                                                                row,
                                                                column.key
                                                            )}
                                                        </td>
                                                    );
                                                }
                                            )}
                                            <td>
                                                <div className="config-row-actions">
                                                    {access.canUpdate ? (
                                                        <button className="icon-btn" type="button" title="Editar" onClick={function() { openEdit(row); }}>
                                                            <Edit3 size={16} />
                                                        </button>
                                                    ) : null}

                                                    {definition.entity !== "settings" && access.canStatus ? (
                                                        <button
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
                                                                toggleStatus(
                                                                    row
                                                                );
                                                            }}
                                                        >
                                                            <Power size={16} />
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {rows.length === 0 ? (
                            <div className="empty">
                                Nenhum registo encontrado.
                            </div>
                        ) : null}
                    </div>
                )}
            </section>

            {modalOpen ? (
                <div className="config-modal-overlay">
                    <section className="card config-modal">
                        <header className="config-modal-header">
                            <div>
                                <h2>
                                    {editing
                                        ? `Editar ${definition.singular}`
                                        : `Novo ${definition.singular}`}
                                </h2>
                                <p>{definition.description}</p>
                            </div>

                            <button
                                type="button"
                                className="icon-btn"
                                onClick={function() {
                                    setModalOpen(false);
                                }}
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <form onSubmit={save}>
                            <div className="config-form-grid">
                                {definition.fields.map(
                                    function(field) {
                                        const value =
                                            form[field.name];

                                        const selectOptions =
                                            field.name === "post_id" &&
                                            definition.entity === "flights"
                                                ? posts.map(
                                                    function(post) {
                                                        return {
                                                            value:
                                                                String(
                                                                    post.id
                                                                ),

                                                            label:
                                                                post.code +
                                                                " - " +
                                                                post.name
                                                        };
                                                    }
                                                )
                                                : field.options || [];

                                        if (field.type === "boolean") {
                                            return (
                                                <label
                                                    key={field.name}
                                                    className="config-checkbox"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            value === true
                                                        }
                                                        onChange={function(event) {
                                                            updateField(
                                                                field,
                                                                event
                                                            );
                                                        }}
                                                    />
                                                    <span>
                                                        {field.label}
                                                    </span>
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
                                                        className="input config-textarea"
                                                        value={String(
                                                            value || ""
                                                        )}
                                                        onChange={function(event) {
                                                            updateField(
                                                                field,
                                                                event
                                                            );
                                                        }}
                                                        required={
                                                            field.required
                                                        }
                                                    />
                                                ) : field.type ===
                                                  "select" ? (
                                                    <select
                                                        className="select"
                                                        value={String(
                                                            value || ""
                                                        )}
                                                        onChange={function(event) {
                                                            updateField(
                                                                field,
                                                                event
                                                            );
                                                        }}
                                                        required={
                                                            field.required
                                                        }
                                                        disabled={
                                                            field.name ===
                                                                "post_id" &&
                                                            loadingPosts
                                                        }
                                                    >
                                                        <option value="">
                                                            {field.name === "post_id"
                                                                ? loadingPosts
                                                                    ? "A CARREGAR POSTOS..."
                                                                    : "SELECIONE O POSTO"
                                                                : "SELECIONE"}
                                                        </option>

                                                        {selectOptions.map(
                                                            function(option) {
                                                                return (
                                                                    <option
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </option>
                                                                );
                                                            }
                                                        )}
                                                    </select>
                                                ) : (
                                                    <input
                                                        className="input"
                                                        type={field.type}
                                                        value={String(
                                                            value ?? ""
                                                        )}
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        onChange={function(event) {
                                                            updateField(
                                                                field,
                                                                event
                                                            );
                                                        }}
                                                        required={
                                                            field.required
                                                        }
                                                    />
                                                )}
                                            </label>
                                        );
                                    }
                                )}
                            </div>

                            <footer className="config-modal-footer">
                                <button
                                    className="btn secondary"
                                    type="button"
                                    onClick={function() {
                                        setModalOpen(false);
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="btn"
                                    type="submit"
                                    disabled={saving}
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
