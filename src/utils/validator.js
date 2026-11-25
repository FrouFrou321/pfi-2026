import { VALIDATOR_TYPES } from '#configs/index.js';

const isEmpty = (value) => value === undefined || value === null || value === '';

const Validator = {
    validate: (data, schema) => {
        const errors = {};

        for (const [field, rules] of Object.entries(schema)) {
            const value = data?.[field];

            if (rules.required && isEmpty(value)) {
                errors[field] = 'required';
                continue;
            }

            if (isEmpty(value)) continue;

            if (rules.type === VALIDATOR_TYPES.STRING && typeof value !== 'string') {
                errors[field] = 'invalid_type';
                continue;
            }

            if (rules.type === VALIDATOR_TYPES.NUMBER) {
                const num = typeof value === 'number' ? value : Number(value);
                if (!Number.isFinite(num)) {
                    errors[field] = 'invalid_type';
                    continue;
                }
                if (rules.min !== undefined && num < rules.min) {
                    errors[field] = 'min';
                }
                data[field] = num;
                continue;
            }

            if (rules.type === VALIDATOR_TYPES.INTEGER) {
                const num = typeof value === 'number' ? value : Number(value);
                if (!Number.isInteger(num)) {
                    errors[field] = 'invalid_type';
                    continue;
                }
                if (rules.min !== undefined && num < rules.min) {
                    errors[field] = 'min';
                }
                data[field] = num;
                continue;
            }

            if (rules.min !== undefined && typeof value === 'string' && value.length < rules.min) {
                errors[field] = 'min';
            }
        }

        return errors;
    }
};

export default Validator;
