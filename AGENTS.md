# AGENTS.md - SmartScrape Development Guide

This file contains guidelines for agentic coding agents working in this repository.

## Build, Lint, and Development Commands

### Development

- `npm run dev` - Start both frontend (Next.js) and backend (Convex) in parallel
- `npm run dev:frontend` - Start Next.js dev server only
- `npm run dev:backend` - Start Convex dev server only
- `npm run predev` - Initialize Convex and open dashboard

### Production

- `npm run build` - Build the Next.js application
- `npm run start` - Start production server

### Code Quality

- `npm run lint` - Run ESLint on the codebase

### Testing

This project does not currently have test scripts configured. If tests are added, update this section.

## Code Style Guidelines

### Imports

- Use single quotes: `import { foo } from 'bar'`
- Use absolute imports with `@/` alias for project root: `import { Button } from '@/components/ui/button'`
- React components requiring types: `import * as React from "react"`
- Third-party packages: `import { useQuery } from 'convex/react'`
- Local relative imports: `import { cn } from '@/lib/utils'`

### Component Directives

- Client components: Add `'use client';` at the very top of the file
- Node actions: Add `'use node';` at the very top of the file
- Server components: No directive needed

### Formatting

- Single quotes for strings and JSX attributes
- Semicolons required
- 2 spaces for indentation (no tabs)
- Trailing commas in arrays, objects, and function parameters
- Maximum line width: 140 characters
- Arrow function parentheses always: `(x) => x` not `x => x`
- Bracket spacing enabled

### TypeScript

- Strict mode enabled - always provide proper types
- Use `Id<'tableName'>` type for Convex document IDs instead of `string`
- Explicit return types on exported functions
- Use `as const` for string literal types in discriminated unions
- Array types: `Array<T>` or `T[]`
- Record types: `Record<KeyType, ValueType>`

### Naming Conventions

- **Files**: kebab-case (e.g., `data-table.tsx`, `app-sidebar.tsx`)
- **Components**: PascalCase (e.g., `DataTable`, `Button`)
- **Functions**: camelCase (e.g., `getAllLogs`, `cn`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RESULTS`)
- **Convex tables**: camelCase (e.g., `scrapeLog`, `numbers`)
- **Convex functions**: PascalCase exports (e.g., `getAllLogs`)

### React/Next.js Patterns

- Use function components with hooks
- Use `cn()` utility from `@/lib/utils` for merging classnames
- UI components use Radix UI primitives with shadcn/ui patterns
- Use `asChild` prop for polymorphic components (e.g., Button with Link)
- Use Tailwind CSS for all styling
- Conditional rendering: early returns for undefined/loading states
- Use client components for interactivity, server components for data fetching

### Convex Patterns

- **Always use new function syntax**:

  ```typescript
  export const myQuery = query({
    args: { id: v.id('tableName') },
    returns: v.null(),
    handler: async (ctx, args) => { ... }
  })
  ```

- **Always include validators** for both args and returns (use `v.null()` if no return)
- **Public functions**: `query`, `mutation`, `action` - exposed to clients
- **Internal functions**: `internalQuery`, `internalMutation`, `internalAction` - private helpers
- **Never use `filter()`** in queries - define indexes in schema and use `withIndex()`
- **Index naming**: Include all fields, e.g., `by_field1_and_field2` for index `["field1", "field2"]`
- **Query from functions** using `ctx.runQuery()`, `ctx.runMutation()`, or `ctx.runAction()`
- **Actions**: Add `"use node";` at top, never use `ctx.db` in actions

### Schema Design

- Define all tables in `convex/schema.ts`
- Import from `'convex/server'` and `'convex/values'`
- System fields `_id` and `_creationTime` are automatically added
- Index fields must be queried in the order they're defined
- Use `v.optional()` for nullable fields
- Status fields often use discriminated unions: `v.union(v.literal('a'), v.literal('b'))`

### Error Handling

- Throw descriptive Error objects: `throw new Error('User not found')`
- Check for null/undefined before operations
- Use try-catch blocks in actions for external API calls
- Validate args with Convex validators (no manual validation needed)

### Project Structure

- `/app` - Next.js app router pages
- `/components/ui` - Reusable UI components (shadcn/ui)
- `/components` - Custom components
- `/convex` - Backend functions and schema
- `/hooks` - Custom React hooks
- `/lib` - Utility functions
- `/public` - Static assets

### UI Components

- Use shadcn/ui components from `/components/ui`
- Components support variants via `VariantProps`
- Use class-variance-authority (cva) for variant definitions
- Common components: Button, Input, Card, Sheet, Dialog, DropdownMenu
- Use Lucide React for icons: `import { Plus } from 'lucide-react'`

### Convex Client Integration

- Use ConvexClientProvider for wrapping the app
- Import with: `import { api } from '@/convex/_generated/api'`
- Query data: `const data = useQuery(api.tableName.functionName, args)`
- Call mutations: `const { mutate } = useMutation(api.tableName.functionName)`

### Auth (Clerk)

- Client components: `import { useAuth } from '@clerk/clerk-react'`
- Server components: `import { auth, currentUser } from '@clerk/nextjs'`
- Check auth: `if (!userId) return <RedirectToSignIn />`
- Use `SignedIn` and `SignedOut` components for conditional rendering

## Common Patterns

### Data Fetching (Client)

```typescript
'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function Component() {
  const data = useQuery(api.tableName.queryName, { arg: 'value' });
  if (data === undefined) return <div>Loading...</div>;
  // render data
}
```

### Action with External API

```typescript
'use node';
import { action } from './_generated/server';
import { v } from 'convex/values';

export const myAction = action({
  args: { url: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // External API calls
    // Then call mutations to update DB
    await ctx.runMutation(api.tableName.update, { ... });
    return null;
  }
});
```

## Cursor/Convex Rules Integration

This project includes Convex-specific guidelines in `.cursor/rules/convex_rules.mdc`. Key points:

- Use new function syntax with args/returns validators
- Distinguish public vs internal functions
- Never use `filter()` in queries - use indexed queries
- Actions need `"use node"` directive and cannot access `ctx.db`
- Use `v.int64()` not `v.bigint()` for 64-bit integers
- Use `v.record()` not `v.map()` or `v.set()`
- For pagination, use `paginationOptsValidator` and `.paginate()`
- Always type annotate return values when calling functions in same file to avoid circular type issues
