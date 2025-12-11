import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    base: '/',
    plugins: [react()],
    server: {
        // https: true,  // Enable HTTPS
        host: '0.0.0.0',
        port: 5682,
    }
});

// BUILD SETUP
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer';
// import { viteStaticCopy } from 'vite-plugin-static-copy';

// export default defineConfig({
//   base: '/',
//   plugins: [
//     react(),
//     viteStaticCopy({
//       targets: [
//         {
//           src: 'service-worker.js', // file in project root
//           dest: ''                  // copy to root of dist
//         }
//       ]
//     }),
//     visualizer({
//       open: true, // Automatically opens the report in the browser after build
//       filename: 'dist/stats.html', // Optional: location for the generated report
//       gzipSize: true,
//       brotliSize: true,
//     }),
//   ],
//   server: {
//     https: true,  // Enable HTTPS if needed
//     host: '0.0.0.0',
//     port: 5682,
//   },
//   build: {
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           swiper: ['swiper', 'swiper/react'],
//           vendor: ['zustand'],
//         },
//       },
//     },
//     chunkSizeWarningLimit: 700,  // Increase warning threshold to 700 KB
//   },
// });

