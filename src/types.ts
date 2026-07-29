export type CurrentUser = {
    uuid: string;
    full_name: string;
    user_name: string;
    profile_name: string;
    permissions: string[];
};

export type LoginResponse = {
    access_token: string;
    token_type: string;
    user: CurrentUser;
};

export type Summary = {
    payments_today: number;
    refusals_today: number;
    exemptions_today: number;
    dobra_total: string;
    euro_total: string;
    dollar_total: string;
    devices_online: number;
    devices_offline: number;
};

export type Payment = {
    id: string;
    uuid: string;
    receipt_no: string;
    passport: string;
    name: string;
    surname: string | null;
    nationality: string | null;
    nationality_code: string | null;
    birth_date: string | null;
    gender: string | null;
    flight_code: string | null;
    flight_origin: string | null;
    flight_company: string | null;
    visit_reason: string | null;
    post_code: string;
    post_name: string;
    device_name: string;
    operator_name: string | null;
    checkin_date: string;
    checkout_date: string | null;
    nights: number;
    payment_type: string | null;
    currency: string | null;
    amount: string;
    payment_action: "PAGAMENTO" | "RECUSA" | "ISENÇÃO";
    status: number;
    obs: string | null;
    local_created_at: string;
    received_at: string;
};

export type PaymentList = {
    page: number;
    limit: number;
    total: number;
    data: Payment[];
};

export type Device = {
    uuid: string;
    device_name: string;
    app_version: string | null;
    operating_system: string | null;
    is_active: boolean;
    last_seen_at: string | null;
    last_upload_at: string | null;
    last_download_at: string | null;
    post_code: string;
    post_name: string;
    connection_status: "ONLINE" | "OFFLINE" | "INATIVO";
};

export type ReportFilters = {
    search: string;
    payment_action: string;
    currency: string;
    date_from: string;
    date_to: string;
    post_code: string;
    flight_code: string;
    visit_reason: string;
    flight_company: string;
    flight_origin: string;
    nationality: string;
    device_name: string;
    operator_name: string;
    payment_type: string;
    status: string;
};

export type ReportSummary = {
    total_records: number;
    payments: number;
    refusals: number;
    exemptions: number;
    total_nights: number;
    average_nights: number;
    unique_passports: number;
    dobra_total: number;
    euro_total: number;
    dollar_total: number;
};

export type ReportGroupRow = {
    name: string;
    records: number;
    payments: number;
    refusals: number;
    exemptions: number;
    dobra_total: number;
    euro_total: number;
    dollar_total: number;
};

export type ReportDailyRow = {
    date: string;
    payments: number;
    refusals: number;
    exemptions: number;
    dobra_total: number;
    euro_total: number;
    dollar_total: number;
};

export type ReportOptions = {
    posts: string[];
    flights: string[];
    visit_reasons: string[];
    companies: string[];
    origins: string[];
    nationalities: string[];
    devices: string[];
    operators: string[];
    payment_types: string[];
};

export type PaymentReport = {
    generated_at: string;
    summary: ReportSummary;
    options: ReportOptions;
    analytics: {
        daily: ReportDailyRow[];
        by_flight: ReportGroupRow[];
        by_visit_reason: ReportGroupRow[];
        by_nationality: ReportGroupRow[];
        by_post: ReportGroupRow[];
        by_operator: ReportGroupRow[];
        by_company: ReportGroupRow[];
        by_origin: ReportGroupRow[];
    };
    data: Payment[];
};


export type ConfigEntityName =
    | "posts"
    | "flights"
    | "countries"
    | "visit-reasons"
    | "taxes"
    | "settings";

export type ConfigRow = {
    id?: string | number;
    uuid?: string;
    is_active?: boolean;
    [key: string]: unknown;
};

export type ConfigListResponse = {
    data: ConfigRow[];
    page?: number;
    limit?: number;
    total?: number;
};

export type ConfigField = {
    name: string;
    label: string;
    type: "text" | "number" | "select" | "textarea" | "boolean";
    required?: boolean;
    options?: Array<{
        value: string;
        label: string;
    }>;
    placeholder?: string;
};


export type AdminEntity = "users" | "profiles" | "permissions";
export type AdminRow = { id?: string|number; uuid: string; is_active: boolean; [key:string]: unknown };
export type AdminList<T> = { page:number; limit:number; total:number; data:T[] };


export type ChargeAction =
    | "PAGAMENTO"
    | "RECUSA"
    | "ISENÇÃO";

export type ChargePageConfig = {
    action: ChargeAction;
    title: string;
    description: string;
    emptyMessage: string;
};


export type SyncApiStatus = {
    success: boolean;
    service: string;
    api_status: "ONLINE" | "OFFLINE";
    database_status: "ONLINE" | "OFFLINE";
    checked_at: string;
    uptime_seconds?: number;
    version?: string;
};

export type SyncDevice = {
    uuid: string;
    device_name: string;
    post_code: string;
    post_name: string;
    app_version: string | null;
    operating_system: string | null;
    is_active: boolean;
    connection_status: "ONLINE" | "OFFLINE" | "INATIVO";
    last_seen_at: string | null;
    last_upload_at: string | null;
    last_download_at: string | null;
    last_download_version: string | number;
};

export type SyncLog = {
    id: string | number;
    uuid: string;
    device_uuid: string | null;
    device_name: string | null;
    post_code: string | null;
    batch_uuid: string | null;
    direction: string | null;
    log_level: string;
    event_type: string | null;
    total_sent: number;
    total_received: number;
    total_errors: number;
    message: string | null;
    details: unknown;
    sync_date: string;
};

export type SyncLogList = {
    page: number;
    limit: number;
    total: number;
    data: SyncLog[];
};

export type SyncOverview = {
    api: SyncApiStatus;
    devices_total: number;
    devices_online: number;
    devices_offline: number;
    devices_inactive: number;
    uploads_today: number;
    downloads_today: number;
    errors_today: number;
    last_sync_at: string | null;
};


export type DashboardRecentPayment = Pick<
    Payment,
    | "uuid"
    | "receipt_no"
    | "passport"
    | "name"
    | "surname"
    | "post_code"
    | "device_name"
    | "payment_action"
    | "currency"
    | "amount"
    | "local_created_at"
>;

export type DashboardData = {
    generated_at: string;
    summary: Summary;
    recent_payments: DashboardRecentPayment[];
    report: PaymentReport | null;
    synchronization: SyncOverview | null;
};


export type AuditLog = {
    id: string | number;
    uuid: string;
    user_id: string | number | null;
    user_name: string | null;
    user_full_name: string | null;
    device_id: string | number | null;
    device_name: string | null;
    post_id: string | number | null;
    post_code: string | null;
    post_name: string | null;
    action: string;
    entity_name: string | null;
    entity_uuid: string | null;
    old_values: unknown;
    new_values: unknown;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
};

export type AuditLogList = {
    page: number;
    limit: number;
    total: number;
    data: AuditLog[];
};

export type AuditSummary = {
    total_today: number;
    creates_today: number;
    updates_today: number;
    status_changes_today: number;
    logins_today: number;
    unique_users_today: number;
};

export type PostOption = {
    id: number;
    uuid: string;
    code: string;
    name: string;
    is_active: boolean;
};


export type SystemSettings = {
    system_name: string;
    country_name: string;
    institution_name: string;
    logo: string;
    theme: string;
};

export type PermissionOption = {
    id: number | string;
    uuid: string;
    name: string;
    description: string | null;
    is_active: boolean;
};

export type ProfileOption = {
    id: number | string;
    uuid: string;
    name: string;
    is_active: boolean;
};

export type ReportsClientProps = {
    initialView?: string;
    fixedView?: boolean;
    system: SystemSettings;
    user: CurrentUser;
};