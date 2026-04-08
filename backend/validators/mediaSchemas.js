const { z } = require('zod');

const uploadMediaSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(3).max(120),
  contentBase64: z.string().min(1),
});

const mediaIdParamSchema = z.object({
  id: z.string().trim().min(24).max(24),
});

module.exports = {
  uploadMediaSchema,
  mediaIdParamSchema,
};
