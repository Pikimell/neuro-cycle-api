import type { UserDocument } from "../../database/models/user.js";
import type { RequestAuth } from "../../helpers/auth.js";

declare global {
  namespace Express {
    interface Request {
      auth?: RequestAuth;
      user?: UserDocument;
      typeAccount?: string | null;
    }
  }
}

export {};
