import type {
    ConfigEntityName,
    ConfigField
} from "@/types";

export type ConfigEntityDefinition = {
    entity: ConfigEntityName;
    title: string;
    singular: string;
    description: string;
    columns: Array<{
        key: string;
        label: string;
    }>;
    fields: ConfigField[];
};

export const configEntities: Record<
    ConfigEntityName,
    ConfigEntityDefinition
> = {
    posts: {
    entity: "posts",
    title: "Postos",
    singular: "Posto",
    description:
        "Gestão dos postos de entrada e cobrança.",
    columns: [
        {
            key: "code",
            label: "Código"
        },
        {
            key: "name",
            label: "Nome"
        },
        {
            key: "location",
            label: "Localização"
        },
        {
            key: "is_active",
            label: "Estado"
        }
    ],
    fields: [
        {
            name: "code",
            label: "Código",
            type: "text",
            required: true,
            placeholder: "AIR001"
        },
        {
            name: "name",
            label: "Nome",
            type: "text",
            required: true
        },
        {
            name: "location",
            label: "Localização",
            type: "select",
            required: true,
            options: [
                {
                    value: "SÃO TOMÉ",
                    label: "SÃO TOMÉ"
                },
                {
                    value: "PRÍNCIPE",
                    label: "PRÍNCIPE"
                }
            ]
        }
    ]
},
    flights: {
        entity: "flights",
        title: "Ligações",
        singular: "Ligação",
        description:
            "Voos e embarcações disponíveis por posto.",
        columns: [
            { key: "code", label: "Código" },
            { key: "origin", label: "Proveniência" },
            { key: "company", label: "Companhia" },
            { key: "post_name", label: "Posto" },
            { key: "is_active", label: "Estado" }
        ],
        fields: [
            {
                name: "post_id",
                label: "Posto",
                type: "select",
                required: true,
                options: []
            },
            {
                name: "code",
                label: "Código",
                type: "text",
                required: true,
                placeholder: "Ex.: TP123, DT510, CRZ001"
            },
            {
                name: "origin",
                label: "Proveniência",
                type: "text",
                required: true,
                placeholder: "Ex.: LISBOA, LUANDA, MALABO"
            },
            {
                name: "company",
                label: "Companhia",
                type: "text",
                required: true,
                placeholder: "Ex.: TAP, TAG, ASKY"
            }
        ]
    },
    countries: {
        entity: "countries",
        title: "Países",
        singular: "País",
        description:
            "Países e códigos ICAO usados na leitura MRZ.",
        columns: [
            { key: "designation", label: "Designação" },
            { key: "icao_code", label: "ICAO" },
            { key: "is_active", label: "Estado" }
        ],
        fields: [
            {
                name: "designation",
                label: "Designação",
                type: "text",
                required: true
            },
            {
                name: "icao_code",
                label: "Código ICAO",
                type: "text",
                required: true,
                placeholder: "STP"
            }
        ]
    },
    "visit-reasons": {
        entity: "visit-reasons",
        title: "Motivos da viagem",
        singular: "Motivo",
        description:
            "Motivos disponíveis no registo do visitante.",
        columns: [
            { key: "code", label: "Código" },
            { key: "description", label: "Descrição" },
            { key: "is_active", label: "Estado" }
        ],
        fields: [
            {
                name: "code",
                label: "Código",
                type: "text",
                required: true
            },
            {
                name: "description",
                label: "Descrição",
                type: "text",
                required: true
            }
        ]
    },
    taxes: {
        entity: "taxes",
        title: "Taxas",
        singular: "Taxa",
        description:
            "Valores por forma de pagamento, moeda e localização.",
        columns: [
            { key: "payment_type", label: "Pagamento" },
            { key: "currency", label: "Moeda" },
            { key: "location", label: "Localização" },
            { key: "amount", label: "Valor" },
            { key: "is_active", label: "Estado" }
        ],
        fields: [
            {
                name: "payment_type",
                label: "Forma de pagamento",
                type: "text",
                required: true
            },
            {
                name: "currency",
                label: "Moeda",
                type: "select",
                required: true,
                options: [
                    { value: "DOBRA", label: "Dobra" },
                    { value: "EURO", label: "Euro" },
                    { value: "DOLAR", label: "Dólar" },
                    { value: "ISENTO", label: "Isento" }
                ]
            },
            {
                name: "location",
                label: "Localização",
                type: "select",
                required: true,
                options: [
                    { value: "GLOBAL", label: "Global — todas as localizações" },
                    { value: "SÃO TOMÉ", label: "São Tomé" },
                    { value: "PRÍNCIPE", label: "Príncipe" }
                ]
            },
            {
                name: "amount",
                label: "Valor",
                type: "number",
                required: true
            }
        ]
    },
    settings: {
        entity: "settings",
        title: "Definições",
        singular: "Definição",
        description:
            "Parâmetros globais descarregados pelos dispositivos.",
        columns: [
            { key: "setting_key", label: "Chave" },
            { key: "setting_value", label: "Valor" },
            {
                key: "is_downloadable",
                label: "Descarregável"
            },
            { key: "updated_at", label: "Atualização" }
        ],
        fields: [
            {
                name: "setting_key",
                label: "Chave",
                type: "text",
                required: true
            },
            {
                name: "setting_value",
                label: "Valor",
                type: "textarea"
            },
            {
                name: "is_downloadable",
                label: "Descarregável",
                type: "boolean"
            }
        ]
    }
};
