# 🍽️ ChatBite - Ingredient-First AI Recipes

<div align="center">
  <img src="static/logo.svg" alt="ChatBite Logo" width="120"> <br/><br/>
  
  **An AI-powered Indian recipe generator that transforms your leftover ingredients into authentic, region-specific Indian dishes with step-by-step guidance and cultural context.**
  
  [![Flask](https://img.shields.io/badge/Flask-3.1.0-000000.svg)](https://flask.palletsprojects.com/)
  [![Python](https://img.shields.io/badge/Python-3.8+-3776AB.svg)](https://www.python.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4.svg)](https://tailwindcss.com/)
  [![Google AI](https://img.shields.io/badge/Google%20AI-Gemini%202.0-4285F4.svg)](https://ai.google.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

## ✨ Key Features

- **🤖 AI-Powered Recipes** - Uses Google Gemini 2.0 Flash to create recipes from any ingredients
- **⚡ Instant Recipe Generation** - Get detailed recipes with traditional techniques (tadka, bhunao, dum) in seconds
- **🎯 Smart Customization** - Set meal type, dietary preferences, and skill level for personalized recipes
- **💬 Conversational Interface** - Chat-based UI with message history and context awareness
- **🎨 Quick Ingredient Ideas** - Pre-made suggestions for popular Indian dishes
- **� Export Recipes** - Download recipes and clear chat for fresh starts
- **🍛 Indian Accompaniments** - Get serving suggestions with roti, rice, raita, pickle, papad, and more

## 🏗️ Architecture

```
food_chat_bot/
├── 📁 static/
│   ├── 📁 css/
│   │   └── styles.css               # 🎨 Custom styling with chat UI
│   ├── 📁 js/
│   │   └── chat.js                  # 💬 Chat logic & API interactions
│   └── logo.svg                     # 🎨 ChatBite logo
│
├── 📁 templates/
│   └── index.html                   # � Main interface with Tailwind
│
├── 📁 __pycache__/                  # 🐍 Python cache files
│
├── app.py                           # 🚀 Flask application with Gemini integration
├── apichabot.py                     # 🤖 CLI chatbot for testing
├── requirements.txt                 # 📦 Python dependencies
├── .env                             # 🔐 Environment variables (not in repo)
├── .env.example                     # 📋 Environment template
└── README.md                        # 📖 Project documentation
```

## 🚀 Quick Start

### Prerequisites

- **Python** 3.8+
- **pip** package manager
- **Google Gemini API Key** (Gemini 2.0 Flash)

### 1. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/BhumikaNair/ChatBite
cd ChatBite

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start Development Server

```bash
# Start the Flask development server
flask --app app run --debug
```

### 4. Access the Application

- **Web Interface**: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🛠️ Tech Stack

- **⚡ Flask 3.1** - Lightweight Python web framework
- **🤖 Google Gemini AI 2.0** - Advanced language model for recipe generation
- **🎨 Tailwind CSS 3** - Utility-first CSS framework (via CDN)
- **💬 Vanilla JavaScript** - Client-side chat logic and API calls
- **📝 Marked.js** - Markdown parsing for formatted recipe display
- **🧹 DOMPurify** - XSS protection for safe HTML rendering
- **🐍 Python-dotenv** - Environment variable management

## 🔑 Required API Keys

### 🧠 Google Gemini AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini 2.0 Flash model
3. Copy the API key to your `.env` file
4. [Documentation](https://ai.google.dev/docs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for authentic Indian home cooking**

[🌟 Star this repo](../../stargazers) • [🐛 Report Bug](../../issues) • [💡 Request Feature](../../issues)

Made by [Bhumika Nair](https://github.com/BhumikaNair)

</div>
