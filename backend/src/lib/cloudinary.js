import { v2 as cloudinary } from "cloudinary"
import { config } from "dotenv"

config()

cloudinary.config({
    cloud_name: process.env.CLOUDIARY_CLOUD_NAME,
    cloud_api_key: process.env.CLOUDIARY_API_KEY,
    cloud_api_secret: process.env.CLOUDIARY_API_SECRET,
})

export default cloudinary;