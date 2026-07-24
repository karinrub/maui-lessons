export const VACATION_LESSON_OPTIONS = [
  {
    id: 'solo-30',
    participants: '1 person',
    duration: '30 minutes',
    price: 35,
    title: '1 person',
    detail: '30 minutes',
  },
  {
    id: 'solo-60',
    participants: '1 person',
    duration: '1 hour',
    price: 60,
    title: '1 person',
    detail: '1 hour',
  },
  {
    id: 'group-2-3',
    participants: '2-3 people',
    duration: '1 hour',
    price: 80,
    title: '2-3 people',
    detail: '1 hour',
  },
  {
    id: 'group-4-5',
    participants: '4-5 people',
    duration: '1 hour',
    price: 100,
    title: '4-5 people',
    detail: '1 hour',
  },
  {
    id: 'group-6-8',
    participants: '6-8 people',
    duration: '1 hour',
    price: 120,
    title: '6-8 people',
    detail: '1 hour',
  },
] as const

export const ONGOING_LESSON_OPTIONS = [
  {
    id: 'ongoing-30',
    participants: null,
    duration: '30 minutes',
    price: 35,
    title: '30 minutes',
    detail: 'Ongoing lesson',
  },
  {
    id: 'ongoing-60',
    participants: null,
    duration: '1 hour',
    price: 60,
    title: '1 hour',
    detail: 'Ongoing lesson',
  },
] as const

const ALL_LESSON_OPTIONS = [...VACATION_LESSON_OPTIONS, ...ONGOING_LESSON_OPTIONS]

export const STARTING_LESSON_PRICE = Math.min(
  ...ALL_LESSON_OPTIONS.map((option) => option.price),
)
