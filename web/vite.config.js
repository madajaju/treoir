import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';


export default defineConfig({
	plugins: [tailwindcss(), sveltekit(),
		{
			name: 'server-side-api',
			configureServer(server) {
				server.middlewares.use('/api', async(req, res) => {
					console.log(req.url);
					if(req.url === '/ask') {
						console.log(req.body);
						res.end("made it");
					} else {
						res.end("Not Found!");
					}
				});
			}
		}
	],
	server: {
		proxy: {
			'/socket.io': {
				target: 'http://localhost/web/socket.io',
				ws: true
			},
		}
	}
});
