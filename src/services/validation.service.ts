import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ValidationService {

    /**
     * Validates form values based on schema fields
     */
    validate(fields: any[], values: any): Record<string, string> {
        const errors: Record<string, string> = {};

        if (!fields || !values) {
            return errors;
        }

        for (const field of fields) {
            const value = values[field.key];

            // ===============================
            // REQUIRED VALIDATION
            // ===============================
            if (field.required) {

                // ✅ MULTISELECT (array required)
                if (field.type === 'multiselect') {
                    if (!Array.isArray(value) || value.length === 0) {
                        errors[field.key] = `${field.label} is required`;
                    }
                }

                // ✅ CHECKBOX (must be true)
                else if (field.type === 'checkbox') {
                    if (value !== true) {
                        errors[field.key] = `${field.label} is required`;
                    }
                }

                // ✅ ALL OTHER TYPES
                else {
                    if (
                        value === undefined ||
                        value === null ||
                        value === ''
                    ) {
                        errors[field.key] = `${field.label} is required`;
                    }
                }
            }
        }

        return errors;
    }
}
