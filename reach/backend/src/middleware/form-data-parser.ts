import multer from 'multer';

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

export const documentUpload = upload.fields([{ name: 'file', maxCount: 1 }]);

export const logoUpload = upload.fields([{ name: 'logo', maxCount: 1 }]);
