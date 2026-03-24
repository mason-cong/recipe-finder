# Recipe Finder

A React-based web app that helps you discover recipes based on ingredients you already have. Enter what's in your kitchen, optionally filter by cuisine, and get matched recipes with cook times, difficulty levels, and full instructions.

## Features

- **Ingredient-based search** — Add ingredients and find recipes that use them, ranked by how many of your ingredients match.
- **Cuisine filtering** — Narrow results by 25+ cuisine types (Italian, Japanese, Mexican, etc.).
- **Recipe details** — Each result shows cook time, servings, difficulty, matched/missing ingredients, and expandable instructions.
- **Recipe chatbot** — An integrated chatbot component for conversational recipe help.

## Tech Stack

- React (with hooks)
- Tailwind CSS
- Lucide React (icons)
- [Spoonacular API](https://spoonacular.com/food-api) for recipe data

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with your Spoonacular API key:
   ```
   VITE_SPOONACULAR_API_KEY=your_api_key_here
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

## Project Structure

- `App.jsx` — Main application component (ingredient input, search, results display)
- `components/RecipeChatbot.jsx` — Chatbot component for conversational recipe assistance
