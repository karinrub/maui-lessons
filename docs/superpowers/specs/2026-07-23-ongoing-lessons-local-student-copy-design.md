# Ongoing Lessons Local Student Copy Design

Date: 2026-07-23

Route: `/weekly-lessons`

## Goal

Strengthen the Ongoing Lessons page for Maui residents looking for regular
ukulele or guitar instruction. Give equal emphasis to adults, returning
players, younger students, and parents while preserving the page's existing
cinematic structure and calm editorial voice.

## Source Of Truth

All claims must remain grounded in copy already published across the live site.
Relevant verified facts are:

1. Aaron offers private ukulele and guitar lessons.
2. Lessons welcome complete beginners, returning players, and students through
   advanced technique.
3. Aaron teaches students of any age with a patient approach.
4. Ongoing lessons continue from where the previous lesson ended.
5. The learning path can include first chords, real songs, reading music,
   understanding the instrument, technique, and personal style.
6. Ongoing lessons meet across Kīhei and Wailea, and at Maipoina Beach Park.
7. Ongoing lesson options are 30 minutes for $35 and one hour for $60.
8. Aaron has 22 years in music.
9. Ukulele has been Aaron's primary instrument and focus for the last eight
   years.
10. Aaron moved to Maui in 2023.

Do not invent testimonials, student outcomes, policies, credentials, schedules,
or guarantees.

## Voice

Copy should feel warm, calm, personal, and reassuring. It should sell through
specificity and confidence rather than hype. Address prospective students and
parents directly where useful.

Customer facing copy on this page must not use hyphen, en dash, or em dash
characters. Rewrite compounds and interruptions instead of substituting a
different dash.

Avoid generic promotional language, forced slogans, false urgency, and
unsupported claims. Keep sentences natural and varied. Preserve the concise,
editorial rhythm used across the Home, Vacation Lessons, About, FAQ, and
booking pages.

## Page Structure

Keep the existing order and cinematic mechanics, with two new normal flow
chapters:

1. Practice Loop opening
2. The Basics
3. New audience chapter
4. Existing progression chapter with revised copy
5. New weekly lesson chapter
6. Existing teacher chapter with corrected and expanded copy
7. Vacation Lessons cross link
8. Finale and booking call to action

The new chapters must use the current cream, sage, ink, and gold system. Reuse
existing media and reveal patterns. Do not add dependencies, routes, or image
assets. Do not alter the Practice Loop, progression graph, global navigation,
footer behavior, or booking destination.

## Approved Copy

### Opening

Heading:

> Progress happens on repeat.

Lede:

> Private ukulele and guitar lessons on Maui, shaped around your experience,
> your pace, and the music you want to play.

### The Basics

1. Private lessons with Aaron
2. Ukulele or guitar
3. Weekly lessons in Kīhei, Wailea, and at Maipoina Beach Park
4. Rates start at $35 for a 30 minute lesson

### Audience Chapter

Eyebrow:

> A PLACE TO BEGIN

Heading:

> Lessons for every stage of learning.

Introduction:

> Some students are holding an instrument for the first time. Others already
> play and want thoughtful guidance toward what comes next. Aaron meets each
> student where they are and gives them a comfortable way forward.

Adult column heading:

> Adults and returning players

Adult column body:

> You do not need a musical background to begin. Start with your first chords,
> return after years away, or build on the skills you already have. Lessons
> move at a pace that gives you time to understand what you are playing and
> enjoy the process.

Younger student column heading:

> Younger students and their parents

Younger student column body:

> Aaron teaches students of any age with the same patient approach. Younger
> players get clear steps, real music to work toward, and room to learn without
> feeling rushed. For parents looking for a warm and encouraging teacher, every
> lesson is shaped around the student in front of him.

### Progression Chapter

Eyebrow:

> HOW IT DEVELOPS

Heading:

> The more you play, the more it becomes your own.

First milestone heading:

> First chords, real songs

First milestone body:

> You begin with music you can actually play, so practice has a purpose from
> the start.

Second milestone heading:

> Reading and understanding

Second milestone body:

> As the music grows, Aaron can introduce reading and help you understand how
> the instrument works.

Third milestone heading:

> Technique and your own style

Third milestone body:

> With steady practice, your playing becomes more comfortable and your own
> musical voice has room to come through.

### Weekly Lesson Chapter

Eyebrow:

> YOUR WEEKLY LESSON

Heading:

> Each week starts where the last one ended.

First paragraph:

> Aaron pays attention to what is clicking, what still feels awkward, and what
> you would like to play next. Lessons can move from first chords and familiar
> songs into reading music, technique, and a deeper understanding of the
> instrument.

Second paragraph:

> There is no fixed level chart to keep up with. The pace changes with the
> student, which gives children and adults the time they need to build real
> confidence.

### Teacher Chapter

Eyebrow:

> WHO YOU ARE LEARNING FROM

First paragraph:

> Aaron brings 22 years of making, studying, and performing music to every
> lesson. Ukulele has been his primary instrument and focus for the last eight
> years, and guitar students receive the same personal attention.

Second paragraph:

> His approach is patient and encouraging. The goal is to help students feel
> comfortable with the instrument and excited to keep playing between lessons.

This replaces the current claim that Aaron has taught on Maui for 22 years.
That claim conflicts with the About page, which says he moved to Maui in 2023.

### Vacation Lessons Cross Link

> Visiting Maui for a week or two? Explore Vacation Lessons.

### Finale

Heading:

> Make music part of your week.

First paragraph:

> Start where you are. Aaron will help you find the next step.

Second paragraph:

> You do not need to have everything figured out before you book. Tell Aaron
> who the lesson is for and what you hope to play.

Call to action:

> Book a Lesson

## Interaction And Motion

New sections use normal document flow. On motion enabled devices, their
eyebrows, headings, body copy, and audience columns may use the page's existing
subtle reveal language. Motion must not introduce new pinning, horizontal
scroll, or layout shifts.

Reduced motion users receive fully visible static content. Semantic reading
order must match visual reading order.

## Responsive Layout

The audience chapter uses two equal columns on wide screens and one vertical
column on narrow screens. The weekly lesson chapter uses a readable editorial
measure at every viewport. No line should overlap media or become clipped at
320 pixels wide.

## SEO

Update the route description to use supported language. It may describe Aaron
as bringing 22 years in music, but it must not say he has taught for over 20
years.

## Testing

Extend the existing Ongoing Lessons source contract test to verify:

1. Both new chapters render in the required order.
2. Approved audience and weekly lesson headings are present.
3. Teacher copy no longer claims 22 years teaching on Maui.
4. Customer facing string literals in the Ongoing Lessons component contain no
   hyphen, en dash, or em dash characters.
5. Existing Practice Loop, progression graph, location image, Vacation Lessons
   link, and booking link remain present.

Run type checking, lint, production build, all tests, prerendering, SEO checks,
and desktop plus mobile browser QA.

