
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const eventDate = request.nextUrl.searchParams.get("eventDate");

  if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return NextResponse.json(
      { error: "A valid eventDate is required (YYYY-MM-DD)." },
      { status: 400 }
    );
  }

  const apiUrl = process.env.AWS_EVENTS_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { error: "AWS_EVENTS_API_URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const upstreamUrl = new URL(apiUrl);
    upstreamUrl.searchParams.set("eventDate", eventDate);

    const response = await fetch(upstreamUrl.toString(), {
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch AWS events:", error);

    return NextResponse.json(
      { error: "Unable to fetch events from AWS." },
      { status: 502 }
    );
  }
}
