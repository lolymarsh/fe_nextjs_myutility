"use server"
import React from 'react'
import UserList from './userList'
import { headers } from 'next/headers';

const ListUserPage = () => {
    const headersList = headers();
      const user_data = headersList.get("user_data")
      const userData = JSON.parse(user_data) || {}
      const access_token = headersList.get("user_access_token")

  return (
    <>
      <UserList userData={userData} accessToken={access_token} />
    </>
  )
}

export default ListUserPage
