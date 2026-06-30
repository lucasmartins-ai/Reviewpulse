import { NextResponse } from "next/server";
import type { ApiEnvelope, ApiFailure, ApiSuccess } from "@/types/domain";

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  const body: ApiSuccess<T> = {
    success: true,
    data
  };
  return NextResponse.json(body, init);
}

export function apiFailure(code: string, message: string, status = 400) {
  const body: ApiFailure = {
    success: false,
    error: {
      code,
      message
    }
  };
  return NextResponse.json(body, { status });
}

export function toApiEnvelope<T>(data: T): ApiEnvelope<T> {
  return {
    success: true,
    data
  };
}
