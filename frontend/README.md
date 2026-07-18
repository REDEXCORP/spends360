# Spends360

```
NEXT_PUBLIC_APP_NAME=Spends360
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Paddle checkout

Paddle values are hardcoded at the top of `src/app/subscribe/page.tsx` for now.

1. Create a [Paddle sandbox](https://sandbox-vendors.paddle.com/) account.
2. Create product **Spends360** with 4 prices (monthly/yearly base + seat).
3. Paste client token + price IDs into the constants in `subscribe/page.tsx`.
4. Set **Default payment link** to `http://localhost:3000`.

Test card: `4242 4242 4242 4242`, any future expiry, CVC `100`.
