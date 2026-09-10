import { existsSync, readFileSync } from 'fs'
import { defineConfig } from 'prisma/config'

function loadEnvFile() {
  const file = existsSync('.env.local') ? '.env.local' : '.env'
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_]+)="?(.*?)"?\s*$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2]
  }
}

loadEnvFile()

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
