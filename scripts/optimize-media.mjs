import { access, rename, rm } from 'node:fs/promises'
import { constants } from 'node:fs'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const videos = [
  'assets/videos/aaron-ukelele-vid.MP4',
  'assets/videos/aaron-weekly-section.mp4',
]

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) {
        resolvePromise(undefined)
        return
      }
      reject(new Error(`${command} exited with ${code}`))
    })
  })
}

try {
  await run('ffmpeg', ['-version'])
} catch {
  console.log('ffmpeg unavailable; preserving source media for local development.')
  process.exit(0)
}

for (const relativePath of videos) {
  const input = resolve(relativePath)
  await access(input, constants.R_OK)
  const output = `${input}.optimized.mp4`
  await rm(output, { force: true })
  await run('ffmpeg', [
    '-y',
    '-i',
    input,
    '-map_metadata',
    '-1',
    '-vf',
    'scale=1280:-2:force_original_aspect_ratio=decrease',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '24',
    '-maxrate',
    '2500k',
    '-bufsize',
    '5000k',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '96k',
    '-movflags',
    '+faststart',
    output,
  ])
  await rename(output, input)
  console.log(`Optimized ${relativePath}`)
}
