# Highscore API Setup Guide

To enable shared highscores across all users, you need to set up a backend API. Here are several options:

## Option 1: Cloudflare Workers (Recommended for static sites)

Create a Cloudflare Worker with this code:

```javascript
// worker.js
const HIGHSCORES_KEY = 'highscores';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET - Fetch highscores
    if (request.method === 'GET' && url.pathname === '/api/highscores') {
      const highscores = await env.KV.get(HIGHSCORES_KEY) || '[]';
      return new Response(JSON.stringify({ highscores: JSON.parse(highscores) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Save highscore
    if (request.method === 'POST' && url.pathname === '/api/highscores') {
      const { score } = await request.json();
      const highscores = JSON.parse(await env.KV.get(HIGHSCORES_KEY) || '[]');
      
      highscores.push(score);
      highscores.sort((a, b) => b - a);
      const top5 = highscores.slice(0, 5);
      
      await env.KV.put(HIGHSCORES_KEY, JSON.stringify(top5));
      
      return new Response(JSON.stringify({ highscores: top5 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
```

**Setup:**
1. Sign up for Cloudflare (free)
2. Create a Worker
3. Create a KV namespace named "KV"
4. Deploy the worker
5. Update `API_BASE_URL` in `s/index.html` to your worker URL

## Option 2: Supabase (Easiest, Free tier available)

1. Sign up at https://supabase.com
2. Create a new project
3. Create a table:
   ```sql
   CREATE TABLE highscores (
     id SERIAL PRIMARY KEY,
     score INTEGER NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
4. Create API endpoints or use Supabase client

Update the code to use Supabase:
```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

async function getHighscores() {
  const { data } = await supabase
    .from('highscores')
    .select('score')
    .order('score', { ascending: false })
    .limit(5);
  return data?.map(d => d.score) || [];
}

async function saveHighscore(score) {
  await supabase.from('highscores').insert({ score });
  return await getHighscores();
}
```

## Option 3: Simple Node.js Backend

Create a simple Express server:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let highscores = [];

app.get('/api/highscores', (req, res) => {
  res.json({ highscores: highscores.slice(0, 5) });
});

app.post('/api/highscores', (req, res) => {
  const { score } = req.body;
  highscores.push(score);
  highscores.sort((a, b) => b - a);
  highscores = highscores.slice(0, 5);
  res.json({ highscores });
});

app.listen(3000);
```

Deploy to:
- Railway (free tier)
- Render (free tier)
- Fly.io (free tier)
- Heroku (paid)

## Option 4: Firebase Realtime Database

1. Create Firebase project
2. Enable Realtime Database
3. Update code to use Firebase SDK

## Quick Start (No Backend - IP-based grouping)

If you want to group by IP without a backend, you'd need to:
1. Use a service like ipapi.co to get user's IP
2. Store scores in localStorage keyed by IP
3. This only works per-browser, not truly shared

**Note:** The current implementation in `s/index.html` uses `API_BASE_URL` placeholder. Replace it with your actual API endpoint once you set up one of the above options.




