export const ROLES = Object.freeze({
    ADMIN: 0,
    CLIENT: 1
});

export const VALIDATOR_TYPES = Object.freeze({
    INTEGER: 'integer',
    FLOAT:   'float',
    STRING:  'string',
    BOOLEAN: 'boolean',
});


export const MIME_TYPES = Object.freeze({
    JPEG: 'image/jpeg',
    PNG:  'image/png',
    AVIF: 'image/avif',
    WEBP: 'image/webp',
});

export const UPLOAD_LIMIT = Object.freeze({
    fieldNameSize:  100,      // Max field name size in bytes (default: 100)
    fieldSize:      1048576,  // Max field value size in bytes (default: 1MB)
    fields:         Infinity, // Max number of non-file fields (default: Infinity)
    fileSize:       Infinity, // Max file size in bytes (default: Infinity)
    files:          1, // Max number of file fields (default: Infinity)
    parts:          Infinity, // Max number of parts, fields + files (default: Infinity)
    headerPairs:    2000,     // Max number of header key-value pairs (default: 2000)
});

export const UPLOAD_ALLOWED_TYPES = [MIME_TYPES.JPEG, MIME_TYPES.PNG, MIME_TYPES.WEBP, MIME_TYPES.AVIF];

export const JWT_COOKIE_PARAMS = Object.freeze({
    name: 'token',
    expire:  15
});