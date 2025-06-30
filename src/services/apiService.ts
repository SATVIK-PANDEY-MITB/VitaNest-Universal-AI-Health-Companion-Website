import axios from 'axios';

// API Configuration with your actual keys
const API_CONFIG = {
  tavus: {
    baseURL: 'https://tavusapi.com/v2',
    apiKey: import.meta.env.VITE_TAVUS_API_KEY || '39d63f8c87254c7ca4eda584ca070c76'
  },
  elevenLabs: {
    baseURL: 'https://api.elevenlabs.io/v1',
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_f8df9590e222391f43b0c54d587266017594a56340561c6c'
  },
  revenueCat: {
    baseURL: 'https://api.revenuecat.com/v1',
    apiKey: import.meta.env.VITE_REVENUECAT_API_KEY || 'proje28022f1'
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || ''
  }
};

// Tavus AI Video Generation Service
export const tavusService = {
  async generateHealthVideo(script: string, persona: string = 'default') {
    try {
      if (!API_CONFIG.tavus.apiKey || API_CONFIG.tavus.apiKey === 'your_tavus_api_key_here') {
        console.warn('Tavus API key not configured');
        return { error: 'Tavus API key not configured' };
      }

      const response = await axios.post(
        `${API_CONFIG.tavus.baseURL}/videos`,
        {
          script,
          persona_id: persona,
          callback_url: window.location.origin + '/api/tavus/callback',
          video_name: `Health_Video_${Date.now()}`,
          properties: {
            voice_settings: {
              stability: 0.8,
              similarity_boost: 0.7
            }
          }
        },
        {
          headers: {
            'x-api-key': API_CONFIG.tavus.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Tavus API Error:', error);
      if (error.response?.status === 401) {
        return { error: 'Invalid Tavus API key. Please check your configuration.' };
      }
      return { error: 'Video generation failed', details: error };
    }
  },

  async getVideoStatus(videoId: string) {
    try {
      if (!API_CONFIG.tavus.apiKey || API_CONFIG.tavus.apiKey === 'your_tavus_api_key_here') {
        return { error: 'Tavus API key not configured' };
      }

      const response = await axios.get(
        `${API_CONFIG.tavus.baseURL}/videos/${videoId}`,
        {
          headers: {
            'x-api-key': API_CONFIG.tavus.apiKey
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Tavus Status Error:', error);
      if (error.response?.status === 401) {
        return { error: 'Invalid Tavus API key' };
      }
      return { error: 'Status check failed' };
    }
  },

  async listPersonas() {
    try {
      if (!API_CONFIG.tavus.apiKey || API_CONFIG.tavus.apiKey === 'your_tavus_api_key_here') {
        return { error: 'Tavus API key not configured' };
      }

      const response = await axios.get(
        `${API_CONFIG.tavus.baseURL}/personas`,
        {
          headers: {
            'x-api-key': API_CONFIG.tavus.apiKey
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Tavus Personas Error:', error);
      if (error.response?.status === 401) {
        return { error: 'Invalid Tavus API key' };
      }
      return { error: 'Failed to fetch personas' };
    }
  }
};

// ElevenLabs Text-to-Speech Service
export const elevenLabsService = {
  async textToSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB') {
    try {
      if (!API_CONFIG.elevenLabs.apiKey || API_CONFIG.elevenLabs.apiKey === 'your_elevenlabs_api_key_here') {
        console.warn('ElevenLabs API key not configured');
        return null;
      }

      const response = await axios.post(
        `${API_CONFIG.elevenLabs.baseURL}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'xi-api-key': API_CONFIG.elevenLabs.apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );
      return URL.createObjectURL(response.data);
    } catch (error: any) {
      console.error('ElevenLabs API Error:', error);
      if (error.response?.status === 401) {
        console.error('Invalid ElevenLabs API key');
      }
      return null;
    }
  },

  async getVoices() {
    try {
      if (!API_CONFIG.elevenLabs.apiKey || API_CONFIG.elevenLabs.apiKey === 'your_elevenlabs_api_key_here') {
        return [];
      }

      const response = await axios.get(
        `${API_CONFIG.elevenLabs.baseURL}/voices`,
        {
          headers: {
            'xi-api-key': API_CONFIG.elevenLabs.apiKey
          }
        }
      );
      return response.data.voices;
    } catch (error: any) {
      console.error('ElevenLabs Voices Error:', error);
      return [];
    }
  },

  async generateSpeech(text: string, voiceSettings?: any) {
    try {
      const voices = await this.getVoices();
      const healthVoice = voices.find((v: any) => v.name.includes('Health') || v.name.includes('Professional')) || voices[0];
      
      return await this.textToSpeech(text, healthVoice?.voice_id);
    } catch (error) {
      console.error('Speech generation error:', error);
      return null;
    }
  }
};

// RevenueCat Subscription Management Service
export const revenueCatService = {
  async getSubscriberInfo(userId: string) {
    try {
      if (!API_CONFIG.revenueCat.apiKey || API_CONFIG.revenueCat.apiKey === 'your_revenuecat_api_key_here') {
        console.warn('RevenueCat API key not configured');
        return { 
          error: 'RevenueCat API key not configured',
          subscriber: {
            subscriptions: {},
            entitlements: {},
            original_app_user_id: userId
          }
        };
      }

      const response = await axios.get(
        `${API_CONFIG.revenueCat.baseURL}/subscribers/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${API_CONFIG.revenueCat.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('RevenueCat API Error:', error);
      
      // Return a mock response for development
      if (error.response?.status === 401) {
        console.warn('Invalid RevenueCat API key, using mock data for development');
        return { 
          error: 'Invalid RevenueCat API key',
          subscriber: {
            subscriptions: {},
            entitlements: {},
            original_app_user_id: userId
          }
        };
      }
      
      return { 
        error: 'Subscription info unavailable',
        subscriber: {
          subscriptions: {},
          entitlements: {},
          original_app_user_id: userId
        }
      };
    }
  },

  async updateSubscription(userId: string, productId: string) {
    try {
      if (!API_CONFIG.revenueCat.apiKey || API_CONFIG.revenueCat.apiKey === 'your_revenuecat_api_key_here') {
        return { error: 'RevenueCat API key not configured' };
      }

      const response = await axios.post(
        `${API_CONFIG.revenueCat.baseURL}/subscribers/${userId}/purchases`,
        {
          product_id: productId,
          price: productId === 'premium_monthly' ? 9.99 : 99.99,
          currency: 'USD',
          store: 'app_store'
        },
        {
          headers: {
            'Authorization': `Bearer ${API_CONFIG.revenueCat.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('RevenueCat Update Error:', error);
      if (error.response?.status === 401) {
        return { error: 'Invalid RevenueCat API key' };
      }
      return { error: 'Subscription update failed' };
    }
  },

  async getOfferings() {
    try {
      if (!API_CONFIG.revenueCat.apiKey || API_CONFIG.revenueCat.apiKey === 'your_revenuecat_api_key_here') {
        return { error: 'RevenueCat API key not configured' };
      }

      const response = await axios.get(
        `${API_CONFIG.revenueCat.baseURL}/offerings`,
        {
          headers: {
            'Authorization': `Bearer ${API_CONFIG.revenueCat.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('RevenueCat Offerings Error:', error);
      if (error.response?.status === 401) {
        return { error: 'Invalid RevenueCat API key' };
      }
      return { error: 'Failed to fetch offerings' };
    }
  }
};

// Enhanced Health AI Service with intelligent responses and proactive advice
export const healthAIService = {
  // Advanced health knowledge base
  healthKnowledge: {
    symptoms: {
      'headache': {
        causes: ['stress', 'dehydration', 'lack of sleep', 'eye strain', 'tension'],
        advice: 'Try drinking water, resting in a dark room, and applying a cold compress. If headaches persist or worsen, consult a healthcare provider.',
        urgency: 'low'
      },
      'fever': {
        causes: ['infection', 'inflammation', 'immune response'],
        advice: 'Rest, stay hydrated, and monitor your temperature. Seek medical attention if fever exceeds 103°F (39.4°C) or persists for more than 3 days.',
        urgency: 'medium'
      },
      'chest pain': {
        causes: ['heart issues', 'muscle strain', 'anxiety', 'acid reflux'],
        advice: 'Chest pain can be serious. If you experience severe chest pain, shortness of breath, or pain radiating to your arm or jaw, seek immediate medical attention.',
        urgency: 'high'
      },
      'fatigue': {
        causes: ['poor sleep', 'stress', 'dehydration', 'nutritional deficiency', 'underlying conditions'],
        advice: 'Ensure adequate sleep (7-9 hours), maintain a balanced diet, stay hydrated, and manage stress. Persistent fatigue may require medical evaluation.',
        urgency: 'low'
      },
      'nausea': {
        causes: ['food poisoning', 'motion sickness', 'pregnancy', 'medication side effects', 'stress'],
        advice: 'Try sipping clear fluids, eating bland foods like crackers, and resting. If accompanied by severe symptoms, seek medical care.',
        urgency: 'medium'
      }
    },
    medications: {
      'aspirin': {
        uses: ['pain relief', 'fever reduction', 'heart health'],
        sideEffects: ['stomach irritation', 'bleeding risk'],
        interactions: ['blood thinners', 'certain medications'],
        advice: 'Take with food to reduce stomach irritation. Consult your doctor about long-term use.'
      },
      'ibuprofen': {
        uses: ['pain relief', 'inflammation reduction', 'fever reduction'],
        sideEffects: ['stomach upset', 'kidney issues with long-term use'],
        interactions: ['blood pressure medications', 'blood thinners'],
        advice: 'Take with food and plenty of water. Avoid long-term use without medical supervision.'
      },
      'acetaminophen': {
        uses: ['pain relief', 'fever reduction'],
        sideEffects: ['liver damage with overdose'],
        interactions: ['alcohol', 'certain medications'],
        advice: 'Do not exceed recommended dose. Avoid alcohol while taking this medication.'
      }
    },
    wellness: {
      'exercise': {
        benefits: ['cardiovascular health', 'mental wellbeing', 'weight management', 'bone strength'],
        recommendations: '150 minutes of moderate aerobic activity per week, plus strength training twice weekly.',
        tips: 'Start slowly, choose activities you enjoy, and gradually increase intensity.'
      },
      'nutrition': {
        benefits: ['energy levels', 'immune function', 'disease prevention', 'mental clarity'],
        recommendations: 'Eat a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats.',
        tips: 'Stay hydrated, limit processed foods, and practice portion control.'
      },
      'sleep': {
        benefits: ['cognitive function', 'immune system', 'emotional regulation', 'physical recovery'],
        recommendations: '7-9 hours of quality sleep per night for adults.',
        tips: 'Maintain a consistent sleep schedule, create a relaxing bedtime routine, and limit screen time before bed.'
      }
    }
  },

  // Intelligent response generation
  async getChatResponse(message: string, userContext?: any): Promise<string> {
    try {
      console.log('🤖 Generating intelligent AI response for:', message);
      
      // Analyze the message for health-related keywords
      const analysis = this.analyzeMessage(message, userContext);
      
      // Try OpenAI first if API key is available
      if (API_CONFIG.openai.apiKey && API_CONFIG.openai.apiKey !== 'your_openai_api_key_here') {
        const systemPrompt = this.generateSystemPrompt(userContext, analysis);
        
        const response = await axios.post(
          `${API_CONFIG.openai.baseURL}/chat/completions`,
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 800,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return response.data.choices[0].message.content;
      }
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      if (error.response?.status === 401) {
        console.warn('Invalid OpenAI API key, falling back to intelligent local responses');
      }
    }

    // Fallback to intelligent local responses
    return this.generateIntelligentResponse(message, userContext);
  },

  // Analyze user message for health context
  analyzeMessage(message: string, userContext?: any) {
    const lowerMessage = message.toLowerCase();
    const analysis = {
      type: 'general',
      symptoms: [] as string[],
      medications: [] as string[],
      urgency: 'low',
      topics: [] as string[],
      intent: 'question'
    };

    // Detect symptoms
    Object.keys(this.healthKnowledge.symptoms).forEach(symptom => {
      if (lowerMessage.includes(symptom)) {
        analysis.symptoms.push(symptom);
        analysis.type = 'symptom';
        const symptomData = this.healthKnowledge.symptoms[symptom];
        if (symptomData.urgency === 'high') analysis.urgency = 'high';
        else if (symptomData.urgency === 'medium' && analysis.urgency === 'low') analysis.urgency = 'medium';
      }
    });

    // Detect medications
    Object.keys(this.healthKnowledge.medications).forEach(med => {
      if (lowerMessage.includes(med)) {
        analysis.medications.push(med);
        analysis.type = 'medication';
      }
    });

    // Detect wellness topics
    Object.keys(this.healthKnowledge.wellness).forEach(topic => {
      if (lowerMessage.includes(topic)) {
        analysis.topics.push(topic);
        analysis.type = 'wellness';
      }
    });

    // Detect intent
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('why')) {
      analysis.intent = 'question';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('advice')) {
      analysis.intent = 'help';
    } else if (lowerMessage.includes('feel') || lowerMessage.includes('experiencing')) {
      analysis.intent = 'symptom_report';
    }

    return analysis;
  },

  // Generate system prompt for OpenAI
  generateSystemPrompt(userContext?: any, analysis?: any): string {
    let prompt = `You are VitaNest AI, an advanced healthcare assistant. You provide helpful, accurate health information while always recommending users consult healthcare professionals for medical advice.

Key guidelines:
- Be empathetic and supportive
- Provide evidence-based information
- Always recommend professional medical consultation for serious concerns
- Personalize responses based on user context
- Be proactive in offering relevant health advice
- Use a warm, professional tone`;

    if (userContext?.healthProfile) {
      prompt += `\n\nUser Health Context:`;
      if (userContext.healthProfile.age) prompt += `\n- Age: ${userContext.healthProfile.age}`;
      if (userContext.healthProfile.conditions) prompt += `\n- Conditions: ${userContext.healthProfile.conditions.join(', ')}`;
      if (userContext.healthProfile.allergies) prompt += `\n- Allergies: ${userContext.healthProfile.allergies.join(', ')}`;
    }

    if (analysis?.urgency === 'high') {
      prompt += `\n\nIMPORTANT: This appears to be a high-urgency health concern. Emphasize the importance of seeking immediate medical attention.`;
    }

    return prompt;
  },

  // Generate intelligent local responses
  generateIntelligentResponse(message: string, userContext?: any): string {
    const analysis = this.analyzeMessage(message, userContext);
    
    // Simulate thinking delay for realism
    const responses = [];

    // Handle high urgency symptoms
    if (analysis.urgency === 'high') {
      return `⚠️ I'm concerned about the symptoms you're describing. ${this.getSymptomAdvice(analysis.symptoms)} This could be serious, so I strongly recommend seeking immediate medical attention or calling emergency services if you're experiencing severe symptoms. Your health and safety are the top priority.

In the meantime, try to stay calm and avoid any strenuous activity. If possible, have someone stay with you or contact a trusted person who can help.

Is there anything specific about your symptoms that's particularly concerning you right now?`;
    }

    // Handle specific symptoms
    if (analysis.symptoms.length > 0) {
      const symptomAdvice = this.getSymptomAdvice(analysis.symptoms);
      responses.push(`I understand you're experiencing ${analysis.symptoms.join(' and ')}. ${symptomAdvice}`);
      
      // Add personalized advice based on user context
      if (userContext?.healthProfile?.conditions) {
        responses.push(`Given your medical history of ${userContext.healthProfile.conditions.join(', ')}, it's especially important to monitor these symptoms closely.`);
      }
      
      responses.push(`Here are some general recommendations:\n• Stay hydrated\n• Get adequate rest\n• Monitor your symptoms\n• Avoid triggers if known\n• Consider keeping a symptom diary`);
      
      if (analysis.urgency === 'medium') {
        responses.push(`If symptoms persist or worsen, please consult with a healthcare provider within the next day or two.`);
      }
    }

    // Handle medication questions
    if (analysis.medications.length > 0) {
      const medAdvice = this.getMedicationAdvice(analysis.medications);
      responses.push(medAdvice);
      
      if (userContext?.healthProfile?.allergies) {
        responses.push(`⚠️ Important: Please remember your known allergies to ${userContext.healthProfile.allergies.join(', ')} when considering any medications.`);
      }
    }

    // Handle wellness topics
    if (analysis.topics.length > 0) {
      const wellnessAdvice = this.getWellnessAdvice(analysis.topics);
      responses.push(wellnessAdvice);
    }

    // Proactive health suggestions
    if (analysis.type === 'general') {
      responses.push(this.getProactiveAdvice(userContext));
    }

    // Add encouraging closing
    responses.push(`Remember, I'm here to support your health journey. Feel free to ask me about any health concerns, medication questions, or wellness tips. How else can I help you today?`);

    return responses.join('\n\n');
  },

  // Get symptom-specific advice
  getSymptomAdvice(symptoms: string[]): string {
    const advice = symptoms.map(symptom => {
      const data = this.healthKnowledge.symptoms[symptom];
      return data ? data.advice : 'Monitor the symptom and consult a healthcare provider if it persists.';
    });
    
    return advice.join(' ');
  },

  // Get medication-specific advice
  getMedicationAdvice(medications: string[]): string {
    const advice = medications.map(med => {
      const data = this.healthKnowledge.medications[med];
      if (data) {
        return `Regarding ${med}: ${data.advice} Common uses include ${data.uses.join(', ')}. Be aware of potential side effects like ${data.sideEffects.join(', ')}.`;
      }
      return `For ${med}, please consult with your pharmacist or healthcare provider for specific guidance on proper use, dosage, and potential interactions.`;
    });
    
    return advice.join('\n\n');
  },

  // Get wellness advice
  getWellnessAdvice(topics: string[]): string {
    const advice = topics.map(topic => {
      const data = this.healthKnowledge.wellness[topic];
      if (data) {
        return `For ${topic}: ${data.recommendations} Benefits include ${data.benefits.join(', ')}. Tip: ${data.tips}`;
      }
      return `${topic} is an important aspect of overall health. I'd be happy to provide more specific guidance if you have particular questions.`;
    });
    
    return advice.join('\n\n');
  },

  // Generate proactive health advice
  getProactiveAdvice(userContext?: any): string {
    const currentHour = new Date().getHours();
    const advice = [];

    // Time-based advice
    if (currentHour < 12) {
      advice.push("🌅 Good morning! Starting your day with a glass of water and some light stretching can boost your energy and mood.");
    } else if (currentHour < 17) {
      advice.push("☀️ Afternoon reminder: Take a moment to check your posture, stay hydrated, and consider a brief walk if you've been sitting for a while.");
    } else {
      advice.push("🌙 Evening tip: Begin winding down for better sleep by dimming lights and avoiding screens 1-2 hours before bedtime.");
    }

    // Personalized advice based on user profile
    if (userContext?.healthProfile) {
      if (userContext.healthProfile.age && userContext.healthProfile.age > 50) {
        advice.push("💪 At your age, regular strength training and balance exercises are especially beneficial for maintaining bone health and preventing falls.");
      }
      
      if (userContext.healthProfile.conditions?.includes('Hypertension')) {
        advice.push("🩺 For blood pressure management, remember to limit sodium intake, exercise regularly, and monitor your readings as recommended by your doctor.");
      }
      
      if (userContext.healthProfile.conditions?.includes('Diabetes')) {
        advice.push("📊 Blood sugar management tip: Consistent meal timing and regular monitoring can help maintain stable glucose levels throughout the day.");
      }
    }

    // General wellness tips
    const generalTips = [
      "💧 Hydration check: Aim for 8 glasses of water daily. Your urine should be light yellow.",
      "🥗 Nutrition tip: Try to include a variety of colorful fruits and vegetables in your meals for optimal nutrient intake.",
      "😴 Sleep quality matters: A consistent bedtime routine can significantly improve your sleep quality and overall health.",
      "🧘 Stress management: Even 5 minutes of deep breathing or meditation can help reduce stress and improve focus.",
      "🚶 Movement matters: If you've been sedentary, even a 10-minute walk can boost circulation and energy levels."
    ];

    advice.push(generalTips[Math.floor(Math.random() * generalTips.length)]);

    return advice.join('\n\n');
  },

  // Analyze symptoms with detailed assessment
  async analyzeSymptoms(symptoms: string[], userProfile?: any) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let overallSeverity = 'mild';
    const recommendations = [];
    const possibleCauses = [];
    
    // Analyze each symptom
    symptoms.forEach(symptom => {
      const symptomData = this.healthKnowledge.symptoms[symptom.toLowerCase()];
      if (symptomData) {
        if (symptomData.urgency === 'high') overallSeverity = 'severe';
        else if (symptomData.urgency === 'medium' && overallSeverity === 'mild') overallSeverity = 'moderate';
        
        possibleCauses.push(...symptomData.causes);
        recommendations.push(symptomData.advice);
      }
    });

    // Remove duplicates
    const uniqueCauses = [...new Set(possibleCauses)];
    const uniqueRecommendations = [...new Set(recommendations)];

    return {
      severity: overallSeverity,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      recommendations: uniqueRecommendations.length > 0 ? uniqueRecommendations : [
        'Monitor symptoms closely and track any changes',
        'Stay well-hydrated and get adequate rest',
        'Consider over-the-counter remedies if appropriate',
        'Consult a healthcare provider if symptoms persist or worsen',
        'Maintain a healthy diet and avoid known triggers'
      ],
      possibleCauses: uniqueCauses.length > 0 ? uniqueCauses : [
        'Common viral infection',
        'Seasonal allergies or environmental factors',
        'Stress-related symptoms',
        'Dietary or lifestyle factors',
        'Minor bacterial infection'
      ],
      urgency: overallSeverity === 'severe' ? 'high' : overallSeverity === 'moderate' ? 'medium' : 'low',
      personalizedAdvice: this.getPersonalizedSymptomAdvice(symptoms, userProfile)
    };
  },

  // Get personalized symptom advice
  getPersonalizedSymptomAdvice(symptoms: string[], userProfile?: any): string {
    const advice = [];
    
    if (userProfile?.age && userProfile.age > 65) {
      advice.push("Given your age, it's important to monitor symptoms more closely and seek medical attention sooner rather than later.");
    }
    
    if (userProfile?.conditions?.includes('Diabetes')) {
      advice.push("With your diabetes, any illness can affect blood sugar levels. Monitor your glucose more frequently during this time.");
    }
    
    if (userProfile?.conditions?.includes('Hypertension')) {
      advice.push("Your blood pressure may be affected by these symptoms. Continue taking your medications as prescribed and monitor your BP if possible.");
    }
    
    if (userProfile?.allergies?.length > 0) {
      advice.push(`Be mindful of your known allergies to ${userProfile.allergies.join(', ')} when considering any treatments or medications.`);
    }
    
    return advice.join(' ');
  },

  // Generate comprehensive health plan
  async generateHealthPlan(userProfile: any) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const plan = {
      dailyGoals: [],
      weeklyGoals: [],
      monthlyGoals: [],
      personalizedTips: []
    };

    // Base goals for everyone
    plan.dailyGoals = [
      'Drink 8 glasses of water',
      'Take 10,000 steps or 30 minutes of activity',
      'Get 7-8 hours of quality sleep',
      'Eat 5 servings of fruits and vegetables',
      'Practice 5 minutes of mindfulness or deep breathing'
    ];

    plan.weeklyGoals = [
      'Exercise for 150 minutes total',
      'Practice meditation or relaxation 3 times',
      'Meal prep for healthy eating',
      'Schedule preventive health checkup',
      'Connect with friends or family for mental health'
    ];

    plan.monthlyGoals = [
      'Complete comprehensive health assessment',
      'Review and update health goals',
      'Schedule specialist appointments if needed',
      'Update emergency contacts and medical information',
      'Evaluate and adjust wellness routine'
    ];

    // Personalize based on user profile
    if (userProfile?.age && userProfile.age > 50) {
      plan.dailyGoals.push('Take calcium and vitamin D supplements (if recommended by doctor)');
      plan.weeklyGoals.push('Include 2 strength training sessions');
      plan.personalizedTips.push('Focus on balance exercises to prevent falls');
    }

    if (userProfile?.conditions?.includes('Diabetes')) {
      plan.dailyGoals.push('Monitor blood glucose as prescribed');
      plan.dailyGoals.push('Check feet for any cuts or sores');
      plan.personalizedTips.push('Maintain consistent meal timing for better glucose control');
    }

    if (userProfile?.conditions?.includes('Hypertension')) {
      plan.dailyGoals.push('Monitor blood pressure if recommended');
      plan.dailyGoals.push('Limit sodium intake to less than 2,300mg');
      plan.personalizedTips.push('Practice stress reduction techniques daily');
    }

    if (userProfile?.healthProfile?.weight && userProfile?.healthProfile?.height) {
      const bmi = userProfile.healthProfile.weight / Math.pow(userProfile.healthProfile.height / 100, 2);
      if (bmi > 25) {
        plan.personalizedTips.push('Focus on portion control and regular physical activity for healthy weight management');
      }
    }

    return plan;
  }
};

// Integrated Health Video Service
export const healthVideoService = {
  async generatePersonalizedHealthVideo(healthData: any, message: string) {
    try {
      // Generate script based on health data
      const script = `Hello! Based on your health profile, here's some personalized guidance: ${message}. Remember to always consult with your healthcare provider for medical advice.`;
      
      // Generate video with Tavus
      const videoResult = await tavusService.generateHealthVideo(script);
      
      // Generate audio with ElevenLabs
      const audioUrl = await elevenLabsService.textToSpeech(script);
      
      return {
        video: videoResult,
        audio: audioUrl,
        script,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Health video generation error:', error);
      return { error: 'Failed to generate personalized health video' };
    }
  }
};

// Export all services
export {
  API_CONFIG
};