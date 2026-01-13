import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';

// Lưu file trong memory
const storage = multer.memoryStorage();

// Validate file type
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'));
    }
};

// Multer instance cho avatar
export const uploadAvatar = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// Multer instance cho event image
export const uploadEventImage = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter
});

// Helper function upload lên Cloudinary
export const uploadToCloudinary = async (
    fileBuffer: Buffer,
    folder: string,
    transformation?: any[]
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                transformation: transformation,
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result!.secure_url);
                }
            }
        );
        
        uploadStream.end(fileBuffer);
    });
};
