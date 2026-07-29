"use client";

import {
    Copy,
    Edit3,
    KeyRound,
    LoaderCircle,
    MonitorCheck,
    MonitorOff,
    Plus,
    Power,
    Search,
    Server,
    X
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState
} from "react";

type Post = {
    id: number;
    uuid: string;
    code: string;
    name: string;
    is_active: boolean;
};

type Device = {
    id: number;
    uuid: string;
    device_name: string;
    app_version: string | null;
    operating_system: string | null;
    is_active: boolean;

    connection_status:
        | "ONLINE"
        | "OFFLINE"
        | "INATIVO";

    post_uuid: string;
    post_code: string;
    post_name: string;

    last_seen_at: string | null;
    last_upload_at: string | null;
    last_download_at: string | null;
};

type Credential = {
    device_uuid: string;
    device_name: string;
    device_key: string;
};

type DeviceForm = {
    device_name: string;
    post_uuid: string;
    app_version: string;
    operating_system: string;
    is_active: boolean;
};

const emptyForm: DeviceForm = {
    device_name: "",
    post_uuid: "",
    app_version: "",
    operating_system: "",
    is_active: true
};

function formatDateTime(
    value: string | null
): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString(
        "pt-PT",
        {
            dateStyle: "short",
            timeStyle: "medium"
        }
    );
}

function shortUuid(uuid: string): string {
    if (!uuid) {
        return "—";
    }

    return `${uuid.substring(0, 8)}...`;
}

function shortText(
    value: string,
    maxLength = 32
): string {
    if (!value) {
        return "—";
    }

    if (value.length <= maxLength) {
        return value;
    }

    return `${value.substring(
        0,
        maxLength
    )}...`;
}

function getConnectionBadgeClass(
    status: Device["connection_status"]
): string {
    if (status === "ONLINE") {
        return "success";
    }

    if (status === "INATIVO") {
        return "danger";
    }

    return "warning";
}

export function DeviceManager() {
    const [devices, setDevices] =
        useState<Device[]>([]);

    const [posts, setPosts] =
        useState<Post[]>([]);

    const [search, setSearch] =
        useState("");

    const [postUuid, setPostUuid] =
        useState("");

    const [active, setActive] =
        useState("");

    const [connection, setConnection] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState("");

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [modalOpen, setModalOpen] =
        useState(false);

    const [editing, setEditing] =
        useState<Device | null>(null);

    const [form, setForm] =
        useState<DeviceForm>(emptyForm);

    const [credential, setCredential] =
        useState<Credential | null>(null);

    const summary = useMemo(
        function() {
            return {
                total: devices.length,

                online: devices.filter(
                    function(device) {
                        return (
                            device.connection_status ===
                            "ONLINE"
                        );
                    }
                ).length,

                offline: devices.filter(
                    function(device) {
                        return (
                            device.connection_status ===
                            "OFFLINE"
                        );
                    }
                ).length,

                inactive: devices.filter(
                    function(device) {
                        return (
                            device.connection_status ===
                            "INATIVO"
                        );
                    }
                ).length
            };
        },
        [devices]
    );

    async function load() {
        setLoading(true);
        setError("");

        try {
            const query =
                new URLSearchParams();

            if (search.trim()) {
                query.set(
                    "search",
                    search.trim()
                );
            }

            if (postUuid) {
                query.set(
                    "post_uuid",
                    postUuid
                );
            }

            if (active) {
                query.set(
                    "is_active",
                    active
                );
            }

            if (connection) {
                query.set(
                    "connection_status",
                    connection
                );
            }

            const [
                devicesResponse,
                postsResponse
            ] = await Promise.all([
                fetch(
                    `/api/devices?${query.toString()}`,
                    {
                        cache: "no-store"
                    }
                ),

                fetch(
                    "/api/devices/posts",
                    {
                        cache: "no-store"
                    }
                )
            ]);

            const devicesResult =
                await devicesResponse.json();

            const postsResult =
                await postsResponse.json();

            if (
                !devicesResponse.ok ||
                !devicesResult.success
            ) {
                throw new Error(
                    devicesResult.message ||
                    "Falha ao carregar dispositivos."
                );
            }

            if (
                !postsResponse.ok ||
                !postsResult.success
            ) {
                throw new Error(
                    postsResult.message ||
                    "Falha ao carregar postos."
                );
            }

            setDevices(
                devicesResult.data || []
            );

            setPosts(
                postsResult.data || []
            );
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Falha ao carregar os dados."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(function() {
        load();
    }, []);

    function clearMessages() {
        setError("");
        setMessage("");
    }

    function openCreate() {
        clearMessages();
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    }

    function openEdit(
        device: Device
    ) {
        clearMessages();

        setEditing(device);

        setForm({
            device_name:
                device.device_name,

            post_uuid:
                device.post_uuid,

            app_version:
                device.app_version || "",

            operating_system:
                device.operating_system || "",

            is_active:
                device.is_active
        });

        setModalOpen(true);
    }

    function closeFormModal() {
        if (saving) {
            return;
        }

        setModalOpen(false);
        setEditing(null);
        setForm(emptyForm);
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
            const response =
                await fetch(
                    editing
                        ? `/api/devices/${editing.uuid}`
                        : "/api/devices",
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
                                form
                            )
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
                    "Falha ao guardar o dispositivo."
                );
            }

            closeFormModal();

            if (
                !editing &&
                result.data &&
                result.data.device &&
                result.data.device_key
            ) {
                setCredential({
                    device_uuid:
                        result.data.device.uuid,

                    device_name:
                        result.data.device
                            .device_name,

                    device_key:
                        result.data.device_key
                });
            }

            setMessage(
                editing
                    ? "Dispositivo atualizado com sucesso."
                    : "Dispositivo criado com sucesso."
            );

            await load();
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Falha ao guardar o dispositivo."
            );
        } finally {
            setSaving(false);
        }
    }

    async function toggleStatus(
        device: Device
    ) {
        const nextStatus =
            !device.is_active;

        const confirmed =
            window.confirm(
                `Deseja ${
                    nextStatus
                        ? "ativar"
                        : "desativar"
                } o dispositivo "${device.device_name}"?`
            );

        if (!confirmed) {
            return;
        }

        setActionLoading(
            `status-${device.uuid}`
        );

        setError("");
        setMessage("");

        try {
            const response =
                await fetch(
                    `/api/devices/${device.uuid}/status`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                is_active:
                                    nextStatus
                            })
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
                    "Falha ao alterar o estado."
                );
            }

            setMessage(
                nextStatus
                    ? "Dispositivo ativado com sucesso."
                    : "Dispositivo desativado com sucesso."
            );

            await load();
        } catch (statusError) {
            setError(
                statusError instanceof Error
                    ? statusError.message
                    : "Falha ao alterar o estado."
            );
        } finally {
            setActionLoading("");
        }
    }

    async function regenerateKey(
        device: Device
    ) {
        const confirmed =
            window.confirm(
                "A chave atual deixará de funcionar. Deseja gerar uma nova chave?"
            );

        if (!confirmed) {
            return;
        }

        setActionLoading(
            `key-${device.uuid}`
        );

        setError("");
        setMessage("");

        try {
            const response =
                await fetch(
                    `/api/devices/${device.uuid}/regenerate-key`,
                    {
                        method: "POST"
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
                    "Falha ao regenerar a chave."
                );
            }

            setCredential({
                device_uuid:
                    result.data.device_uuid,

                device_name:
                    result.data.device_name,

                device_key:
                    result.data.device_key
            });

            setMessage(
                "Nova chave gerada com sucesso."
            );
        } catch (keyError) {
            setError(
                keyError instanceof Error
                    ? keyError.message
                    : "Falha ao regenerar a chave."
            );
        } finally {
            setActionLoading("");
        }
    }

    async function copy(
        value: string,
        label: string
    ) {
        try {
            await navigator.clipboard
                .writeText(value);

            setMessage(
                `${label} copiado para a área de transferência.`
            );
        } catch {
            setError(
                `Não foi possível copiar ${label.toLowerCase()}.`
            );
        }
    }

    function clearFilters() {
        setSearch("");
        setPostUuid("");
        setActive("");
        setConnection("");

        window.setTimeout(
            function() {
                load();
            },
            0
        );
    }

    return (
        <>
            <section className="device-summary-grid">
                <article className="card device-summary-card">
                    <div>
                        <span>Total</span>
                        <strong>
                            {summary.total}
                        </strong>
                    </div>

                    <Server size={24} />
                </article>

                <article className="card device-summary-card online">
                    <div>
                        <span>Online</span>
                        <strong>
                            {summary.online}
                        </strong>
                    </div>

                    <MonitorCheck size={24} />
                </article>

                <article className="card device-summary-card offline">
                    <div>
                        <span>Offline</span>
                        <strong>
                            {summary.offline}
                        </strong>
                    </div>

                    <MonitorOff size={24} />
                </article>

                <article className="card device-summary-card inactive">
                    <div>
                        <span>Inativos</span>
                        <strong>
                            {summary.inactive}
                        </strong>
                    </div>

                    <Power size={24} />
                </article>
            </section>

            <section className="card device-toolbar">
                <div className="device-filter-grid">
                    <div className="device-search">
                        <Search size={17} />

                        <input
                            className="input"
                            value={search}
                            onChange={function(event) {
                                setSearch(
                                    event.target.value
                                );
                            }}
                            onKeyDown={function(event) {
                                if (
                                    event.key ===
                                    "Enter"
                                ) {
                                    load();
                                }
                            }}
                            placeholder="Nome, UUID, posto, versão ou sistema"
                        />
                    </div>

                    <select
                        className="select"
                        value={postUuid}
                        onChange={function(event) {
                            setPostUuid(
                                event.target.value
                            );
                        }}
                    >
                        <option value="">
                            Todos os postos
                        </option>

                        {posts.map(function(post) {
                            return (
                                <option
                                    key={post.uuid}
                                    value={post.uuid}
                                >
                                    {post.code} -{" "}
                                    {post.name}
                                </option>
                            );
                        })}
                    </select>

                    <select
                        className="select"
                        value={active}
                        onChange={function(event) {
                            setActive(
                                event.target.value
                            );
                        }}
                    >
                        <option value="">
                            Todos os estados
                        </option>

                        <option value="true">
                            Ativos
                        </option>

                        <option value="false">
                            Inativos
                        </option>
                    </select>

                    <select
                        className="select"
                        value={connection}
                        onChange={function(event) {
                            setConnection(
                                event.target.value
                            );
                        }}
                    >
                        <option value="">
                            Todas as ligações
                        </option>

                        <option value="ONLINE">
                            Online
                        </option>

                        <option value="OFFLINE">
                            Offline
                        </option>

                        <option value="INATIVO">
                            Inativo
                        </option>
                    </select>

                    <button
                        className="btn"
                        type="button"
                        onClick={load}
                        disabled={loading}
                    >
                        <Search size={16} />
                        Pesquisar
                    </button>

                    <button
                        className="btn secondary"
                        type="button"
                        onClick={clearFilters}
                        disabled={loading}
                    >
                        Limpar
                    </button>
                </div>

                <button
                    className="btn device-new-button"
                    type="button"
                    onClick={openCreate}
                >
                    <Plus size={17} />
                    Novo dispositivo
                </button>
            </section>

            {error ? (
                <div className="app-alert error">
                    {error}
                </div>
            ) : null}

            {message ? (
                <div className="app-alert success">
                    {message}
                </div>
            ) : null}

            <section className="card device-table-card">
                {loading ? (
                    <div className="device-loading">
                        <LoaderCircle
                            className="spin"
                            size={25}
                        />

                        A carregar dispositivos...
                    </div>
                ) : (
                    <div className="device-table-wrapper">
                        <table className="table device-table">
                            <thead>
                                <tr>
                                    <th>
                                        Dispositivo
                                    </th>

                                    <th>
                                        UUID
                                    </th>

                                    <th>
                                        Posto
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                    <th>
                                        Versão
                                    </th>

                                    <th>
                                        Sistema
                                    </th>

                                    <th>
                                        Última ligação
                                    </th>

                                    <th>
                                        Ações
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {devices.map(
                                    function(device) {
                                        const statusLoading =
                                            actionLoading ===
                                            `status-${device.uuid}`;

                                        const keyLoading =
                                            actionLoading ===
                                            `key-${device.uuid}`;

                                        return (
                                            <tr
                                                key={
                                                    device.uuid
                                                }
                                            >
                                                <td>
                                                    <div className="device-name-cell">
                                                        <strong>
                                                            {
                                                                device.device_name
                                                            }
                                                        </strong>

                                                        <span>
                                                            Chave configurada
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="device-copy-value">
                                                        <code
                                                            title={
                                                                device.uuid
                                                            }
                                                        >
                                                            {shortUuid(
                                                                device.uuid
                                                            )}
                                                        </code>

                                                        <button
                                                            className="icon-btn"
                                                            type="button"
                                                            title="Copiar UUID"
                                                            onClick={function() {
                                                                copy(
                                                                    device.uuid,
                                                                    "UUID"
                                                                );
                                                            }}
                                                        >
                                                            <Copy
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="device-post-cell">
                                                        <strong>
                                                            {
                                                                device.post_code
                                                            }
                                                        </strong>

                                                        <span
                                                            title={
                                                                device.post_name
                                                            }
                                                        >
                                                            {shortText(
                                                                device.post_name,
                                                                26
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`badge ${getConnectionBadgeClass(
                                                            device.connection_status
                                                        )}`}
                                                    >
                                                        {
                                                            device.connection_status
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {device.app_version ||
                                                        "—"}
                                                </td>

                                                <td>
                                                    {shortText(
                                                        device.operating_system ||
                                                        "—",
                                                        20
                                                    )}
                                                </td>

                                                <td>
                                                    {formatDateTime(
                                                        device.last_seen_at
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="device-actions">
                                                        <button
                                                            className="icon-btn"
                                                            type="button"
                                                            title="Editar dispositivo"
                                                            onClick={function() {
                                                                openEdit(
                                                                    device
                                                                );
                                                            }}
                                                        >
                                                            <Edit3
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            className="icon-btn"
                                                            type="button"
                                                            title="Regenerar chave"
                                                            disabled={
                                                                keyLoading
                                                            }
                                                            onClick={function() {
                                                                regenerateKey(
                                                                    device
                                                                );
                                                            }}
                                                        >
                                                            {keyLoading ? (
                                                                <LoaderCircle
                                                                    className="spin"
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            ) : (
                                                                <KeyRound
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            )}
                                                        </button>

                                                        <button
                                                            className={`icon-btn ${
                                                                device.is_active
                                                                    ? "danger"
                                                                    : "success"
                                                            }`}
                                                            type="button"
                                                            disabled={
                                                                statusLoading
                                                            }
                                                            title={
                                                                device.is_active
                                                                    ? "Desativar dispositivo"
                                                                    : "Ativar dispositivo"
                                                            }
                                                            onClick={function() {
                                                                toggleStatus(
                                                                    device
                                                                );
                                                            }}
                                                        >
                                                            {statusLoading ? (
                                                                <LoaderCircle
                                                                    className="spin"
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            ) : (
                                                                <Power
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>

                        {devices.length === 0 ? (
                            <div className="empty">
                                Nenhum dispositivo encontrado.
                            </div>
                        ) : null}
                    </div>
                )}
            </section>

            {modalOpen ? (
                <div
                    className="device-modal-overlay"
                    onMouseDown={function(event) {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeFormModal();
                        }
                    }}
                >
                    <section className="card device-modal">
                        <header className="device-modal-header">
                            <div>
                                <h2>
                                    {editing
                                        ? "Editar dispositivo"
                                        : "Novo dispositivo"}
                                </h2>

                                <p>
                                    {editing
                                        ? "Atualize os dados e o posto associado."
                                        : "Registe um novo terminal Electron."}
                                </p>
                            </div>

                            <button
                                className="icon-btn"
                                type="button"
                                title="Fechar"
                                onClick={
                                    closeFormModal
                                }
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <form onSubmit={save}>
                            <div className="device-form-grid">
                                <label className="device-field">
                                    <span>
                                        Nome do dispositivo *
                                    </span>

                                    <input
                                        className="input"
                                        value={
                                            form.device_name
                                        }
                                        onChange={function(event) {
                                            setForm({
                                                ...form,
                                                device_name:
                                                    event.target.value
                                            });
                                        }}
                                        placeholder="Ex.: DT-1"
                                        maxLength={50}
                                        required
                                    />
                                </label>

                                <label className="device-field">
                                    <span>
                                        Posto *
                                    </span>

                                    <select
                                        className="select"
                                        value={
                                            form.post_uuid
                                        }
                                        onChange={function(event) {
                                            setForm({
                                                ...form,
                                                post_uuid:
                                                    event.target.value
                                            });
                                        }}
                                        required
                                    >
                                        <option value="">
                                            Selecione o posto
                                        </option>

                                        {posts
                                            .filter(
                                                function(post) {
                                                    return (
                                                        post.is_active ||
                                                        post.uuid ===
                                                        form.post_uuid
                                                    );
                                                }
                                            )
                                            .map(
                                                function(post) {
                                                    return (
                                                        <option
                                                            key={
                                                                post.uuid
                                                            }
                                                            value={
                                                                post.uuid
                                                            }
                                                        >
                                                            {
                                                                post.code
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                post.name
                                                            }
                                                        </option>
                                                    );
                                                }
                                            )}
                                    </select>
                                </label>

                                <label className="device-field">
                                    <span>
                                        Versão da aplicação
                                    </span>

                                    <input
                                        className="input"
                                        value={
                                            form.app_version
                                        }
                                        onChange={function(event) {
                                            setForm({
                                                ...form,
                                                app_version:
                                                    event.target.value
                                            });
                                        }}
                                        placeholder="Ex.: 1.0.0"
                                        maxLength={30}
                                    />
                                </label>

                                <label className="device-field">
                                    <span>
                                        Sistema operativo
                                    </span>

                                    <input
                                        className="input"
                                        value={
                                            form.operating_system
                                        }
                                        onChange={function(event) {
                                            setForm({
                                                ...form,
                                                operating_system:
                                                    event.target.value
                                            });
                                        }}
                                        placeholder="Ex.: Windows 11"
                                        maxLength={100}
                                    />
                                </label>

                                <label className="device-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.is_active
                                        }
                                        onChange={function(event) {
                                            setForm({
                                                ...form,
                                                is_active:
                                                    event.target.checked
                                            });
                                        }}
                                    />

                                    <span>
                                        Dispositivo ativo
                                    </span>
                                </label>
                            </div>

                            <footer className="device-modal-footer">
                                <button
                                    className="btn secondary"
                                    type="button"
                                    disabled={saving}
                                    onClick={
                                        closeFormModal
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="btn"
                                    type="submit"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <LoaderCircle
                                                className="spin"
                                                size={16}
                                            />
                                            A guardar...
                                        </>
                                    ) : (
                                        "Guardar"
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            ) : null}

            {credential ? (
                <div className="device-modal-overlay">
                    <section className="card device-credential-modal">
                        <header className="device-modal-header">
                            <div>
                                <h2>
                                    Credenciais do dispositivo
                                </h2>

                                <p>
                                    Guarde a chave agora.
                                    Ela não será apresentada novamente.
                                </p>
                            </div>

                            <button
                                className="icon-btn"
                                type="button"
                                title="Fechar"
                                onClick={function() {
                                    setCredential(
                                        null
                                    );
                                }}
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="device-credential-body">
                            <div className="device-created-name">
                                <span>
                                    Dispositivo
                                </span>

                                <strong>
                                    {
                                        credential.device_name
                                    }
                                </strong>
                            </div>

                            <label className="device-field">
                                <span>
                                    Device UUID
                                </span>

                                <div className="device-credential-value">
                                    <code>
                                        {
                                            credential.device_uuid
                                        }
                                    </code>

                                    <button
                                        className="btn secondary"
                                        type="button"
                                        onClick={function() {
                                            copy(
                                                credential.device_uuid,
                                                "UUID"
                                            );
                                        }}
                                    >
                                        <Copy size={16} />
                                        Copiar
                                    </button>
                                </div>
                            </label>

                            <label className="device-field">
                                <span>
                                    Device Key
                                </span>

                                <div className="device-credential-value">
                                    <code>
                                        {
                                            credential.device_key
                                        }
                                    </code>

                                    <button
                                        className="btn secondary"
                                        type="button"
                                        onClick={function() {
                                            copy(
                                                credential.device_key,
                                                "Device Key"
                                            );
                                        }}
                                    >
                                        <Copy size={16} />
                                        Copiar
                                    </button>
                                </div>
                            </label>
                        </div>

                        <footer className="device-modal-footer">
                            <button
                                className="btn"
                                type="button"
                                onClick={function() {
                                    setCredential(
                                        null
                                    );
                                }}
                            >
                                Concluir
                            </button>
                        </footer>
                    </section>
                </div>
            ) : null}
        </>
    );
}