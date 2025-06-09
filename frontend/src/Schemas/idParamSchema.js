import { z } from "zod";

const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id format"),
});

export default idParamSchema;
