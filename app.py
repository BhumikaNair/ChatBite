from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Any, Dict, List

import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

load_dotenv()

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api_key = (
    os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("API_KEY")
)
if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY (or GOOGLE_API_KEY / API_KEY) is not set. Provide a Gemini API key in your environment."
    )

genai.configure(api_key=api_key)

MODEL_NAME = "gemini-2.0-flash"

generation_config = genai.GenerationConfig(
    temperature=0.5,
    top_p=0.9,
    max_output_tokens=700,
)

model = genai.GenerativeModel(
    model_name=MODEL_NAME, generation_config=generation_config
)

SYSTEM_PROMPT = (
    "You are ChatBite, an enthusiastic Indian home chef who specializes in authentic "
    "Indian cuisine from various regions including North Indian, South Indian, Bengali, "
    "Gujarati, Maharashtrian, and more. You craft approachable, step-by-step Indian recipes "
    "using only the ingredients provided by the guest. Prioritize traditional Indian cooking "
    "techniques, spices, and flavor profiles. Always acknowledge preferences the user selects "
    "and stay strictly focused on cooking."
    "\n\nRequired response structure:"
    "\n1. Catchy Indian recipe title (use Hindi/regional names when appropriate)."
    "\n2. Quick overview mentioning the regional cuisine, serving size, and estimated time."
    "\n3. Ingredient list with quantities (OK to estimate), highlighting Indian spices and herbs."
    "\n4. Numbered cooking directions in short, clear steps using traditional Indian cooking methods "
    "(tadka, bhunao, dum, etc. when relevant)."
    "\n5. Helpful pro tip about spice balance, regional variations, or substitution ideas with Indian alternatives."
    "\n6. Optional serving suggestion with Indian accompaniments (roti, rice, raita, pickle, papad, etc.)."
    "\n\nIf the pantry looks sparse, suggest smart additions using common Indian pantry staples "
    "(cumin, coriander, turmeric, garam masala, curry leaves, etc.) without leaving the original "
    "ingredients unused. Keep the tone warm, culturally authentic, and concise."
)


@app.route("/")
def index() -> str:
    """Render the main ChatBite interface."""
    return render_template("index.html", current_year=datetime.utcnow().year)


@app.post("/api/chat")
def chat() -> Any:
    """Handle chat requests by proxying them to the Gemini model."""
    try:
        payload: Dict[str, Any] = request.get_json(force=True, silent=False) or {}
    except Exception:
        return jsonify({"error": "Invalid JSON payload."}), 400

    user_message: str = (payload.get("message") or "").strip()
    if not user_message:
        return jsonify({"error": "Please describe the ingredients you have."}), 400

    meal_type: str | None = payload.get("mealType") or None
    dietary_preference: str | None = payload.get("dietaryPreference") or None
    skill_level: str | None = payload.get("skillLevel") or None
    history: List[Dict[str, str]] = payload.get("history") or []

    guidance_parts: List[str] = [SYSTEM_PROMPT]
    if meal_type:
        guidance_parts.append(f"Focus on a {meal_type.lower()} style dish.")
    if dietary_preference and dietary_preference.lower() != "none":
        guidance_parts.append(
            f"Respect this dietary preference: {dietary_preference.lower()}."
        )
    if skill_level and skill_level.lower() != "confident":
        guidance_parts.append(
            f"Tailor the instructions to a {skill_level.lower()} home cook."
        )
    guidance_parts.append(
        "Politely steer back to cooking if the user strays into other topics."
    )

    contents: List[Dict[str, Any]] = [
        {"role": "user", "parts": [{"text": " ".join(guidance_parts)}]}
    ]

    for turn in history:
        role = turn.get("role")
        content = (turn.get("content") or "").strip()
        if role in {"user", "assistant"} and content:
            mapped_role = "user" if role == "user" else "model"
            contents.append({"role": mapped_role, "parts": [{"text": content}]})

    contents.append({"role": "user", "parts": [{"text": user_message}]})

    try:
        response = model.generate_content(contents)
    except Exception as exc:
        logger.exception("Chat completion failed: %s", exc)
        return (
            jsonify(
                {
                    "error": "The kitchen is a little busy right now. Please try again in a moment.",
                }
            ),
            502,
        )
    reply = (getattr(response, "text", "") or "").strip()
    if not reply:
        for candidate in getattr(response, "candidates", []) or []:
            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", None) if content else None
            if not parts:
                continue
            part_texts = [getattr(part, "text", "") for part in parts]
            reply = "\n".join(filter(None, part_texts)).strip()
            if reply:
                break

    if not reply:
        logger.warning("Gemini returned an empty response: %s", response)
        return (
            jsonify(
                {
                    "error": "I couldn't find the right words this time. Try another ingredient combo!",
                }
            ),
            502,
        )

    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(debug=True)
