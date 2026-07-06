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
          alt=""
          width={vacationSceneImageConfig.width}
          height={vacationSceneImageConfig.height}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>
  )
}
