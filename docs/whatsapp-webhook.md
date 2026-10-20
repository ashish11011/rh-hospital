# WhatsApp webhook

After deploying this route, configure Meta's WhatsApp webhook with:

- Callback URL: `https://www.rhhealthcaresimulation.com/api/webhooks/whatsapp`
- Verify token: the exact value of `WHATSAPP_WEBHOOK_KEY` in the server environment.

Set `WHATSAPP_WEBHOOK_KEY` in `.env` for local development and in the hosting
environment for production. Restart or redeploy after changing it.

GET verifies `hub.mode=subscribe` and `hub.verify_token`, then returns the plain
text `hub.challenge`. Missing server configuration returns 500; invalid
verification parameters return 403. The verification token is not logged.

POST only logs the raw request body to the server console and acknowledges it
with HTTP 200. It does not access the database, send replies, or perform other
business logic. This temporary logging endpoint does not authenticate POST
signatures; `WHATSAPP_WEBHOOK_KEY` is only the subscription verification token.

In Meta, subscribe to the `messages` webhook field to receive message events.
