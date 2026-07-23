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
import type {
    ConfigEntityDefinition
} from "@/lib/configEntities";
import type {
    ConfigField,
    ConfigRow
} from "@/types";

type Props = {
    definition: ConfigEntityDefinition;
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
    definition
}: Props) {
    const [rows, setRows] = useState<ConfigRow[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
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

    useEffect(function() {
        loadRows();
    }, [loadRows]);

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
        } else if (field.type === "number") {
            value =
                target.value === ""
                    ? ""
                    : Number(target.value);
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
            const url = editing && editing.uuid
                ? `/api/config/${definition.entity}/${editing.uuid}`
                : `/api/config/${definition.entity}`;

            const response = await fetch(url, {
                method: editing ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const result = await response.json();

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

        if (!response.ok || !result.success) {
            setError(
                result.message ||
                    "Não foi possível alterar o estado."
            );
            return;
        }

        await loadRows();
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

                <button
                    className="btn"
                    type="button"
                    onClick={openCreate}
                >
                    <Plus size={17} />
                    Novo
                </button>
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
                                                    <button
                                                        className="icon-btn"
                                                        type="button"
                                                        title="Editar"
                                                        onClick={function() {
                                                            openEdit(row);
                                                        }}
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>

                                                    {definition.entity !==
                                                    "settings" ? (
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
                                                    >
                                                        <option value="">
                                                            Selecione
                                                        </option>
                                                        {field.options?.map(
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
