import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { uploadToCloudinary } from '../config/cloudinary';

const router = Router();

/**
 * POST /api/upload/logo
 * Upload business logo to Cloudinary
 * Protected route - requires authentication
 */
router.post('/logo', authenticate, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Validate base64 image format
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Upload to Cloudinary with optimization
    const result = await uploadToCloudinary(image, 'business-logos');

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Logo uploaded successfully',
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({
      error: 'Failed to upload logo',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
