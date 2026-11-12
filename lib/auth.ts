import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nihalxofficial";
const client = new MongoClient(mongoUri);
const dbName =
  process.env.MONGODB_DATABASE || process.env.DATABASE || "nihalxofficial";
const db = client.db(dbName);

const adminEmails = (
  process.env.ADMIN_EMAILS ||
  process.env.ADMIN_EMAIL ||
  "mdnihaluddinbijoy@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Sessions are signed with this value. It must come from the environment: a
 * repository default would be public knowledge and would silently be used by
 * any deployment that forgot to set the variable.
 */
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Add it to portfolio/.env.local (and to the web container environment) — dashboard sessions cannot be signed or verified without it.",
  );
}

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000",
  secret,
  database: mongodbAdapter(db, {
    client,
  }),
  plugins: [jwt()],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = (user.email || "").toLowerCase();
          const isAdmin = adminEmails.includes(email);
          return {
            data: {
              ...user,
              role: isAdmin ? "admin" : user.role || "user",
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      role: {
        type: "string",
        input: false,
        defaultValue: "user",
      },
      roles: {
        type: "string[]",
        input: false,
        defaultValue: ["user"],
      },
      activeRole: {
        type: "string",
        input: false,
        defaultValue: "user",
      },
    },
  },
});

