import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminFirestore } from "@/firebase/adminConfig";

function isValidUserRole(role: string): boolean {
  return role === "admin" || role === "user";
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const userId = params?.id;

    try {
      await adminAuth.deleteUser(userId);
    } catch (authError: unknown) {
      if (
        !(
          typeof authError === "object" &&
          authError !== null &&
          "code" in authError &&
          (authError as { code?: string }).code === "auth/user-not-found"
        )
      ) {
        throw authError;
      }
    }

    await adminFirestore.collection("users").doc(userId).delete();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);

    let message = "Failed to delete user";
    let code = undefined;
    if (typeof error === "object" && error !== null && "message" in error) {
      message = (error as { message?: string }).message || message;
      code = (error as { code?: string }).code;
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        code: code,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const userId = params?.id;

    const body = await req.json();

    if (body.role && !isValidUserRole(body.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user role. Must be 'admin' or 'user'",
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, string | undefined> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.role) updateData.role = body.role;
    if (body.username) updateData.username = body.username;
    if (body.email) updateData.email = body.email;
    if (body.avatar) updateData.avatar = body.avatar;

    await adminFirestore.collection("users").doc(userId).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error updating user:", error);

    let message = "Failed to update user";
    let code = undefined;
    if (typeof error === "object" && error !== null && "message" in error) {
      message = (error as { message?: string }).message || message;
      code = (error as { code?: string }).code;
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        code: code,
      },
      { status: 500 }
    );
  }
}
