import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/web';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit() ],
	
	server: {
		port: 5173,
		host: '0.0.0.0',
		strictPort: true,
		proxy: {
			'/api': {
				target: `${BACKEND_URL}`,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			},
			'/socket.io': {
				target: `${BACKEND_URL}/socket.io`,
				ws: true
			},
		}
	},
});