export interface TemplateSchemaField {
    key: string;
    label: string;
    type: string;
    required?: boolean;
}

export interface TemplateSchema {
    fields: TemplateSchemaField[];
}

export interface TemplateModel {
    id: string;
    name: string;
    body: string;
    schema: { fields: any[] };
    formValues?: any;
    attachments?: string[];   // <-- store uploaded file names or URLs
    published?: boolean;
}
