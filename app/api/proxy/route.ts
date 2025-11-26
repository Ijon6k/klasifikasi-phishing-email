import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetUrl, text } = body;

    if (!targetUrl || !text) {
      return NextResponse.json(
        { error: "Target URL dan Text diperlukan" },
        { status: 400 }
      );
    }

    // Server-side fetch (Tidak terkena CORS browser)
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // Header penting untuk ngrok free
        "User-Agent": "PhishGuard-Client",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghubungi API via Proxy" },
      { status: 500 }
    );
  }
}
