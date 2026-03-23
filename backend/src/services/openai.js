const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/default');

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

// Типи особистості з жартівливими описами
const PERSONALITY_TYPES = [
  {
    type: 'Cosmic Procrastinator',
    scoreRange: [5, 8],
    description: 'Ти геній, який відкладає своє відкриття на потім. Можливо, завтра.',
    imageStyle: 'a lazy cosmic being floating in space surrounded by unfinished projects and empty coffee cups, cyberpunk art style',
  },
  {
    type: 'Chaotic Overthinker',
    scoreRange: [9, 11],
    description: 'Твій мозок — це 47 вкладок браузера, і жодна не закрита.',
    imageStyle: 'a person with a brain exploding into colorful thought bubbles and browser tabs, neon cyberpunk style',
  },
  {
    type: 'Accidental Philosopher',
    scoreRange: [12, 14],
    description: 'Ти знаходиш глибокий сенс у речах, які інші просто ігнорують. Наприклад, у черзі до каси.',
    imageStyle: 'a wise mystical figure sitting in a supermarket checkout line having an epiphany, surreal cyberpunk art',
  },
  {
    type: 'Professional Vibe Curator',
    scoreRange: [15, 17],
    description: 'Ти не живеш — ти створюєш естетику. Навіть твій хаос має стиль.',
    imageStyle: 'a stylish chaotic creative genius surrounded by aesthetic objects and neon lights, cyberpunk portrait',
  },
  {
    type: 'Legendary Chaos Agent',
    scoreRange: [18, 20],
    description: 'Плани? Навіщо? Ти — це сама непередбачуваність. І це твоя суперсила.',
    imageStyle: 'a wild unpredictable superhero made of pure chaotic energy and neon lightning, cyberpunk style',
  },
];

class QuizService {
  /**
   * Визначає тип особистості за score
   */
  getPersonalityType(totalScore) {
    const found = PERSONALITY_TYPES.find(
      (p) => totalScore >= p.scoreRange[0] && totalScore <= p.scoreRange[1]
    );
    // Fallback якщо score виходить за межі
    if (!found) {
      return totalScore < 5
        ? PERSONALITY_TYPES[0]
        : PERSONALITY_TYPES[PERSONALITY_TYPES.length - 1];
    }
    return found;
  }

  /**
   * Генерує жартівливі питання через Claude API
   */
  async generateQuizQuestions() {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Створи 5 жартівливих абсурдних питань для тесту особистості. 
Питання мають бути смішними, дивакуватими, але при цьому злегка натякати на характер людини.
Відповіді теж мають бути жартівливими і несподіваними.

Поверни ТІЛЬКИ валідний JSON масив, без жодного тексту до або після:
[
  {
    "question": "текст питання",
    "options": ["варіант 1", "варіант 2", "варіант 3", "варіант 4"],
    "weights": [1, 2, 3, 4]
  }
]

Правила:
- Питання українською мовою
- Питання абсурдні але смішні (наприклад: "Якби твій холодильник міг говорити, що б він сказав про тебе?")
- Відповіді короткі, максимум 8 слів кожна
- weights від 1 до 4 в порядку зростання`,
          },
        ],
      });

      const raw = message.content[0].text.trim();
      const start = raw.indexOf("[");
      const end = raw.lastIndexOf("]");
      if (start === -1 || end === -1) throw new Error("No JSON array found in response");
      const text = raw.slice(start, end + 1);
      const questions = JSON.parse(text);
      return questions;
    } catch (error) {
      console.error('Помилка генерації питань через Claude:', error);
      return this.getStaticQuestions();
    }
  }

  /**
   * Статичні питання як fallback
   */
  getStaticQuestions() {
    return [
      {
        question: 'Якби твій холодильник міг говорити, що б він сказав про тебе?',
        options: [
          'Він би плакав і просив замінити власника',
          'Він би пишався нашою дружбою',
          'Він би написав мемуари про самотність',
          'Він би вже давно втік',
        ],
        weights: [1, 2, 3, 4],
      },
      {
        question: 'Твій кіт / уявний кіт дивиться на тебе. Що він думає?',
        options: [
          '"Цей людський мусить мені служити"',
          '"Ти мій улюблений диван"',
          '"Де моя їжа, філософе?"',
          '"Я просто тут живу"',
        ],
        weights: [1, 2, 3, 4],
      },
      {
        question: 'Яка твоя реакція коли Wi-Fi зникає на 5 хвилин?',
        options: [
          'Починаю переосмислювати своє існування',
          'Нарешті читаю книгу зі стосу "прочитаю колись"',
          'Дзвоню провайдеру кожні 30 секунд',
          'Я цього і чекав. Виживання починається.',
        ],
        weights: [1, 2, 3, 4],
      },
      {
        question: 'Як ти обираєш що їсти на вечерю?',
        options: [
          'Відкриваю холодильник 47 разів і закриваю',
          'Їм те що найближче до мене',
          'Складаю таблицю плюсів і мінусів',
          'Замовляю доставку і відчуваю себе переможцем',
        ],
        weights: [1, 2, 3, 4],
      },
      {
        question: 'Якби ти міг мати суперсилу, яку б обрав?',
        options: [
          'Телепортація — щоб ніколи не спізнюватись (але завжди спізнюватись)',
          'Читання думок — і одразу про це пошкодував би',
          'Невидимість — для уникнення незручних розмов',
          'Зупинка часу — щоб нарешті виспатись',
        ],
        weights: [1, 2, 3, 4],
      },
    ];
  }

  /**
   * Генерує зображення через Stable Diffusion
   */
  async generateImage(personalityType) {
    try {
      const prompt = `${personalityType.imageStyle}, high quality digital art, vivid neon colors, dark background, detailed, professional illustration`;

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
      console.error('Помилка генерації зображення:', error);
      return `https://via.placeholder.com/1024x1024/0d0d2b/00ffff?text=${encodeURIComponent(personalityType.type)}`;
    }
  }
}

module.exports = new QuizService();