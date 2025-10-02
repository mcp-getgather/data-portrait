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

# MaxMind GeoIP Configuration (optional)
MAXMIND_ACCOUNT_ID=your_maxmind_account_id
MAXMIND_LICENSE_KEY=your_maxmind_license_key

# AI Providers (required for image generation)
TOGETHER_API_KEY=your_together_ai_key
GEMINI_API_KEY=your_gemini_api_key
```

## Development

### Using Docker

Use Docker or Podman to pull the container image and run it:

```bash
docker run -p 3000:3000 \
  -e GETGATHER_URL=your_local_mcp_getgather_url \
  -e GEMINI_API_KEY=your_gemini_key \
  ghcr.io/mcp-getgather/data-portrait:latest
```

Then open [localhost:3000](http://localhost:3000) to access the application.

### Local Development

```bash
npm install
npm run dev
```
