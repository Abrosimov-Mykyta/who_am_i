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
        max_tokens: 4096,
        temperature: 1,
        messages: [
          {
            role: 'user',
            content: `Create exactly 10 questions for a personality quiz.

Goal: questions are funny, surreal, and absurd — but each question should probe a real personality axis (examples: social energy, patience, risk-taking, loyalty, honesty vs tact, chaos vs order, optimism, how you handle stress or conflict, need for control, curiosity). The player should feel like they are choosing "who they are," not random jokes only.

Each question needs 4 answer options. Options must stay witty and weird, but each option should lean a different shade of that trait so answers accumulate into a coherent picture of the person. No single correct answer — all four can be valid life choices.

Do NOT tie the quiz to any movie, franchise, workplace, or "monster company" setting. No references to Monsters Inc., scare floors, offices, or corporate satire. The world can be everyday life, dream logic, metaphors, or nonsense scenarios — as long as personality signal comes through.

Tone: PG, playful, never cruel or bigoted. No graphic horror or gore.

Return ONLY a valid JSON array — no markdown, no text before or after:
[
  {
    "question": "question text",
    "options": ["option 1", "option 2", "option 3", "option 4"],
    "weights": [1, 2, 3, 4]
  }
]

Rules:
- Exactly 10 objects in the array
- English only
- Each option: maximum 10 words
- weights must be [1, 2, 3, 4] in ascending order for every question
- Vary question styles across the set (hypotheticals, "what would you do," preferences, weird metaphors)
- Diversify with this token: ${randomSeed}`,
          },
        ],
      });

      const raw = message.content[0].text.trim();
      const start = raw.indexOf("[");
      const end = raw.lastIndexOf("]");
      if (start === -1 || end === -1) throw new Error("No JSON array found in response");
      const text = raw.slice(start, end + 1);
      const questions = JSON.parse(text);
      if (!Array.isArray(questions) || questions.length < 10) {
        throw new Error(`Expected 10 quiz questions, got ${questions?.length ?? 'invalid'} — retry the request`);
      }
      if (questions.length > 10) {
        questions.length = 10;
      }
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
        max_tokens: 1200,
        temperature: 1,
        messages: [
          {
            role: 'user',
            content: `You are given someone's answers to an absurd personality quiz. From those answers, invent ONE original monster that feels like *them* — not a random creature.

The monster must read as **alive**: a clear voice, mood, and body language. Match emotional tone to the answers:
- Some people might get a goofy, friendly beast; others a dry, side-eye creature; others anxious and sweet; others sharp-tongued or short-fused; others calm and cryptic. Let the quiz **drive** whether this monster leans warm, silly, brooding, irritable, heroic-chaotic, etc. Do not default everything to "nice comedy sidekick."

No movie or franchise tie-ins. No corporate/workplace monster jokes, no "scare floor" or office-parody titles.

Quiz answers (JSON):
${JSON.stringify(answersPayload, null, 2)}

Return ONLY valid JSON in this exact shape:
{
  "personalityType": "3-7 words: a vivid monster name or epithet (creature, hybrid, or mythic vibe — not a plain human job title)",
  "description": "ONE short sentence: concrete habit, craving, or attitude that ties directly to their answers — feels like a character, not a horoscope",
  "imageStyle": "Visual prompt for ONE monster portrait in a neon cyberpunk night city"
}

Rules:
- Language: English
- personalityType: must be non-human / monstrous (could be biological, elemental, chimeric, or absurd). Avoid bland labels like "philosopher" or "strategist" unless clearly wrapped in monster imagery.
- description: about 10-20 words; specific and alive; can be funny OR tense OR tender depending on what the answers suggest
- imageStyle: single expressive creature, neon cyberpunk city (wet pavement, skyscraper lights, cyan/orange/magenta). Include **facial expression and posture** that match the personality you inferred (grin, scowl, tired eyes, proud stance, etc.). Materials can mix fur, scales, slime, horns, glow, odd proportions — cinematic illustration, not gore, no text in frame.
- Unique to this answer set; no generic filler`,
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

      const firstSentence = String(parsed.description).split(/[.!?]/)[0].trim();
      const shortDescription = firstSentence.split(/\s+/).slice(0, 20).join(' ');

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
   * Generates image via fal-ai through HuggingFace router
   */
  async generateImage(imageStyle) {
    if (!config.huggingface.apiKey) {
      throw new Error('HUGGINGFACE_API_KEY is missing in backend .env');
    }

    try {
      const prompt = `${imageStyle}, high quality digital art, vivid neon colors, dark background, detailed, professional illustration`;

      const response = await fetch(
        'https://router.huggingface.co/fal-ai/flux/schnell',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.huggingface.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            image_size: 'square_hd',
            num_inference_steps: 4,
            num_images: 1,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HuggingFace error: ${response.status} ${errText}`);
      }

      // fal-ai returns JSON with image URL, not raw binary
      const result = await response.json();
      const imageUrl = result.images[0].url;

      const imgResponse = await fetch(imageUrl);
      if (!imgResponse.ok) {
        throw new Error(`Failed to download image from fal-ai: ${imgResponse.status}`);
      }

      return Buffer.from(await imgResponse.arrayBuffer());
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
}

module.exports = new QuizService();
