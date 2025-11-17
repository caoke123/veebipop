"use client"

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { useBlur } from '@/hooks/useBlur'

type Props = Omit<ImageProps, 'placeholder' | 'blurDataURL'> & {
  src: string
  disableBlur?: boolean
}

const allowHosts = new Set(['pixypic.net', 'image.nv315.top', 'localhost', '127.0.0.1'])

const BlurImage: React.FC<Props> = ({ src, disableBlur, ...rest }) => {
  const { data: blur, isError, isLoading } = useBlur(src)
  const [errored, setErrored] = useState(false)
  let unoptimized = false
  try {
    const u = new URL(src)
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      if (!allowHosts.has(u.hostname)) unoptimized = true
    }
  } catch {}
  
  // If blur generation failed, is loading, or explicitly disabled, don't use blur placeholder
  const shouldUseBlur = !disableBlur && blur && !isError && !isLoading
  
  if (errored) {
    return (
      // Fallback to native img when Next/Image fails
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} {...rest as any} />
    )
  }
  return (
    <Image
      src={src}
      placeholder={shouldUseBlur ? 'blur' : undefined}
      blurDataURL={shouldUseBlur ? blur : undefined}
      unoptimized={unoptimized}
      onError={() => setErrored(true)}
      {...rest}
    />
  )
}

export default BlurImage