
"use server"
import React from 'react'
import { headers } from 'next/headers';
import DiscordWebHookList from './discord_webhook_list';

const DiscordWebHookPage = () => {
  const headersList = headers();
  const user_data = headersList.get("user_data") 
  const userData = JSON.parse(user_data) || null
  const access_token = headersList.get("user_access_token")
  
  return (
    <>
      <DiscordWebHookList userData={userData} accessToken={access_token} />
    </>
  )
}

export default DiscordWebHookPage