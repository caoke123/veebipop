"use client"

import React, { useState } from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr";

const TopNavLangCurrency: React.FC = () => {
  const [isOpenLanguage, setIsOpenLanguage] = useState(false)
  const [isOpenCurrence, setIsOpenCurrence] = useState(false)
  const [language, setLanguage] = useState('English')
  const [currence, setCurrence] = useState('USD')

  return (
    <span className="flex items-center gap-5 max-md:hidden">
      <div
        className="choose-type choose-language flex items-center gap-1.5"
        onClick={() => {
          setIsOpenLanguage(!isOpenLanguage)
          setIsOpenCurrence(false)
        }}
      >
        <div className="select relative">
          <p className="selected caption2 text-white">{language}</p>
          <ul className={`list-option bg-white ${isOpenLanguage ? 'open' : ''}`}>
            {['English', 'Espana', 'France'].map((item, index) => (
              <li key={index} className="caption2" onClick={() => setLanguage(item)}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Icon.CaretDown size={12} color="#fff" />
      </div>
      <div
        className="choose-type choose-currency flex items-center gap-1.5"
        onClick={() => {
          setIsOpenCurrence(!isOpenCurrence)
          setIsOpenLanguage(false)
        }}
      >
        <div className="select relative">
          <p className="selected caption2 text-white">{currence}</p>
          <ul className={`list-option bg-white ${isOpenCurrence ? 'open' : ''}`}>
            {['USD', 'EUR', 'GBP'].map((item, index) => (
              <li key={index} className="caption2" onClick={() => setCurrence(item)}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Icon.CaretDown size={12} color="#fff" />
      </div>
    </span>
  )
}

export default TopNavLangCurrency