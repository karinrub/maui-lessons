export type FaqItem = { id: string; q: string; a: string }

export type FaqCategory = {
  id: 'start' | 'vacation' | 'ongoing' | 'planning' | 'pricing'
  label: string
  descriptor: string
  ghostWord: string
  items: FaqItem[]
}

export const faqGuideRoutes = [
  { label: 'Visiting Maui', detail: 'Vacation lessons', targetId: 'faq-category-vacation' },
  { label: 'Learning week to week', detail: 'Ongoing lessons', targetId: 'faq-category-ongoing' },
  { label: 'Before you book', detail: 'Pricing and planning', targetId: 'faq-category-pricing' },
] as const

export const faqQuickFacts = [
  'Private lessons',
  'Ukulele or guitar',
  'Ukulele supplied',
  'South Maui and visitor accommodation',
  'From $35 / 30 minutes',
] as const

export const faqProof = {
  imageAlt: 'Aaron teaching a student guitar outdoors under a tree on Maui',
  imageSrc: new URL('../../../assets/images/aaron-teaching-tree-1.jpg', import.meta.url).href,
  eyebrow: 'Why learn with Aaron',
  heading: 'A lesson shaped around you.',
  points: [
    '22 years making, studying, and performing music',
    'Eight years with ukulele as his primary focus',
    'Private teaching at a patient, no pressure pace',
  ],
} as const

export const faqCategories: FaqCategory[] = [
  {
    id: 'start',
    label: 'Start playing',
    descriptor: 'Find your footing',
    ghostWord: 'begin',
    items: [
      {
        id: 'experience',
        q: 'Do I need any experience?',
        a: 'None at all. Most vacation students have never held a ukulele before — the hour moves at your pace, one chord at a time. If you already play, ongoing lessons pick up wherever you are, all the way to advanced technique.',
      },
      {
        id: 'ages',
        q: 'What ages do you teach?',
        a: 'All of them. Aaron teaches students of any age with the same patient, no-pressure approach, and families often learn side by side.',
      },
      {
        id: 'instruments',
        q: 'Ukulele or guitar?',
        a: 'Both. The ukulele has been Aaron’s focus for the last eight years; guitar lessons come with the same one-on-one attention.',
      },
    ],
  },
  {
    id: 'vacation',
    label: 'Vacation lessons',
    descriptor: 'Make Maui part of the song',
    ghostWord: 'visit',
    items: [
      {
        id: 'vacation',
        q: 'What happens in a vacation lesson?',
        a: 'One private hour on a Maui beach. You’ll learn your first chords, then a real song — one you keep long after the trip ends.',
      },
      {
        id: 'group',
        q: 'Can we book as a group or family?',
        a: 'Yes. The group experience is made for families and friends traveling together — everyone learns the same song, side by side.',
      },
    ],
  },
  {
    id: 'ongoing',
    label: 'Ongoing lessons',
    descriptor: 'Keep building every week',
    ghostWord: 'practice',
    items: [
      {
        id: 'ongoing',
        q: 'How do ongoing lessons work?',
        a: 'They become a regular part of your week. Each lesson picks up exactly where the last left off — from first chords, through reading music, to refining your own style.',
      },
    ],
  },
  {
    id: 'planning',
    label: 'Plan your lesson',
    descriptor: 'Know what to expect',
    ghostWord: 'ready',
    items: [
      {
        id: 'where',
        q: 'Where do lessons happen?',
        a: 'Around South Maui. Vacation lessons usually meet at Maipoina Beach Park or along the coast through Kihei and Wailea — and if it’s easier, Aaron will come to you, whether you’re staying at a hotel or an Airbnb. Ongoing students meet across Kihei and Wailea, and at Maipoina Beach Park.',
      },
      {
        id: 'bring-instrument',
        q: 'Do I need to bring my own instrument?',
        a: 'No. Aaron brings a ukulele for every lesson, so there’s nothing to own or pack — just show up and play.',
      },
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing and booking',
    descriptor: 'Choose your next step',
    ghostWord: 'play',
    items: [
      {
        id: 'pricing',
        q: 'What does a lesson cost?',
        a: 'Rates start at $35 for a 30-minute lesson. The exact rate depends on the lesson type and how often you’d like to meet. Aaron will confirm current pricing with you directly.',
      },
      {
        id: 'payment',
        q: 'How do I pay?',
        a: 'Venmo or cash on the day of your lesson. Card payments through Square are coming soon.',
      },
      {
        id: 'how-to-book',
        q: 'How do I book?',
        a: 'The booking page lets you compare lesson options and choose a date and time. Aaron will confirm next steps directly once booking delivery is connected.',
      },
    ],
  },
]

export const faqStructuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqCategories.flatMap((category) =>
    category.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  ),
})
