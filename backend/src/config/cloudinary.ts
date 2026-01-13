import { v2 as cloudinary } from "cloudinary";

// CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

const url = process.env.CLOUDINARY_URL;

if (!url) {
    // \x1b[33m = yellow
    console.warn(
        "\x1b[33mCLOUDINARY_URL not set. Expected: CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name\x1b[0m"
    );
} else {
    // Cloudinary SDK reads CLOUDINARY_URL when config() is called
    cloudinary.config();

    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);

    if (match) {
        // \x1b[32m = green
        console.log("\x1b[32mCloudinary configured from CLOUDINARY_URL\x1b[0m");
    } else {
        console.warn(
            "\x1b[33mCLOUDINARY_URL has invalid format. Expected: cloudinary://api_key:api_secret@cloud_name\x1b[0m"
        );
    }
}

export default cloudinary;
