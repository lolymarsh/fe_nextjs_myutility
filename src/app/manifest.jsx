export default function manifest() {
    return {
      name: 'LolyApp',
      short_name: 'LolyApp',
      description: 'A Progressive Web App built with Next.js',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: [
        {
          src: '/icons/icon-192x192.jpg',
          sizes: '192x192',
          type: 'image/jpg',
        },
        {
          src: '/icons/icon-512x512.jpg',
          sizes: '512x512',
          type: 'image/jpg',
        },
      ],
    }
  }