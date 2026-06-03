import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        VitePWA({
            outDir: 'public',
            buildBase: '/build/',
            scope: '/',
            registerType: 'prompt',
            manifest: {
                name: 'Phisio',
                short_name: 'Phisio',
                description: 'Acompanhe histórico e progresso clínico dos pacientes.',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: '/icons/manifest-icon-192.maskable.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/icons/manifest-icon-512.maskable.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: '/icons/manifest-icon-512.maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                navigateFallback: null,
                globDirectory: 'public',
                globPatterns: ['build/assets/**/*.{js,css,woff2,png,svg,jpg,jpeg}'],
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: /\/evolutions/,
                        method: 'POST',
                        handler: 'NetworkOnly',
                        options: {
                            backgroundSync: {
                                name: 'evolutions-queue',
                                options: {
                                    maxRetentionTime: 24 * 60 // 24 hours
                                }
                            }
                        }
                    }
                ]
            }
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
