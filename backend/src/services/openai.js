const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/default');

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

class QuizService {
  shuffleArray(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Generates playful quiz questions via Claude API
   */
  async generateQuizQuestions() {
    try {
      const randomSeed = Math.random().toString(36).slice(2, 10);
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        temperature: 1,
        messages: [
          {
            role: 'user',
            content: `Create 5 funny absurd questions for a personality quiz.
Questions should be humorous and weird, while still hinting at character traits.
Answers should also be playful and unexpected.

Return ONLY a valid JSON array, with no text before or after:
[
  {
    "question": "question text",
    "options": ["option 1", "option 2", "option 3", "option 4"],
    "weights": [1, 2, 3, 4]
  }
]

Rules:
- Questions must be in English
- Questions must be absurd but funny (for example: "If your fridge could talk, what would it say about you?")
- Answers must be short, maximum 8 words each
- weights must be from 1 to 4 in ascending order
- Use this randomness token to diversify the set: ${randomSeed}`,
          },
        ],
      });

      const raw = message.content[0].text.trim();
      const start = raw.indexOf("[");
      const end = raw.lastIndexOf("]");
      if (start === -1 || end === -1) throw new Error("No JSON array found in response");
      const text = raw.slice(start, end + 1);
      const questions = JSON.parse(text);
      return this.shuffleArray(questions);
    } catch (error) {
      console.error('Claude question generation error:', error);
      throw new Error(`Claude question generation failed: ${error.message}`);
    }
  }

  /**
   * Generates personality result from quiz answers
   */
  async generatePersonalityResult(answers) {
    if (!config.anthropic.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is missing in backend .env');
    }

    try {
      const answersPayload = answers.map((item, index) => ({
        index: index + 1,
        question: item.question,
        answer: item.answer,
      }));

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 900,
        temperature: 1,
        messages: [
          {
            role: 'user',
            content: `Based on this quiz session, create a unique personality result.

Quiz answers (JSON):
${JSON.stringify(answersPayload, null, 2)}

Return ONLY valid JSON in this exact shape:
{
  "personalityType": "2-5 words, absurd and hilarious, non-human archetype",
  "description": "1 short sentence, witty and logically tied to answers",
  "imageStyle": "Detailed visual prompt for cyberpunk/digital-art portrait matching the personality"
}

Rules:
- Language: English
- Must be unique per answer set, not a generic template
- Tone: ridiculous, meme-worthy, coherent
- personalityType MUST be non-human and object/creature-like (examples: Battle Toaster, Space Banana, Gum Gladiator, Neon Croissant Oracle)
- Never use human roles like philosopher, curator, agent, thinker, strategist, hero
- description must be concise (about 10-16 words), punchy, and funny
- imageStyle must be concrete and visually rich`,
          },
        ],
      });

      const raw = message.content[0].text.trim();
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('No JSON object found in response');
      const parsed = JSON.parse(raw.slice(start, end + 1));

      if (!parsed.personalityType || !parsed.description || !parsed.imageStyle) {
        throw new Error('Claude response missing required personality fields');
      }

      // Keep result copy short and punchy for UI cards.
      const firstSentence = String(parsed.description).split(/[.!?]/)[0].trim();
      const shortDescription = firstSentence.split(/\s+/).slice(0, 16).join(' ');

      return {
        personalityType: String(parsed.personalityType).trim(),
        description: shortDescription,
        imageStyle: String(parsed.imageStyle).trim(),
      };
    } catch (error) {
      console.error('Claude personality generation error:', error);
      throw new Error(`Personality generation failed: ${error.message}`);
    }
  }

  /**
   * Generates image via Stable Diffusion
   */
  async generateImage(imageStyle) {
    if (!config.huggingface.apiKey) {
      throw new Error('HUGGINGFACE_API_KEY is missing in backend .env');
    }

    try {
      const prompt = `${imageStyle}, high quality digital art, vivid neon colors, dark background, detailed, professional illustration`;

      const response = await fetch(
        'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.huggingface.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              negative_prompt: 'blurry, low quality, distorted, ugly, text, watermark',
              width: 1024,
              height: 1024,
              num_inference_steps: 30,
              guidance_scale: 7.5,
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HuggingFace error: ${response.status} ${errText}`);
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      const base64Image = imageBuffer.toString('base64');
      return `data:image/png;base64,${base64Image}`;
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
}

module.exports = new QuizService();