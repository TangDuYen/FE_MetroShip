import React from 'react'
import "./ChangePassword.scss"
import Sidebar from '../../components/sidebar_profile/Sidebar'

function ChangePassword() {
  return (
    <div className='change-password'>
        <section className="change-password-wrapper">
            <div className="change-password-row">
                <div className="change-password-left">
                    <Sidebar />
                </div>
                <div className="change-password-right"></div>
            </div>
        </section>
    </div>
  )
}

export default ChangePassword