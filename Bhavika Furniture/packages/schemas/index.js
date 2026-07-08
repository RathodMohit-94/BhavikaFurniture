const { z } = require('zod');

const AdminSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
});

const DynamicEntitySchema = z.object({
  name: z.string(),
  fields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean()
  }))
});

module.exports = {
  AdminSchema,
  DynamicEntitySchema
};
