# Components Architecture

## Server vs Client Components

### Default: Server Components
By default, all components in Next.js App Router are Server Components. Use Server Components for:
- Data fetching from APIs or databases
- Accessing backend resources directly
- Keeping sensitive information on the server
- Large dependencies that should not be sent to the client
- Static content and layouts

### Client Components
Mark components with `"use client"` directive when you need:
- Interactivity (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- React hooks (useState, useEffect, useContext, etc.)
- Event listeners
- Third-party libraries that require client-side JavaScript

## Component Hierarchy

```
components/
├── ui/              # shadcn/ui components (Client Components)
├── charts/          # Analytics charts (Client Components)
├── tables/          # Data tables (Client Components)
├── layout/          # Layout components (Server Components)
├── forms/           # Form components (Client Components)
└── shared/          # Shared utilities (Server Components by default)
```

## Best Practices

1. **Start with Server Components**: Default to Server Components unless you need client-side features
2. **Minimize Client Components**: Keep Client Components small and focused
3. **Composition**: Compose Server and Client Components together
4. **Data Fetching**: Use Server Components for data fetching, pass data as props to Client Components
5. **Error Boundaries**: Use Client Components for error boundaries (error.tsx)
