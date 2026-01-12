import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Image optimization configuration
  images: {
    // Configure remote image domains if needed
    remotePatterns: [
      // Add remote image domains here if needed
      // Example:
      // {
      //   protocol: "https",
      //   hostname: "example.com",
      //   port: "",
      //   pathname: "/images/**",
      // },
    ],
    // Image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optimize images to modern formats (WebP, AVIF)
    formats: ["image/webp", "image/avif"],
    // Enable image optimization
    minimumCacheTTL: 60,
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production to reduce bundle size
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  // Note: SWC minification is enabled by default in Next.js 16
  // SWC is ~7x faster than Terser and provides better optimization
  
  // Optimize package imports to reduce bundle size
  transpilePackages: [],

  // Experimental features for performance
  experimental: {
    // Optimize package imports for better tree-shaking
    // This reduces bundle size by only including used modules from packages
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-avatar",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
    ],
    // Optimize CSS loading - merges CSS files when possible to reduce requests
    optimizeCss: true,
    // CSS chunking - merges CSS files based on dependency analysis (default: true)
    cssChunking: true,
    // Enable Web Vitals attribution for performance debugging
    // Supported metrics: CLS, FCP, FID, INP, LCP, TTFB
    webVitalsAttribution: ["CLS", "LCP", "FCP"],
  },
  
  // Note: cacheComponents is disabled because it conflicts with force-dynamic
  // which is needed for cookie access. We use ISR with revalidate instead.
  // cacheComponents: true, // Disabled - conflicts with force-dynamic

  // Enable compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles
  // Note: Font optimization is automatic in Next.js, no need to configure

  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Optimize client-side bundle
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic", // Better caching
        // Minimize main thread work
        minimize: true,
        // Reduce JavaScript execution time
        usedExports: true, // Enable tree shaking
        sideEffects: false, // Assume no side effects for better tree shaking
        splitChunks: {
          chunks: "all",
          maxInitialRequests: 30, // Increased for better parallel loading
          minSize: 15000, // Smaller minimum size for better splitting
          maxSize: 150000, // Smaller chunks reduce parse time and TBT (was 200KB)
          cacheGroups: {
            default: false,
            vendors: false,
            // Separate vendor chunks for better caching
            framework: {
              name: "framework",
              chunks: "all",
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Separate large libraries like recharts - load async
            recharts: {
              name: "recharts",
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              priority: 35,
              chunks: "async", // Load async to not block initial render
              enforce: true,
            },
            // Separate lucide-react icons for better code splitting
            lucide: {
              name: "lucide-react",
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              priority: 34,
              chunks: "async", // Load async
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module: any) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
                return packageName ? `npm.${packageName.replace("@", "")}` : null;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: "commons",
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name() {
                return "shared";
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },

  // Optimize package imports (tree-shaking for better bundle size)
  modularizeImports: {
    // Optimize lucide-react imports - only import used icons
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
    // Optimize recharts - only import what's needed
    recharts: {
      transform: "recharts/lib/{{member}}",
      skipDefaultConversion: true,
    },
  },

  // Security headers for Best Practices score
  async headers() {
    return [
      {
        // Apply security headers to all routes except static files
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // Note: COEP can break some third-party integrations, commenting out for now
          // {
          //   key: "Cross-Origin-Embedder-Policy",
          //   value: "require-corp",
          // },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Note: CSS files are handled by Next.js automatically with correct Content-Type
      // Adding Content-Type header manually can cause conflicts
      // Cache images
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
