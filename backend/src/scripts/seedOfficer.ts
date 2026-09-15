import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../prisma/db.js";

async function main() {
  const email = process.env.OFFICER_EMAIL ?? process.argv[2] ?? "officer@agribharat.gov.in";
  const password = process.env.OFFICER_PASSWORD ?? process.argv[3] ?? "OfficerSecure2026!";
  const name = process.env.OFFICER_NAME ?? process.argv[4] ?? "Agriculture Officer";
  const role = (process.env.OFFICER_ROLE ?? process.argv[5] ?? "OFFICER").toUpperCase();

  console.log(`[Seed] Provisioning account for ${email} with role ${role}...`);

  const existing = await db.orm.public.User.where({ email }).first();

  if (existing) {
    if (existing.role !== role) {
      await db.orm.public.User.where({ id: existing.id }).update({ role });
      console.log(`[Seed] User ${email} already existed. Role updated to ${role}.`);
    } else {
      console.log(`[Seed] User ${email} already exists with role ${role}.`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await db.orm.public.User.create({
    email,
    passwordHash,
    name,
    role,
  });

  console.log(`[Seed] Successfully created ${role} account (ID: ${created.id}, Email: ${created.email})`);
}

main()
  .catch((err) => {
    console.error("[Seed] Failed to seed officer account:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
