const { z } = require("zod");

const emailSuscriptionSchema = z.object({
  email: z.string(),
});

module.exports = {
    emailSuscriptionSchema
}