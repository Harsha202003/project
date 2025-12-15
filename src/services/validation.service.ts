import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ValidationService {

    validate(fields: any[], values: any): Record<string, string> {
        const errors: Record<string, string> = {};

        for (const field of fields) {
            const rawValue = values[field.key];
            const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

            // ✅ REQUIRED CHECK
            if (field.required && (!value && value !== 0)) {
                errors[field.key] = `${field.label} is required`;
                continue;
            }

            // ✅ NUMBER CHECK
            if (field.type === 'number' && value !== undefined && value !== '') {
                if (isNaN(value)) {
                    errors[field.key] = `${field.label} must be a number`;
                }
            }

            // ✅ DATE CHECK
            if (field.type === 'date' && value) {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    errors[field.key] = `${field.label} must be a valid date`;
                }
            }

            // ✅ MULTIPLE CHECK
            if (field.type === 'multiselect' && value) {
                if (!Array.isArray(value) || value.length === 0) {
                    errors[field.key] = `${field.label} must be a valid selection`;
                }
            }

            // ✅ CHECKBOX CHECK
            if (field.type === 'checkbox' && value) {
                if (typeof value !== 'boolean') {
                    errors[field.key] = `${field.label} must be a boolean`;
                }
            }

            // ✅ TEXT CHECK
            if (field.type === 'text' && value) {
                if (typeof value !== 'string') {
                    errors[field.key] = `${field.label} must be a string`;
                }
            }

            // ✅ TEXTAREA CHECK
            if (field.type === 'textarea' && value) {
                if (typeof value !== 'string') {
                    errors[field.key] = `${field.label} must be a string`;
                }
            }
        }

        return errors; // 🔥 only current errors
    }
}

