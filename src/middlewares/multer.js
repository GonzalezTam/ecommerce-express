import multer from 'multer';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import log from '../utils/logger/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configureMulter = (destinationPath) => {
  try {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'public', destinationPath);
        // create destination folder if it doesn't exist
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${req.user._id}-${file.fieldname}-${Date.now()}${ext}`;
        cb(null, filename);
      }
    });
    const upload = multer({ storage });
    return upload;
  } catch (error) {
    log.error('[configureMulter] ' + error.message);
  }
};

export default configureMulter;
