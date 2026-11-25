export const ROLES = Object.freeze({
    ADMIN: 0,
    CLIENT: 1
});

export const VALIDATOR_TYPES = Object.freeze({
    STRING: 'string',
    NUMBER: 'number',
    INTEGER: 'integer'
});

export const FOLDERS = Object.freeze({
    TMP: './tmp',
    PUBLIC: './public'
});

export const UPLOAD_LIMIT = 5 * 1024 * 1024;

export const UPLOAD_ALLOWED_TYPES = Object.freeze([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
]);