import React from 'react'
import styles from './sidebarList.module.css'

export default function SidebarListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.layoutShell}>
      {children}
    </div>
  )
}