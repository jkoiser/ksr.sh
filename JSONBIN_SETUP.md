# JSONBin.io Setup for Shared Highscores

JSONBin.io is a free JSON storage service that works perfectly with GitHub Pages static hosting.

## Quick Setup (5 minutes):

1. **Sign up for free account:**
   - Go to https://jsonbin.io
   - Sign up (free tier allows 1000 requests/month)

2. **Get your API key:**
   - After signing up, go to your dashboard
   - Copy your "Master Key" (X-Master-Key)

3. **Create your first bin:**
   - You can create it manually OR let the code create it automatically
   - To create manually: Click "Create Bin" → Paste: `{"highscores": []}` → Save
   - Copy the Bin ID from the URL (e.g., if URL is `https://jsonbin.io/abc123`, the ID is `abc123`)

4. **Update the code:**
   - Open `s/index.html`
   - Find these lines:
     ```javascript
     const JSONBIN_API_KEY = 'YOUR_JSONBIN_API_KEY';
     const JSONBIN_BIN_ID = 'YOUR_BIN_ID';
     ```
   - Replace with your actual API key and Bin ID

5. **Done!** Your highscores will now be shared across all users.

## Alternative: Auto-create Bin

If you want the code to auto-create the bin on first use, you can modify the `saveHighscore` function to create a new bin if it doesn't exist. However, you'll still need the API key.

## Security Note:

Since this is client-side code, your API key will be visible in the browser. JSONBin's free tier is fine for this, but if you want to hide the key, you'd need a backend proxy (which defeats the purpose of using JSONBin with GitHub Pages).

## Rate Limits (Free Tier):

- 1000 requests/month
- Should be plenty for a small game
- If you exceed, consider upgrading or using a different service

## Other Free Alternatives:

1. **JSONStorage** (https://jsonstorage.net) - Similar to JSONBin
2. **Firebase Realtime Database** - More complex but more powerful
3. **Supabase** - Free tier with PostgreSQL




