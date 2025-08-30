# Email Setup for Pecora Negra Invitations

This application uses **Resend** to send invitation emails via the Supabase Edge Function `send-invitation`.

## Required Environment Variables

Add the following variables to **Supabase** project **Environment Variables** (Functions > Settings):

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key (https://resend.com) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role key to access DB |
| `SITE_URL` | Base URL of the frontend, e.g. `https://pecora-negra-auth.lindy.site` |

Add the same variables (except service role) to **Vercel / hosting** if you call the Edge Function directly from the browser.

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
SITE_URL=https://pecora-negra-auth.lindy.site
```

## Custom Domain & DKIM (recommended)

1. In Resend, add your sending domain (e.g. `pecoranegra.fr`). 
2. Configure DKIM & SPF records at your DNS provider.
3. After verification, you can send from `no-reply@pecoranegra.fr`.

## Testing

Use Resend **Emails** dashboard or [MailHog](https://github.com/mailhog/MailHog) locally.

To test locally (Edge Functions emulator):

```
# Start Supabase local dev (if needed)
$ supabase start

# Deploy & run function
$ supabase functions deploy send-invitation --no-verify-jwt
```

Then POST to `http://localhost:54321/functions/v1/send-invitation` with a valid `Authorization: Bearer <jwt>` header.
