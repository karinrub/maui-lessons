import {
  vacationSceneImage,
  vacationSceneImageConfig,
} from './vacationSceneConfig'

export default function VacationImageLayer() {
  return (
    <div className="vacation-cinematic-scene__image-layer" data-vacation-layer="image">
      <div className="vacation-cinematic-scene__image-frame">
        <img
          className="vacation-cinematic-scene__image"
          src={vacationSceneImage}
          alt="Aaron splashing in the surf beneath leaning palm trees on a Maui beach"
          width={vacationSceneImageConfig.width}
          height={vacationSceneImageConfig.height}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="vacation-cinematic-scene__image-scrim" aria-hidden="true" />
      </div>
    </div>
  )
}
