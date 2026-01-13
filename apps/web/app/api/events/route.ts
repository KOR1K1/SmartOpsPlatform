import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth-cookies";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * API route to proxy events requests from Client Components
 * This allows us to use httpOnly cookies securely
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from httpOnly cookies
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters from request
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";
    const q = searchParams.get("q");
    const type = searchParams.get("type");

    // Build query string for backend API
    const params = new URLSearchParams({
      limit,
      offset,
    });

    if (q) {
      params.append("q", q);
    }

    if (type) {
      params.append("type", type);
    }

    // Make request to backend API
    const apiUrl = env.apiUrl;
    const response = await fetch(`${apiUrl}/events/tasks?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error("Error proxying events request", error, "EventsAPI");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
