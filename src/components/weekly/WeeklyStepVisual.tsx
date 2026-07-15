import type { CSSProperties } from 'react'

export type WeeklyStepRingColors = {
  outer: string
  middle: string
  inner: string
}

type WeeklyStepVisualProps = {
  src: string
  alt: string
  width: number
  height: number
  loading: 'eager' | 'lazy'
  imagePosition: string
  ringColors: WeeklyStepRingColors
}

type RingStyle = CSSProperties & {
  '--weekly-ring-outer': string
  '--weekly-ring-middle': string
  '--weekly-ring-inner': string
}

export default function WeeklyStepVisual({
  src,
  alt,
  width,
  height,
  loading,
  imagePosition,
  ringColors,
}: WeeklyStepVisualProps) {
  const style: RingStyle = {
    '--weekly-ring-outer': ringColors.outer,
    '--weekly-ring-middle': ringColors.middle,
    '--weekly-ring-inner': ringColors.inner,
  }

  return (
    <figure className="weekly-step__visual" style={style}>
      <span className="weekly-step__ring weekly-step__ring--outer" aria-hidden="true" />
      <span className="weekly-step__ring weekly-step__ring--middle" aria-hidden="true" />
      <span className="weekly-step__ring weekly-step__ring--inner" aria-hidden="true" />
      <span className="weekly-step__lens">
        <img
          className="weekly-step__image"
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={loading === 'eager' ? 'high' : 'auto'}
          decoding="async"
          width={width}
          height={height}
          style={{ objectPosition: imagePosition }}
        />
      </span>
    </figure>
  )
}
