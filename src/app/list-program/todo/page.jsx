"use server"
import React from 'react'
import TodoList from './todo_list'
import { headers } from 'next/headers';

const TodoPage = () => {
  const headersList = headers();
  const user_data = headersList.get("user_data")
  const access_token = headersList.get("user_access_token")
  
  return (
    <>
      <TodoList userData={user_data} accessToken={access_token} />
    </>
  )
}

export default TodoPage