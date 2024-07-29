require('dotenv').config();

// Initialize AWS S3
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
const s3 = new aws.S3();

const upload = () => {
    // Configure Multer for file upload to S3
    return multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.S3_BUCKET_NAME,
            acl: 'public-read',
            key: function (req, file, cb) {
                cb(null, Date.now().toString() + '-' + file.originalname);
            },
        }),
    });
}

export default upload