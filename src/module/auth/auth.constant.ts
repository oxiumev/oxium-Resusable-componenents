// auth.constants.ts
export const TOKEN_EXPIRY = {
    ACCESS: {
        JWT: '15m',
        COOKIE: 15 * 60 * 1000, // 15 minutes in milliseconds
    },
    REFRESH: {
        JWT: '7d',
        COOKIE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        PATH: '/auth/refresh', 
    }
} as const;