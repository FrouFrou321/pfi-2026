import fs from 'node:fs/promises';
import path from 'node:path';

const FileManager = {
sanitizeFilename : (filename) => {

        // 1. Get name and extension separately
        let ext = extname(filename).toLowerCase();       // ".jpg"
        let name = basename(filename, ext);                // "my file"

        // --- EXTENSION SANITIZATION ---
        // Remove null bytes, spaces, and any character that isn't a letter, number, or dot
        ext = ext.replace(/\0/g, '');
        ext = ext.replace(/[^a-z0-9.]/g, '');
        
        // Collapse multiple dots and trim length
        ext = ext.replace(/\.{2,}/g, '.');
        ext = ext.substring(0, 10); // Extensions are rarely longer than 10 chars

        // 2. Strip path traversal characters
        name = name.replace(/[/\\]/g, '');

        // 3. Remove null bytes
        name = name.replace(/\0/g, '');

        // 4. Replace anything that's not alphanumeric, dash, underscore, dot, space
        name = name.replace(/[^a-zA-Z0-9\-_ .]/g, '');

        // 5. Collapse multiple spaces/dots/dashes
        name = name.replace(/\s+/g, ' ').trim();
        name = name.replace(/\.{2,}/g, '.');

        // 6. Prevent hidden files (leading dot)
        name = name.replace(/^\.+/, '');

        // 7. Truncate to a sane length
        name = name.substring(0, 100);

        // 8. Fallback if name is empty after sanitization
        if (!name) {
            name = 'unnamed';
        }

        return `${name}${ext}`;
    },

    move: async (srcFolder, srcName, destFolder, destName) => {
        await fs.mkdir(destFolder, { recursive: true });
        const srcPath = path.join(srcFolder, srcName);
        const destPath = path.join(destFolder, destName);
        try {
            await fs.rename(srcPath, destPath);
        } catch (err) {
            if (err.code === 'EXDEV') {
                await fs.copyFile(srcPath, destPath);
                await fs.unlink(srcPath);
            } else {
                throw err;
            }
        }
    },

    deleteRequestTempFiles: async (folder, files) => {
        if (!files || typeof files !== 'object') return;
        await Promise.all(Object.values(files).map(async (file) => {
            const name = file?.tempFilename ?? file?.filename;
            if (!name) return;
            try {
                await fs.unlink(path.join(folder, name));
            } catch (err) {
                if (err.code !== 'ENOENT') throw err;
            }
        }));
    }
};

export default FileManager;
