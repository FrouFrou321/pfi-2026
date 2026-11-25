import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { ErrorTypes } from '#utils/error-types.js';

const parseMultipart = async (req, res, uploadLimit, allowedTypes, tmpFolder) => {
    const contentType = req.headers['content-type'] ?? '';
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/i);
    if (!boundaryMatch) {
        res.locals.body = {};
        res.locals.files = {};
        return;
    }

    const boundary = boundaryMatch[1] ?? boundaryMatch[2];
    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
        total += chunk.length;
        if (total > uploadLimit) {
            throw new ErrorTypes.FileSizeError('Content Too Large');
        }
        chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const delimiter = Buffer.from(`--${boundary}`);
    const body = {};
    const files = {};

    await fs.mkdir(tmpFolder, { recursive: true });

    let start = buffer.indexOf(delimiter);
    while (start !== -1) {
        start += delimiter.length;
        if (buffer[start] === 45 && buffer[start + 1] === 45) break; // --
        if (buffer[start] === 13 && buffer[start + 1] === 10) start += 2;

        const next = buffer.indexOf(delimiter, start);
        if (next === -1) break;
        let part = buffer.slice(start, next);
        if (part.length >= 2 && part[part.length - 2] === 13 && part[part.length - 1] === 10) {
            part = part.slice(0, -2);
        }

        const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
        if (headerEnd !== -1) {
            const headerText = part.slice(0, headerEnd).toString('utf8');
            let content = part.slice(headerEnd + 4);
            const nameMatch = headerText.match(/name="([^"]+)"/i);
            const filenameMatch = headerText.match(/filename="([^"]*)"/i);
            const contentTypeMatch = headerText.match(/content-type:\s*([^\r\n]+)/i);
            const fieldName = nameMatch?.[1];

            if (fieldName) {
                if (filenameMatch && filenameMatch[1] !== '') {
                    const originalName = path.basename(filenameMatch[1]);
                    const mimeType = (contentTypeMatch?.[1] ?? '').trim().toLowerCase();
                    if (Array.isArray(allowedTypes) && allowedTypes.length > 0 && !allowedTypes.includes(mimeType)) {
                        throw new ErrorTypes.MimeTypeError('Unsupported Media Type');
                    }
                    const ext = path.extname(originalName) || '';
                    const tempFilename = `${crypto.randomUUID()}${ext}`;
                    await fs.writeFile(path.join(tmpFolder, tempFilename), content);
                    files[fieldName] = {
                        filename: originalName,
                        tempFilename,
                        mimeType,
                        size: content.length
                    };
                } else {
                    body[fieldName] = content.toString('utf8');
                }
            }
        }

        start = next;
    }

    res.locals.body = body;
    res.locals.files = files;
};
export default parseMultipart;
