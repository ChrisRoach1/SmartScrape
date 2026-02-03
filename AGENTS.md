# AGENTS.md - SmartScrape Development Guide

Guidelines for agentic coding agents working in this repository.

## Build, Lint, and Development Commands

### Development

- `npm run dev` - Start frontend (Next.js) and backend (Convex) in parallel
- `npm run dev:frontend` - Start Next.js dev server only
- `npm run dev:backend` - Start Convex dev server only
- `npm run predev` - Initialize Convex and open dashboard

### Production

- `npm run build` - Build the Next.js application
- `npm run start` - Start production server

### Code Quality

- `npm run lint` - Run ESLint on the codebase

### Testing

No test scripts currently configured. If tests are added, update this section.

## Project Structure

```
/app        - Next.js app router pages
/components - Custom components
/components/ui - Reusable UI components (shadcn/ui)
/convex     - Backend functions and schema
/hooks      - Custom React hooks
/lib        - Utility functions
/public     - Static assets
```

## Code Style Guidelines

### Formatting (from .prettierrc)

- Single quotes for strings (`singleQuote: true`)
- Single quotes in JSX (`jsxSingleQuote: true`)
- Semicolons required (`semi: true`)
- 2 spaces for indentation (`tabWidth: 2`, `useTabs: false`)
- Trailing commas everywhere (`trailingComma: all`)
- Max line width: 140 characters (`printWidth: 140`)
- Arrow function parentheses always (`arrowParens: always`)
- Bracket spacing enabled (`bracketSpacing: true`)

### Imports

- Use `@/` alias for project root: `import { Button } from '@/components/ui/button'`
- Third-party: `import { useQuery } from 'convex/react'`
- Convex API: `import { api } from '@/convex/_generated/api'`

### Component Directives

- Client components: `'use client';` at the top
- Node actions: `'use node';` at the top
- Server components: No directive needed

### TypeScript

- Strict mode enabled - always provide proper types
- Use `Id<'tableName'>` for Convex document IDs (not `string`)
- Explicit return types on exported functions
- Use `as const` for string literals in discriminated unions

### Naming Conventions

- **Files**: kebab-case (`data-table.tsx`, `app-sidebar.tsx`)
- **Components**: PascalCase (`DataTable`, `Button`)
- **Functions**: camelCase (`getAllLogs`, `cn`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RESULTS`)
- **Convex tables**: camelCase (`scrapeLog`, `users`)

### Error Handling

- Throw descriptive errors: `throw new Error('User not found')`
- Check for null/undefined before operations
- Use try-catch in actions for external API calls
- Validate args with Convex validators (no manual validation needed)

## React/Next.js Patterns

- Use function components with hooks
- Use `cn()` from `@/lib/utils` for merging classnames
- Use Tailwind CSS for all styling
- Use shadcn/ui components from `/components/ui`
- Use Lucide React for icons: `import { Plus } from 'lucide-react'`
- Client components for interactivity, server components for data fetching
- Early returns for undefined/loading states

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

## Convex Patterns (Critical)

### Function Syntax - ALWAYS use new syntax with validators

```typescript
export const myQuery = query({
  args: { id: v.id('tableName') },
  returns: v.null(),
  handler: async (ctx, args) => { ... }
});
```

### Key Rules

- **Always include validators** for args AND returns (use `v.null()` for no return)
- **Public functions**: `query`, `mutation`, `action` - exposed to clients
- **Internal functions**: `internalQuery`, `internalMutation`, `internalAction` - private
- **Never use `filter()`** - define indexes and use `withIndex()` instead
- **Index naming**: `by_field1_and_field2` for index `["field1", "field2"]`
- **Actions**: Add `"use node";` at top, NEVER use `ctx.db` in actions
- **Function calls**: Use `ctx.runQuery()`, `ctx.runMutation()`, `ctx.runAction()`

### Schema Design

- Define tables in `convex/schema.ts`
- System fields `_id` and `_creationTime` are auto-added
- Use `v.optional()` for nullable fields
- Index fields must be queried in defined order
- Use discriminated unions: `v.union(v.literal('a'), v.literal('b'))`

### Type Guidelines

- Use `v.int64()` not `v.bigint()` for 64-bit integers
- Use `v.record()` not `v.map()` or `v.set()`
- For pagination: `paginationOptsValidator` and `.paginate()`
- Type annotate return values when calling functions in same file (circular type fix)

### Action Example

```typescript
'use node';
import { action } from './_generated/server';
import { v } from 'convex/values';

export const myAction = action({
  args: { url: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // External API calls here
    await ctx.runMutation(api.tableName.update, { ... });
    return null;
  }
});
```

## Auth (Clerk)

- Client: `import { useAuth } from '@clerk/clerk-react'`
- Server: `import { auth, currentUser } from '@clerk/nextjs'`
- Use `SignedIn` and `SignedOut` for conditional rendering

## ESLint Configuration

Uses `eslint-config-next` with `@convex-dev/eslint-plugin`. Generated files in `convex/_generated` are ignored.

## Cursor Rules Integration

This project includes Convex-specific rules in `.cursor/rules/convex_rules.mdc`. Key reminders:

- Use new function syntax with args/returns validators
- Distinguish public vs internal functions
- Never use `filter()` - use indexed queries
- Actions need `"use node"` and cannot access `ctx.db`
- HTTP endpoints go in `convex/http.ts` with `httpAction` decorator
- Crons use `crons.interval` or `crons.cron` (not `.hourly/.daily/.weekly`)
- File storage: use `ctx.storage.getUrl()`, query `_storage` table for metadata
