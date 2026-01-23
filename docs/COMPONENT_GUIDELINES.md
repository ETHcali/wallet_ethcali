# Component & Code Guidelines

## File Size Limits

| Type | Max Lines | Ideal Lines |
|------|-----------|-------------|
| Components | 300 | 150-200 |
| Hooks | 150 | 80-120 |
| Utility files | 200 | 100-150 |

If a file exceeds these limits, consider splitting it into smaller, focused modules.

## Component Structure

### Standard Component Template

```tsx
/**
 * ComponentName - Brief description
 */
import React from 'react';
import { logger } from '@/utils/logger';

interface ComponentNameProps {
  // Props with JSDoc comments for complex props
  /** Description of the prop */
  propName: string;
  onAction?: () => void;
}

export function ComponentName({ propName, onAction }: ComponentNameProps) {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState(initialValue);

  // 2. Derived values / memoization
  const derivedValue = useMemo(() => compute(state), [state]);

  // 3. Event handlers
  const handleAction = useCallback(() => {
    logger.debug('Action triggered', { propName });
    onAction?.();
  }, [propName, onAction]);

  // 4. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 5. Early returns (loading, error states)
  if (!data) return <Loading />;

  // 6. Main render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// Use React.memo for pure display components
export default React.memo(ComponentName);
```

## Hook Structure

### Standard Hook Template

```typescript
/**
 * useHookName - Brief description
 * @param param1 - Description
 * @returns Description of return value
 */
export function useHookName(param1: string) {
  const { wallets } = useWallets();

  const query = useQuery({
    queryKey: ['hook-name', param1],
    queryFn: async () => {
      // Async logic
    },
    enabled: Boolean(param1),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
```

## Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `SendTokenModal.tsx`)
- Hooks: `camelCase.ts` starting with `use` (e.g., `useTokenBalances.ts`)
- Utilities: `camelCase.ts` (e.g., `tokenUtils.ts`)
- Types: `camelCase.ts` (e.g., `swag.ts`)

### Variables & Functions
- Components: `PascalCase`
- Hooks: `useCamelCase`
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Interfaces/Types: `PascalCase`

### Props
```typescript
// Prefix event handlers with 'on'
interface Props {
  onSubmit: () => void;
  onChange: (value: string) => void;
  onClick: () => void;
}

// Prefix boolean props with 'is', 'has', 'can', 'should'
interface Props {
  isLoading: boolean;
  hasError: boolean;
  canSubmit: boolean;
  shouldValidate: boolean;
}
```

## Import Order

Imports should be organized in this order (enforced by ESLint):

```typescript
// 1. Built-in modules
import React, { useState, useEffect } from 'react';

// 2. External packages
import { useQuery } from '@tanstack/react-query';
import { useWallets } from '@privy-io/react-auth';

// 3. Internal modules (absolute imports)
import { logger } from '@/utils/logger';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// 4. Relative imports (parent, then sibling)
import { useLocalHook } from '../hooks/useLocalHook';
import { ChildComponent } from './ChildComponent';

// 5. Type imports
import type { MyType } from '@/types';
```

## Error Handling

### In Components

```tsx
function MyComponent() {
  const { data, error, isLoading } = useMyHook();

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return <div>{/* content */}</div>;
}
```

### In Hooks

```typescript
export function useMyHook() {
  const query = useQuery({
    queryFn: async () => {
      try {
        const result = await fetchData();
        return result;
      } catch (error) {
        logger.error('Failed to fetch data', error);
        throw handleError(error); // Use centralized error handling
      }
    },
  });

  return {
    data: query.data,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
```

### In Event Handlers

```tsx
const handleSubmit = async () => {
  try {
    setIsLoading(true);
    await submitData();
    logger.info('Submission successful');
  } catch (error) {
    const friendlyError = handleError(error);
    setError(friendlyError.message);
    logger.error('Submission failed', error);
  } finally {
    setIsLoading(false);
  }
};
```

## Logging Guidelines

### Use the Logger Utility

```typescript
import { logger } from '@/utils/logger';

// Debug - detailed info (dev + DEBUG=true only)
logger.debug('Detailed info', { data });

// Info - general info (dev only)
logger.info('User action completed');

// Warn - potential issues (always shown)
logger.warn('Unexpected but handled', { context });

// Error - errors (always shown)
logger.error('Operation failed', error);

// Transaction logging
logger.tx('Sending transaction', { hash, chainId, status });

// Contract logging
logger.contract('Reading balance', { contract, method });
```

### Never Use console.log

```typescript
// BAD
console.log('Debug info');

// GOOD
logger.debug('Debug info');
```

## TypeScript Guidelines

### Avoid `any`

```typescript
// BAD
const data: any = fetchData();

// GOOD
interface MyData {
  id: string;
  value: number;
}
const data: MyData = fetchData();
```

### Use Proper Return Types

```typescript
// GOOD - explicit return type
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// GOOD - inferred for simple functions is OK
const double = (n: number) => n * 2;
```

### Use Type Guards

```typescript
function isValidAddress(address: unknown): address is `0x${string}` {
  return typeof address === 'string' && address.startsWith('0x');
}
```

## Performance Guidelines

### Use React.memo for Pure Components

```tsx
// Display-only components that receive props
const TokenRow = React.memo(function TokenRow({ token }: Props) {
  return <div>{token.name}</div>;
});
```

### Use useCallback for Passed Functions

```tsx
// When passing functions to child components
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

return <Button onClick={handleClick} />;
```

### Use useMemo for Expensive Computations

```tsx
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

## Testing Checklist

Before submitting code, verify:

- [ ] No console.log statements (use logger)
- [ ] No hardcoded values (use constants)
- [ ] Proper TypeScript types (no any)
- [ ] Error handling present
- [ ] Loading states handled
- [ ] Component under 300 lines
- [ ] Hook under 150 lines
- [ ] Tested on multiple networks (Base, Ethereum)

## Code Review Checklist

Reviewers should verify:

- [ ] Component/hook size within limits
- [ ] Follows naming conventions
- [ ] Proper error handling
- [ ] No code duplication
- [ ] Uses centralized utilities (logger, errorHandling, explorer)
- [ ] TypeScript types are correct
- [ ] No hardcoded values
- [ ] Imports are properly ordered
