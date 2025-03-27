"use server";
import React from "react";
import LoginForm from "./loginForm";
import { headers } from "next/headers";

const LoginPage = async () => {
  const headersList = headers();
  const userAccessToken = JSON.parse(headersList.get("user_access_token"));

  return (
    <>
      <LoginForm userAccessToken={userAccessToken} />
    </>
  );
};

export default LoginPage;
