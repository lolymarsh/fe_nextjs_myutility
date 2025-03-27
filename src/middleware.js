import { NextResponse } from "next/server";

const optionalAuthPaths = ["/", "/login", "/register"];

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

async function validateJWT(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/validate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token }),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("JWT validation failed:", error);
    return false;
  }
}

export async function middleware(request) {
  const accessToken = request.cookies.get("access_token")?.value;
  //   const refreshToken = request.cookies.get("refresh_token")?.value; // ถ้ามีระบบ refresh token
  const pathname = request.nextUrl.pathname;
  let newAccessToken = accessToken;

  const isOptionalAuth = optionalAuthPaths.includes(pathname);

  //   หากมีระบบ refresh token ใช้เงื่อนไขนี้
  //   if (!accessToken && refreshToken) {
  //     newAccessToken = await refreshAccessToken(refreshToken);
  //   }

  const response = NextResponse.next();

  const isValidToken = newAccessToken && (await validateJWT(newAccessToken));

  if (isValidToken) {
    response.cookies.set("access_token", newAccessToken, { httpOnly: true });
    response.headers.set("user_data", JSON.stringify(isValidToken.data));
    response.headers.set("user_access_token", newAccessToken);
  }

  if (!accessToken && !isOptionalAuth && !isValidToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
