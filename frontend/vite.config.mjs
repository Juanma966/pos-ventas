import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
    // depending on your application, base can also be "/"
    const env = loadEnv(mode, process.cwd(), '');
    const API_URL = `${env.VITE_APP_BASE_NAME}`;
    const PORT = 3000;

    return {
        server: {
            // this ensures that the browser opens upon server start
            open: true,
            // this sets a default port to 3000
            port: PORT,
            host: true
        },
        build: {
            chunkSizeWarningLimit: 1600,
            rollupOptions: {
                output: {
                    // Separa las librerías pesadas en chunks propios: bundle inicial más
                    // chico y mejor cacheo entre deploys (el vendor no cambia con la app).
                    manualChunks(id) {
                        if (!id.includes('node_modules')) return undefined;
                        if (id.includes('@mui/icons-material')) return 'mui-icons';
                        if (id.includes('@tabler/icons-react')) return 'icons-tabler';
                        if (id.includes('@mui') || id.includes('@emotion')) return 'mui-core';
                        if (id.includes('apexcharts')) return 'charts';
                        if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod/')) return 'forms';
                        if (id.includes('react-router') || id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) return 'react-vendor';
                        return undefined;
                    }
                }
            }
        },
        optimizeDeps: {
            exclude: ['@tabler/icons-react']
        },
        preview: {
            open: true,
            host: true
        },
        define: {
            global: 'window'
        },
        resolve: {
            alias: [
                // { find: '', replacement: path.resolve(__dirname, 'src') },
                // {
                //   find: /^~(.+)/,
                //   replacement: path.join(process.cwd(), 'node_modules/$1')
                // },
                // {
                //   find: /^src(.+)/,
                //   replacement: path.join(process.cwd(), 'src/$1')
                // }
                // {
                //   find: 'assets',
                //   replacement: path.join(process.cwd(), 'src/assets')
                // },
            ]
        },
        base: API_URL,
        plugins: [react(), jsconfigPaths()]
    };
});
