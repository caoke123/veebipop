'use client'

import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { navigationData } from '@/data/navigation'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
  pathname: string
}

const MobileMenu = ({ open, onClose, pathname }: MobileMenuProps) => {
  return (
    <div id="menu-mobile" className={`${open ? 'open' : ''}`}>
      <div className="menu-container bg-white h-full">
        <div className="container h-full">
          <div className="menu-main h-full overflow-hidden">
            <div className="heading py-2 relative flex items-center justify-center">
              <div
                className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface flex items-center justify-center"
                onClick={onClose}
              >
                <Icon.X size={14} />
              </div>
              <Link href={'/'} className='logo text-3xl font-semibold text-center'>Selmi</Link>
            </div>
            <div className="form-search relative mt-2">
              <Icon.MagnifyingGlass size={20} className='absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer' />
              <input type="text" placeholder='What are you looking for?' className=' h-12 rounded-lg border border-line text-sm w-full pl-10 pr-4' />
            </div>

            <nav className="list-nav mt-6" aria-label="Mobile navigation">
              <ul className="space-y-4">
                {navigationData.map((item) => (
                  item.children && item.children.length > 0 ? (
                    <li key={item.key}>
                      <details>
                        <summary className="text-xl font-semibold flex items-center justify-between">
                          {item.label}
                        </summary>
                        <ul className="pl-2 pt-2 space-y-2">
                          {item.children.map((child) => (
                            <li key={child.key}>
                              <Link
                                href={child.href}
                                className={`nav-item-mobile text-secondary duration-300 ${pathname === child.href ? 'active' : ''}`}
                                onClick={onClose}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  ) : (
                    <li key={item.key}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className={`nav-item-mobile text-secondary duration-300 ${pathname === item.href ? 'active' : ''}`}
                          onClick={onClose}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-secondary">{item.label}</span>
                      )}
                    </li>
                  )
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileMenu