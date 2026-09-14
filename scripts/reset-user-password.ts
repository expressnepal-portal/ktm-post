import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const newPassword = process.argv[3]?.trim();

  if (!email || !newPassword) {
    console.log("Usage: npx tsx scripts/reset-user-password.ts <email> <newPassword>");
    console.log("Example: npx tsx scripts/reset-user-password.ts dalahmahesh@gmail.com MyNewPass123");
    process.exit(1);
  }

  console.log(`Checking user with email: ${email}...`);

  let user = await prisma.user.findUnique({
    where: { email },
  });

  const hashedPassword = await hashPassword(newPassword);

  if (!user) {
    console.log(`User ${email} does not exist. Creating new admin user...`);
    user = await prisma.user.create({
      data: {
        name: email.split("@")[0] || "Admin",
        email,
        emailVerified: true,
        role: "admin",
      },
    });
    console.log(`User record created with ID: ${user.id}`);
  } else {
    // Ensure user has admin role and is verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "admin",
        emailVerified: true,
        banned: false,
      },
    });
    console.log(`Found existing user: ${user.name} (${user.id}). Role updated to admin.`);
  }

  const existingAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: "credential",
    },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
    console.log("Updated password in existing credential account.");
  } else {
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashedPassword,
      },
    });
    console.log("Created new credential account with password hash.");
  }

  // Clear existing sessions
  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  console.log(`\n✅ Password successfully updated for: ${email}`);
  console.log(`You can now sign in at: /admin/login with your new password!`);
}

main()
  .catch((e) => {
    console.error("Error setting password:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
