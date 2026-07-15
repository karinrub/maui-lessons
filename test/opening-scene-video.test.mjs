import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src/components/home/OpeningScene.tsx', import.meta.url), 'utf8')

test('primes the hero video for cross-browser autoplay', () => {
  assert.match(source, /const \[isMuted, setIsMuted\] = useState\(true\)/)
  assert.match(source, /autoPlay/)
  assert.match(source, /preload="auto"/)
})
