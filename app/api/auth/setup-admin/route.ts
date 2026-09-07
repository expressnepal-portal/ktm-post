import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check how many users exist in the database
    const userCount = await prisma.user.count();

    // If users already exist, lock and disable public registration!
    if (userCount > 0) {
      return NextResponse.json(
        {
          error:
            "Public registration is closed. The main administrator must invite or create your account from the dashboard.",
        },
        { status: 403 }
      );
    }

    // First user setup: Register and grant "admin" role
    const response = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (response?.user?.id) {
      // Elevate first registered user to admin role
      await prisma.user.update({
        where: { id: response.user.id },
        data: { role: "admin" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("First admin setup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create first admin" },
      { status: 500 }
    );
  }
}
