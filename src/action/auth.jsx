"use server";

import axios from "axios";
import { cookies } from "next/headers";

export async function loginAction(data) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
      {
        email: data?.email,
        password: data?.password,
      }
    );

    if (response?.data?.token) {
      cookies().set("access_token", response?.data?.token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, 
        path: "/", 
        sameSite: "strict", 
      });

      return {
        success: true,
        data: response.data,
      };
    }
  } catch (error) {
    return {
      error: error.response?.data?.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
    };
  }
}

// async function refreshAccessToken(refreshToken) {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ refresh_token: refreshToken }),
//       }
//     );
//     const respData = await response.json();
//     return respData?.data?.access_token;
//   } catch (error) {
//     console.error("Refresh token failed:", error);
//     return null;
//   }
// }

export async function validateJWT(token) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/validate`,
      {
        
      },
      { headers: { "x-auth-token": token } }
    );
    // console.log(response?.data?.data)
    return response?.data?.data;
  } catch (error) {
    console.error("JWT validation failed:", error?.response?.data?.error);
    return false;
  }
}

export async function logoutAction() {
  cookies().delete("access_token");
}