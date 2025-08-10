Welcome to the hostel helpline website for bphc.

A web portal for BPHC Hostel Maintenance, allowing students to report and track maintenance issues in their hostel rooms.

## Features

- Google OAuth login (BITS email required)
- Report maintenance issues
- Track resolution status
- Admin/hostel office contact info

## Tech Stack

- React (with TypeScript)
- Supabase (for authentication and backend)
- Tailwind CSS (for styling)
- Vite (for development/build)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/hostel-helpline.git
cd hostel-helpline
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment

- Create a `.env` file with your Supabase credentials and any other required environment variables.

### 4. Tailwind CSS Setup

Make sure you have the following in your `tailwind.config.js`:

```js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

And in your main CSS file (e.g., `src/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Run the development server

```bash
npm run dev
```

## Project Structure

```
src/
  components/      # Reusable UI components (Card, Button, etc.)
  lib/             # Utility functions
  loginpage.tsx    # Login page with Google OAuth
  supabaseClient.ts# Supabase client setup
  ...
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

[MIT](LICENSE)
