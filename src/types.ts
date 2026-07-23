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
