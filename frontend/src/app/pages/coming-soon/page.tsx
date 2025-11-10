import React from 'react'
import Image from 'next/image'
import ComingSoonInteractive from '@/components/ComingSoon/ComingSoonInteractive'

const ComingSoon = () => {
  return (
    <>
      <div className="coming-soon relative w-screen h-screen">
        <Image
          src={'/images/other/bg-coming-soon.png'}
          width={4000}
          height={3000}
          alt='bg'
          className='absolute top-0 left-0 w-full h-full object-cover'
          sizes="100vw"
        />
        <ComingSoonInteractive />
      </div>
    </>
  )
}

export default ComingSoon