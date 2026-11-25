/* Custom error types */

export const ErrorTypes = {

    // Database

    DatabaseError : class extends Error {
        constructor(msg) { super(msg); this.name = 'DatabaseError'; }
    },

    DuplicateEntryError : class extends Error {
        constructor(msg) { super(msg); this.name = 'DuplicateEntryError'; }
    },

    MimeTypeError : class extends Error {
        constructor(msg) { super(msg); this.name = 'MimeTypeError'; }
    },

    FileSizeError : class extends Error {
        constructor(msg) { super(msg); this.name = 'FileSizeError'; }
    },
};

export default ErrorTypes;