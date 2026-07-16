/**
 * Content hidden by a play-once ScrollTrigger must never wait on a scroll
 * event that may already be behind us: anything inside the viewport when its
 * trigger is created reveals immediately. (A trigger line like 'top 84%'
 * sits below elements already on screen at load, which can leave a whole
 * section invisible until the user happens to scroll past it — first seen
 * on the FAQ accordion.)
 */
export default function playIfInView(animation: gsap.core.Animation, el: Element) {
  if (el.getBoundingClientRect().top < window.innerHeight) {
    animation.play()
  }
}
