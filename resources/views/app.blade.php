<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script>
            // Previne zoom automático no iPhone ao focar em inputs
            if (window.CSS && window.CSS.supports && window.CSS.supports('(-webkit-touch-callout: none)')) {
                var viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
                }
            }
        </script>
        {{-- Inline script to set light mode by default --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "light" }}';

                if (appearance === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <meta name="theme-color" content="#ffffff">
        <link rel="icon" href="/icons/favicon-196.png" sizes="196x196" type="image/png">
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png">
        <link rel="manifest" href="/manifest.webmanifest">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
