/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // Fix for pdfjs-dist in Next.js
        // pdfjs-dist tries to require 'canvas' which doesn't exist in browser
        if (!isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                canvas: false,
            };
        }

        // Handle .mjs files properly
        config.resolve.extensionAlias = {
            '.js': ['.js', '.ts', '.tsx'],
            '.mjs': ['.mjs'],
        };

        return config;
    },
    // Transpile pdfjs-dist for proper ESM handling
    transpilePackages: ['pdfjs-dist'],

    // Experimental: Enable layers for async module loading
    experimental: {
        esmExternals: 'loose',
    },
};

module.exports = nextConfig;
