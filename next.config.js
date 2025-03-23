/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'books.google.com',
                port: '',
                pathname: '/books/content/**',
            },
            {
                protocol: 'https',
                hostname: 'books.google.com',
                port: '',
                pathname: '/books/content/**',
            },
            {
                protocol: 'http',
                hostname: 'books.google.co.jp',
                port: '',
                pathname: '/books/content/**',
            },
            {
                protocol: 'https',
                hostname: 'books.google.co.jp',
                port: '',
                pathname: '/books/content/**',
            },
        ],
    },
};

module.exports = nextConfig; 