import { NextRequest, NextResponse } from "next/server";

const ZAMA_GATEWAY_URL = "https://gateway.sepolia.zama.ai";

/**
 * FHEVM Gateway Proxy
 *
 * This API route proxies requests to Zama's FHEVM gateway to avoid CORS issues.
 * The fhevmjs library will send encryption requests to this endpoint,
 * which forwards them to the actual Zama gateway.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.text();

    // Get headers from original request
    const headers = new Headers();
    headers.set("Content-Type", request.headers.get("content-type") || "application/json");

    // Forward the request to Zama gateway
    const response = await fetch(ZAMA_GATEWAY_URL, {
      method: "POST",
      headers,
      body,
    });

    // Get response data
    const data = await response.text();

    // Return the response with appropriate headers
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("FHEVM proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request to FHEVM gateway" },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
