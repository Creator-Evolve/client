import Setting from '@/components/setting/setting'
import React from 'react'

const SettingPage = async ({ searchParams }: { searchParams: { tab: string } }) => {
  const tab = (await searchParams).tab
  return (
    <Setting tab={tab} />
  )
}

export default SettingPage