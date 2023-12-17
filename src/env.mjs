import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    EMAIL_ADDR: z.string().email(),
    EMAIL_PASS: z.string(),
    SHEETS_CLIENT_EMAIL: z.string(),
    EMAIL_PRIVATE_KEY: z.string(),
    TEST_SPREADSHEET_ID: z.string(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    //NEXT_PUBLIC_EVENT_PASS: z.string()
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    EMAIL_ADDR: process.env.EMAIL_ADDR,
    EMAIL_PASS: process.env.EMAIL_PASS,
    SHEETS_CLIENT_EMAIL: process.env.SHEETS_CLIENT_EMAIL,
    EMAIL_PRIVATE_KEY: process.env.EMAIL_PRIVATE_KEY,
    TEST_SPREADSHEET_ID: process.env.TEST_SPREADSHEET_ID,
    //NEXT_PUBLIC_EVENT_PASS: process.env.NEXT_PUBLIC_EVENT_PASS,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
