# Spends360

```
NEXT_PUBLIC_APP_NAME=Spends360
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Paddle checkout + webhook

1. Paste client token + price IDs in `frontend/src/app/subscribe/page.tsx`
2. Paste API key + webhook secret in `backend/src/config/paddle.ts`
3. In Paddle → **Developer Tools → Notifications**, create a destination:
   - URL: `https://YOUR_PUBLIC_URL/api/webhooks/paddle`
   - Events: `subscription.created`, `subscription.activated`, `subscription.updated`, `subscription.canceled`, `subscription.past_due`, `subscription.paused`, `transaction.completed`
4. For local testing, expose the API with ngrok:
   `ngrok http 4000`
   then use `https://xxxx.ngrok.io/api/webhooks/paddle`

On payment, Paddle sends a webhook → workspace `subscription_status` becomes `active`. No `/subscription/activate` API.
