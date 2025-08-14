# Web3Client Component Documentation

## Issues Resolved

### 1. WagmiProvider Context Error

- **Issue**: `useConfig` must be used within `WagmiProvider` error
- **Cause**: WagmiProvider is not available during server-side rendering, but components try to use wagmi hooks
- **Solution**: Use client-side rendering to ensure WagmiProvider is only available on the client

### 2. WalletConnect Duplicate Initialization

- **Issue**: WalletConnect Core is initialized multiple times
- **Cause**: Configuration is recreated when components re-render
- **Solution**: Use singleton pattern and configuration caching

### 3. Hydration Mismatch

- **Issue**: Server-side and client-side rendering inconsistency
- **Cause**: Web3-related components behave differently on server and client
- **Solution**: Ensure Web3 components only render on the client

## Component Architecture

```
RootLayout
    ↓
ErrorBoundary (Global error handling)
    ↓
InjectedWrapper (Injected state)
    ↓
Providers
    ↓
ThemeProvider (Theme)
    ↓
I18nInitializer (Internationalization)
    ↓
QueryProvider (Data queries)
    ↓
Web3ErrorBoundary (Web3 error handling)
    ↓
Web3Client (Web3 client-side rendering)
    ↓
WagmiProvider (Wagmi configuration)
    ↓
RainbowKitProvider (Wallet connection)
    ↓
App Components
```

## Key Features

### Web3Client

- Only renders Web3-related components on the client
- Uses `mounted` state to ensure client-side rendering
- Waits for configuration to load before rendering WagmiProvider

### Web3ErrorBoundary

- Specifically handles Web3-related errors
- Degrades to non-Web3 mode when Web3 fails
- Logs errors without interrupting application execution

### useWagmiConfig

- Uses singleton pattern to prevent duplicate initialization
- Configuration caching to avoid duplicate creation
- Prevents concurrent initialization

## Usage

```tsx
// In Providers component
<Web3ErrorBoundary>
    <Web3Client>{children}</Web3Client>
</Web3ErrorBoundary>
```

## Error Handling Strategy

1. **Web3 Initialization Failure**: Degrade to non-Web3 mode
2. **Configuration Loading Failure**: Use default configuration
3. **Wallet Connection Failure**: Display connection error, allow retry
4. **Network Error**: Display network status, provide reconnection options

## Performance Optimization

- Configuration caching to avoid duplicate creation
- Client-side rendering reduces server-side burden
- Error boundaries prevent cascading failures
- On-demand loading of Web3 functionality
