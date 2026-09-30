import os
import json
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger("retail_agent.llm")

def get_groq_api_key() -> Optional[str]:
    return os.environ.get("GROQ_API_KEY")

def call_groq_llm(
    prompt: str,
    system_prompt: str = "You are an expert retail AI advisor for small local business owners.",
    model: str = "llama-3.3-70b-versatile",
    temperature: float = 0.2,
    max_tokens: int = 1500,
    api_key: Optional[str] = None
) -> str:
    """
    Invokes Groq LLM with fallback to llama-3.1-8b-instant or deterministic reasoning.
    """
    key = api_key or get_groq_api_key()
    
    if key and key.strip() and key.strip() != "YOUR_GROQ_API_KEY":
        try:
            from groq import Groq
            client = Groq(api_key=key.strip())
            
            # Primary attempt with 70B
            try:
                response = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                return response.choices[0].message.content
            except Exception as e_70b:
                logger.warning(f"Groq 70b failed ({str(e_70b)}), trying llama-3.1-8b-instant fallback...")
                response = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    model="llama-3.1-8b-instant",
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq invocation failed: {str(e)}. Using grounded heuristic generation.")
    
    # If no valid Groq key or network failure, return None so callers use the grounded domain reasoning engine
    return ""
