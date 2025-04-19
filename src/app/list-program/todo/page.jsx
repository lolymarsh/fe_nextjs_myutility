"use server"
import React from 'react'
import TodoList from './todo_list'
import { headers } from 'next/headers';

const TodoPage = () => {
  const headersList = headers();
  const user_data = headersList.get("user_data")
  const userData = JSON.parse(user_data) || {}
  const access_token = headersList.get("user_access_token")
  
  return (
    <>
      <TodoList userData={userData} accessToken={access_token} />
    </>
  )
}

export default TodoPage