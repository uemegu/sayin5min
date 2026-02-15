import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Custom plugin to serve assets from the parent project's public/ directory.
// Requests to /game-assets/* are mapped to ../../public/*
function gameAssetsPlugin() {
  const projectPublicDir = path.resolve(__dirname, '../../public')
  return {
    name: 'game-assets-serve',
    configureServer(server: any) {
      server.middlewares.use('/game-assets', (req: any, res: any, next: any) => {
        const filePath = path.join(projectPublicDir, decodeURIComponent(req.url || ''))
        console.log(`[AssetServe] Request: ${req.url} -> Mapping to: ${filePath}`);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          // Determine content type
          const ext = path.extname(filePath).toLowerCase()
          const mimeTypes: Record<string, string> = {
            '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.gif': 'image/gif', '.svg': 'image/svg+xml',
            '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
            '.mp4': 'video/mp4', '.webm': 'video/webm',
            '.vrm': 'model/gltf-binary', '.glb': 'model/gltf-binary',
            '.fbx': 'application/octet-stream',
            '.json': 'application/json',
          }
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
          fs.createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), gameAssetsPlugin()],
  server: {
    fs: {
      // Allow serving files from the project root (2 levels up)
      allow: ['../..'],
    },
  },
})
