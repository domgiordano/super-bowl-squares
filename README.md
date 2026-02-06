# Super Bowl Squares

A real-time Super Bowl squares betting pool application built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 **Google OAuth Authentication** via Supabase
- 👥 **Group Management** - Create groups and invite members with shareable links
- 🎮 **Game Creation** - Set up 10x10 grids for Super Bowl squares
- ⚡ **Real-time Updates** - Live square selection with optimistic locking
- 👁️ **Presence Tracking** - See who's currently viewing the game
- 🎲 **Random Number Assignment** - Fair number distribution for both teams
- 🏆 **Winner Calculation** - Automatically determine winners based on scores

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([create one here](https://app.supabase.com))
- Google Cloud Console project for OAuth

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup Supabase:**
   - Create a new project at https://app.supabase.com
   - Go to Project Settings > API to get your project URL and anon key

3. **Configure Google OAuth:**
   - In Supabase Dashboard: Authentication > Providers > Google
   - Enable Google provider
   - Get OAuth credentials from Google Cloud Console
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

4. **Environment Variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run Database Migrations:**
   ```bash
   # Install Supabase CLI (macOS)
   brew install supabase/tap/supabase

   # OR use npx (no install needed)
   # npx supabase link --project-ref your-project-ref
   # npx supabase db push

   # Link to your project
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push
   ```

6. **Start Development Server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tables

- **profiles** - Extended user information
- **groups** - Betting pool groups
- **group_members** - Group membership with roles (admin/member)
- **games** - Individual Super Bowl games
- **squares** - 10x10 grid squares with ownership
- **presence** - Real-time user presence tracking

### Key Functions

- `initialize_game_squares(game_id)` - Creates 100 squares for a new game
- `randomize_game_numbers(game_id)` - Shuffles numbers 0-9 for both teams
- `claim_square(...)` - Atomically claims a square with optimistic locking

## How to Use

1. **Sign In** - Use Google account to authenticate
2. **Create a Group** - Set up a betting pool for your friends
3. **Invite Members** - Share the invite link with participants
4. **Create a Game** - Set up a game with team names
5. **Open for Selection** - Allow members to pick squares
6. **Randomize Numbers** - Lock the game and assign random numbers
7. **Track Winners** - Enter scores to see who wins each quarter

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **Real-time:** Supabase Realtime

## Architecture Highlights

### Real-time Features
- PostgreSQL change subscriptions for instant square updates
- Supabase Presence API for live user tracking
- Optimistic UI updates for smooth UX

### Security
- Row Level Security (RLS) policies on all tables
- Server-side authentication checks
- Optimistic locking prevents concurrent claim conflicts

### Edge Cases Handled
- Concurrent square selection (optimistic locking)
- User square limits enforcement
- Game state validation (can only claim in 'open' status)
- Real-time cleanup on component unmount

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

Deploy to Vercel for the best experience:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=your-repo-url)

1. Connect your Supabase project
2. Add environment variables
3. Deploy!

## Future Enhancements

- 💰 Payment integration for entry fees
- 📧 Email notifications for winners
- 📊 Game statistics and history
- 🎨 Dark mode
- 📱 Mobile app (React Native)
- 🏅 Leaderboards
- 🔔 Push notifications

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
