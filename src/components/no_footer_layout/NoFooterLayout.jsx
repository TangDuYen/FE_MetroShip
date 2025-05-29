import Header from '../header/Header'
import { Outlet } from 'react-router-dom'
import React from 'react'

function NoFooterLayout() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}

export default NoFooterLayout
