import fs from 'node:fs/promises';
import path from 'node:path';

const FileManager = {
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
