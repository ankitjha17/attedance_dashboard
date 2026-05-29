import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Initialize Redis if env vars exist
const getRedisClient = () => {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (url && token) {
    return new Redis({
      url: url,
      token: token,
    });
  }
  return null;
};

export async function GET() {
  try {
    const redis = getRedisClient();
    
    if (!redis) {
      return NextResponse.json({ 
        error: "Redis not configured. Please link Upstash Redis in Vercel.",
        students: [],
        attendance: []
      }, { status: 200 }); // Return 200 so UI doesn't crash, just uses local
    }

    const students = await redis.get("dashboard:students") || [];
    const attendance = await redis.get("dashboard:attendance") || [];

    return NextResponse.json({ students, attendance });
  } catch (error) {
    console.error("Redis GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const redis = getRedisClient();
    
    if (!redis) {
      return NextResponse.json({ 
        success: false, 
        message: "Redis not configured" 
      }, { status: 200 });
    }

    const data = await request.json();
    const { students, attendance } = data;

    if (students) {
      await redis.set("dashboard:students", JSON.stringify(students));
    }
    
    if (attendance) {
      await redis.set("dashboard:attendance", JSON.stringify(attendance));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Redis POST Error:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
