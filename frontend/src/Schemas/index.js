import userSchemas from "./userSchemas";
import contentSchemas from "./contentSchemas";
import tripSchemas from "./tripSchemas";
import systemSchemas from "./systemSchemas";

export default {
  ...userSchemas,
  ...contentSchemas,
  ...tripSchemas,
  ...systemSchemas,
};
