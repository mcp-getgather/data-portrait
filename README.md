# Data Portrait

Data Portrait is a web app that transforms your shopping and reading history into stunning, personalized AI-generated portraits. Connect your accounts from major brands (like Amazon, Wayfair, Office Depot, and Goodreads), and Data Portrait will analyze your purchase data to create unique images that reflect your style, interests, and personality.

**Live Demo:** https://dataportrait.app/

## Features

- **Connect Shopping & Reading Accounts:** Securely connect your Amazon, Wayfair, Office Depot and Goodreads accounts.
- **Automatic Import:** Instantly fetch your recent purchases and reading history.
- **AI Portrait Generation:** Create unique portraits based on your real data, powered by Google Gemini and FLUX.
- **Customization:** Choose portrait style, gender, and traits for a personalized result.
- **Live Data Analysis:** Visualize and review the products and brands that shape your portrait.
- **Privacy-Focused:** Your data is used only for generating your portraits and is never sold or shared.

## How It Works

1. **Connect Accounts:** Use the sidebar to securely link your brand and reading accounts.
2. **Import Purchases:** The app fetches your order and reading history using the GetGather API.
3. **Customize Portrait:** Select your preferred style, gender, and traits (e.g., hair, age, features).
4. **Generate Portrait:** Advanced AI models create a portrait that naturally integrates your interests and purchases.
5. **Download & Share:** Preview, download, and share your personalized data portrait.

## Supported Brands

- Amazon
- Wayfair
- Office Depot
- Goodreads

## Technical Overview

- **Frontend:** React (Vite), TypeScript, Tailwind CSS.
- **Backend:** Express.js, geolocation via MaxMind, reverse proxy to GetGather API.
- **AI Models:** Google Gemini, FLUX (via Together AI).
- **Data Model:** Purchases include brand, order date, products, images, etc.

## Configuration

Create a `.env` file in the project root with the following variables:

```env
# GetGather API Configuration
GETGATHER_URL=https://api.getgather.com
GETGATHER_API_KEY=your_getgather_api_key_here

# MaxMind GeoIP Configuration (optional)
MAXMIND_ACCOUNT_ID=your_maxmind_account_id
MAXMIND_LICENSE_KEY=your_maxmind_license_key

# AI Providers (required for image generation)
TOGETHER_API_KEY=your_together_ai_key
GEMINI_API_KEY=your_gemini_api_key
```

## Development

```bash
npm install
npm run dev
```

## Deployment (Fly.io)

### Prerequisites

1. Install the Fly CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Sign up for a Fly.io account: https://fly.io/app/sign-up

### Deploy Steps

1. **Login to Fly.io**:

   ```bash
   fly auth login
   ```

2. **Create and deploy the app**:

   ```bash
   fly launch
   ```

   This will:
   - Create a new app on Fly.io
   - Use the existing `fly.toml` configuration
   - Build and deploy using the existing Dockerfile

3. **Set up secrets**:

   ```bash
   cp .env.template .env
   # IMPORTANT, edit .env with your actual values
   fly secrets import < .env
   ```

4. **Deploy updates**:
   ```bash
   fly deploy
   ```

### Configuration

The `fly.toml` file contains the deployment configuration:

- **Memory**: 512MB RAM (default, can be adjusted)
- **Auto-scaling**: Starts/stops machines based on traffic
- **HTTPS**: Automatically enforced

### Monitoring

- **View logs**: `fly logs`
- **Check status**: `fly status`
- **Open in browser**: `fly open`
