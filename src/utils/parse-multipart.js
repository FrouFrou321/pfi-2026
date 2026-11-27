import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

import busboy from "busboy";
import { fileTypeFromBuffer } from 'file-type';

import ErrorTypes from "#utils/error-types.js";
import FileManager from '#utils/file-manager.js'; // sanitizeFilename

const parseMultipart = async (req, res, limits, allowedTypes, tempFolder) => {

    return new Promise((resolve, reject) => {

        try {

            const fields = {};
            const files = {};
            const pendingFiles = [];

            const bb = busboy({ 
                headers: req.headers,
                limits: limits
            });

            // Handle text fields
            bb.on('field', (name, value) => {
                fields[name] = value;
            });

            // Handle files (collect raw data safely without throwing prematurely)
            bb.on('file', (name, file, info) => {
                
                const chunks = [];
                let isTooLarge = false;
    
                file.on('data', chunk => {
                    if (!isTooLarge) {
                        chunks.push(chunk);
                    }
                });
                
                file.on('limit', () => {
                    isTooLarge = true;
                    file.resume(); // Drain remaining stream
                });

                // Store file metadata and buffer getter for processing on 'finish'
                pendingFiles.push({
                    fieldName: name,
                    info,
                    getBuffer: () => Buffer.concat(chunks),
                    checkTooLarge: () => isTooLarge
                });

            });        

            // Process all files and validate once the entire multipart stream finishes
            bb.on('finish', async () => {

                try {

                    const filePromises = pendingFiles.map(async (fileObj) => {
                        
                        // 1. Check size limit error
                        if (fileObj.checkTooLarge()) {
                            throw new ErrorTypes.FileSizeError(`File [${fileObj.fieldName}] too large`);
                        }

                        const buffer = fileObj.getBuffer();

                        // 2. Read true MIME type from buffer (do not trust browser header)
                        const realType = await fileTypeFromBuffer(buffer);

                        if (!realType || !allowedTypes.includes(realType.mime)) {
                            throw new ErrorTypes.MimeTypeError(`File [${fileObj.fieldName}] mime type not allowed`);
                        }

                        // 3. Save to disk with secure random filename
                        const safeExt = `.${realType.ext}`;    
                        const tempFilename = `${crypto.randomUUID()}${safeExt}`;
                        const tempPath = path.join(tempFolder, tempFilename);

                        await fs.promises.writeFile(tempPath, buffer);

                        const safeOriginalFilename = FileManager.sanitizeFilename(fileObj.info.filename);
                        
                        return {
                            fieldName:     fileObj.fieldName,
                            filename:      safeOriginalFilename,
                            tempFilename:  tempFilename,
                            tempPath:      tempPath,
                            mimeType:      realType.mime,
                            fileSize:      buffer.length,
                        };

                    });

                    // Wait for all validations and writes to complete
                    const resolvedFiles = await Promise.all(filePromises);

                    resolvedFiles.forEach(file => {
                        files[file.fieldName] = file;
                    });

                    res.locals.body = fields;
                    res.locals.files = files;

                    resolve(fields, files);

                } catch (err) {
                    // All errors (MimeTypeError, FileSizeError, FS errors) safely caught here and bubbled up
                    reject(err);
                }
                
            });

            bb.on('error', (err) => reject(err));

            req.pipe(bb);

        } catch (err) {
            return reject(err);
        }  
    });
};

export default parseMultipart;