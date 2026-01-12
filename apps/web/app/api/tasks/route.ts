import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const apiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://api:4000";

    console.log("[API /tasks] Forwarding to backend:", {
      apiUrl,
      hasToken: !!accessToken,
    });

    const apiResponse = await fetch(`${apiUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const text = await apiResponse.text();

    if (!apiResponse.ok) {
      console.error("[API /tasks] Backend error:", {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        text,
      });
      return NextResponse.json(
        {
          error:
            text ||
            `Backend error: ${apiResponse.status} ${apiResponse.statusText}`,
        },
        { status: apiResponse.status || 500 }
      );
    }

    let result: unknown = {};
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = {};
    }

    console.log("[API /tasks] Backend created task:", result);

    // Revalidate dashboard cache to show new task
    revalidatePath("/dashboard");

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /tasks] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create task" },
      { status: 500 }
    );
  }
}
