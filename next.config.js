/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["lh3.googleusercontent.com", "syiblhavitrbblqvhige.supabase.co"],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  },
};

export default config;
