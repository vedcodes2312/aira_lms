"""
Gemini API integration for AIRA course generation.
Uses gemini-2.0-flash (free tier) to generate structured JSON courses.
"""

import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-3.6-flash"

genai.configure(api_key=GEMINI_API_KEY)


def build_prompt(
    topic: str,
    domain: str,
    profession: str,
    knowledge_level: str,
    learning_goal: str,
    explanation_style: str,
) -> str:
    style_hints = {
        "Simple": "Use plain language, analogies, and avoid jargon. Explain like the learner is new to the field.",
        "Practical": "Focus on real-world applications, use-cases, and hands-on examples relevant to the learner's profession.",
        "Technical": "Include mathematical notation, formal definitions, algorithms, code snippets where useful, and deep technical detail.",
        "Balanced": "Mix conceptual clarity with some technical depth and practical examples.",
    }

    profession_context = {
        "Teacher": "Use educational framing, classroom analogies, and pedagogical examples. Show how to teach this concept.",
        "Business Professional": "Use business scenarios, ROI examples, corporate use-cases, and avoid heavy math.",
        "Developer": "Include code examples, system design considerations, implementation tips, and technical depth.",
        "Student": "Build from fundamentals, use step-by-step explanations, relate to academic concepts.",
        "Researcher": "Include formal definitions, cite relevant techniques, discuss limitations and open research questions.",
    }

    style_instruction = style_hints.get(explanation_style, style_hints["Balanced"])
    profession_instruction = next(
        (v for k, v in profession_context.items() if k.lower() in profession.lower()),
        "Tailor examples to the learner's background and professional context.",
    )

    return f"""You are AIRA, a personalized AI/Quantum Computing learning platform.

Generate a complete, structured learning course on the topic: "{topic}" (Domain: {domain})

LEARNER PROFILE:
- Profession: {profession}
- Knowledge Level: {knowledge_level}
- Learning Goal: {learning_goal}
- Explanation Style: {explanation_style}

STYLE INSTRUCTIONS:
- {style_instruction}
- {profession_instruction}
- Knowledge level is {knowledge_level}: {"Start from scratch with no assumptions." if knowledge_level == "Beginner" else "Assume some familiarity with basics." if knowledge_level == "Intermediate" else "Assume strong technical background."}

OUTPUT FORMAT — Return ONLY valid JSON, no markdown, no code fences, no extra text:

{{
  "title": "Course title here",
  "description": "2-3 sentence course description tailored to the learner",
  "difficulty": "Beginner|Intermediate|Advanced",
  "modules": [
    {{
      "title": "Module title",
      "order": 1,
      "lessons": [
        {{
          "title": "Lesson title",
          "order": 1,
          "content": {{
            "introduction": "2 clear sentences introducing the lesson concept",
            "main_explanation": "2 focused, insightful paragraphs explaining the concept, tailored to the learner profile and profession",
            "how_it_works": "Step-by-step numbered breakdown (1, 2, 3) of the process or mechanism",
            "real_world_example": "A concrete, relatable example specifically relevant to a {profession}",
            "practical_applications": "3 bullet points of practical real-world applications",
            "important_concepts": "2-3 key technical or domain terms defined clearly",
            "limitations": "1-2 sentences on limitations or edge cases",
            "summary": "2 sentences summarizing the core takeaway",
            "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
          }},
          "quiz": [
            {{
              "question": "Clear multiple choice question testing comprehension",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct_answer": 0,
              "explanation": "Why option A is correct and why other options are incorrect"
            }},
            {{
              "question": "Second scenario-based question testing practical application",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct_answer": 1,
              "explanation": "Why option B is the right answer"
            }}
          ]
        }}
      ]
    }}
  ]
}}

REQUIREMENTS:
- Generate exactly 2 modules
- Each module must have exactly 2 lessons (4 lessons total)
- Keep text rich, educational, but concise so it fits within single-response limits
- real_world_example must directly reference the learner's specific profession ({profession})
- Return ONLY valid JSON matching the schema above"""


def clean_json_response(text: str) -> str:
    """Strip any markdown fences if Gemini adds them despite instructions."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def generate_course(
    topic: str,
    domain: str,
    profession: str,
    knowledge_level: str,
    learning_goal: str,
    explanation_style: str,
) -> dict:
    """Call Gemini API and return parsed course JSON."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY is not configured. Add it to backend/.env")

    prompt = build_prompt(topic, domain, profession, knowledge_level, learning_goal, explanation_style)

    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        generation_config={
            "temperature": 0.2,
            "response_mime_type": "application/json",
        },
    )

    response = model.generate_content(prompt)
    raw_text = response.text
    cleaned = clean_json_response(raw_text)

    try:
        course_data = json.loads(cleaned, strict=False)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\n\nRaw response (first 500 chars):\n{raw_text[:500]}")

    return course_data


def translate_lesson_content(content_dict: dict, target_language: str) -> dict:
    """Translate and adapt lesson content into target language (e.g. Hinglish, Hindi, Tamil, Telugu, Marathi)."""
    if target_language.lower() in ["english", "en"]:
        return content_dict

    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        # Fallback if no key
        return content_dict

    lang_instructions = {
        "hinglish": "Translate the content into natural, easy-to-understand conversational Hinglish (Hindi written in Roman/Latin script, the way tech professionals speak in India). Keep core technical terms (like Qubit, Neural Network, Backpropagation, Weights, ReLU, Superposition) in English.",
        "hindi": "Translate the content into clear, educational Hindi (Devanagari script). Keep core English acronyms (AI, CNN, LLM, Qubit) in brackets where helpful.",
        "tamil": "Translate the content into clear, educational Tamil. Keep core technical terms and acronyms in English/transliterated.",
        "telugu": "Translate the content into clear, educational Telugu. Keep core technical terms and acronyms in English/transliterated.",
        "marathi": "Translate the content into clear, educational Marathi. Keep core technical terms and acronyms in English/transliterated.",
    }

    instruction = lang_instructions.get(
        target_language.lower(),
        f"Translate the content into {target_language}. Keep core technical terms intact.",
    )

    prompt = f"""You are AIRA's pedagogical translation engine.
{instruction}

Translate the following lesson JSON content. Preserve all JSON keys exactly:
- introduction
- main_explanation
- how_it_works
- real_world_example
- practical_applications
- important_concepts
- limitations
- summary
- key_takeaways (array of strings)

INPUT CONTENT JSON:
{json.dumps(content_dict, ensure_ascii=False)}

OUTPUT FORMAT: Return ONLY the translated valid JSON object matching the exact keys above. No markdown, no fences."""

    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        )
        response = model.generate_content(prompt)
        raw_text = response.text
        cleaned = clean_json_response(raw_text)
        translated_data = json.loads(cleaned, strict=False)
        return translated_data
    except Exception as e:
        print(f"Translation error: {e}")
        return content_dict
