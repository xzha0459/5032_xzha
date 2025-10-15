/* eslint-env node */
require('dotenv').config();
const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');
const cors = require('cors')({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

// Configuration from environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_SENDER || 'hezitt0925@gmail.com';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 环境变量检查（部署时可能还没有设置）
if (!SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY environment variable is not set');
}

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('GOOGLE_MAPS_API_KEY environment variable is not set');
}

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY environment variable is not set');
}

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}


exports.emailsender = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    try {
      if (!SENDGRID_API_KEY) {
        return res.status(500).json({ error: 'SendGrid API key not configured' });
      }

      const { to, subject, message, attachmentBase64, attachmentName } = req.body;

      if (!to || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const msg = {
        to,
        from: SENDGRID_SENDER,
        subject,
        text: message,
        html: `<p>${message}</p>`
      };

      // Add attachment if provided
      if (attachmentBase64 && attachmentName) {
        const cleanBase64 = attachmentBase64.replace(/^data:[^;]+;base64,/, '');
        msg.attachments = [{
          content: cleanBase64,
          filename: attachmentName,
          type: 'application/octet-stream',
          disposition: 'attachment'
        }];
      }

      const [response] = await sgMail.send(msg);

      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: response?.headers?.['x-message-id']
      });

    } catch (error) {
      console.error('SendGrid Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// 搜索心理健康服务的Firebase Function
exports.searchMentalHealthServices = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    // 辅助函数定义在内部
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // 地球半径，单位公里
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    function isMentalHealthRelated(place) {
      const name = place.name.toLowerCase();
      const types = place.types || [];

      // 检查是否为健康相关场所
      const healthTypes = ['health', 'hospital', 'doctor', 'dentist', 'pharmacy', 'physiotherapist'];
      const isHealthType = types.some(type => healthTypes.includes(type));

      // 检查心理健康关键词
      const mentalHealthKeywords = [
        'mental health', 'psychologist', 'psychology', 'psychiatrist', 'psychiatry',
        'counseling', 'counselor', 'therapy', 'therapist', 'counselling',
        'headspace', 'lifeline', 'beyond blue', 'crisis', 'emergency',
        'support group', 'mental health clinic', 'mental health service',
        'wellness', 'wellbeing', 'depression', 'anxiety', 'stress'
      ];

      const hasMentalHealthKeyword = mentalHealthKeywords.some(keyword =>
        name.includes(keyword)
      );

      return isHealthType || hasMentalHealthKeyword;
    }

    function processPlacesResults(results) {
      const seen = new Set();
      const services = [];

      results.forEach(place => {
        if (seen.has(place.place_id)) return;
        seen.add(place.place_id);

        // 只处理心理健康相关场所
        if (!isMentalHealthRelated(place)) {
          return;
        }

        // 确定服务类型
        let serviceType = 'support';
        const name = place.name.toLowerCase();

        if (name.includes('emergency') || name.includes('crisis') ||
            name.includes('lifeline') || name.includes('beyond blue')) {
          serviceType = 'emergency';
        } else if (name.includes('counseling') || name.includes('counselor') ||
                   name.includes('psychologist') || name.includes('psychology')) {
          serviceType = 'counseling';
        } else if (name.includes('therapy') || name.includes('therapist') ||
                   name.includes('psychiatrist') || name.includes('psychiatry')) {
          serviceType = 'therapy';
        } else if (name.includes('youth') || name.includes('headspace') ||
                   name.includes('young') || name.includes('teen')) {
          serviceType = 'youth';
        } else if (name.includes('education') || name.includes('training') ||
                   name.includes('workshop') || name.includes('course')) {
          serviceType = 'education';
        }

        // 服务类型映射
        const categoryMap = {
          'emergency': 'Emergency Services',
          'counseling': 'Counseling',
          'therapy': 'Therapy',
          'support': 'Support Groups',
          'youth': 'Youth Services',
          'education': 'Education'
        };

        // 获取地址信息
        let address = place.formatted_address || place.vicinity || 'Address not available';

        services.push({
          id: place.place_id,
          name: place.name,
          type: serviceType,
          category: categoryMap[serviceType] || 'Mental Health Service',
          description: address,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          address: address,
          phone: place.formatted_phone_number || 'Contact for details',
          hours: 'Contact for hours',
          rating: place.rating || 4.0,
          services: place.types || ['Mental Health Service'],
          website: place.website || '',
          isEmergency: serviceType === 'emergency',
          placeId: place.place_id
        });
      });

      return services;
    }

    function sortServicesByDistance(services, userLat, userLng) {
      if (!services || services.length === 0) {
        return services;
      }

      return services
        .map(service => ({
          ...service,
          distance: calculateDistance(
            userLat,
            userLng,
            service.location.lat,
            service.location.lng
          )
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    function isAddress(input) {
      const addressPatterns = [
        /\d+\s+\w+\s+(street|st|road|rd|avenue|ave|drive|dr|lane|ln|way|place|pl|court|ct|boulevard|blvd|highway|hwy)/i,
        /\d+\s+\w+\s+(nsw|vic|qld|wa|sa|nt|act|tas)\s+\d{4}/i,
        /^\d+\s+[a-zA-Z\s]+(street|st|road|rd|avenue|ave|drive|dr|lane|ln|way|place|pl|court|ct|boulevard|blvd|highway|hwy)/i,
        /\b\d{4}\b/, // 包含4位邮政编码
        /\b(nsw|vic|qld|wa|sa|nt|act|tas)\b/i // 包含州缩写
      ];

      return addressPatterns.some(pattern => pattern.test(input));
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    try {
      if (!GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ error: 'Google Maps API key not configured' });
      }

      const { keyword, userLat, userLng, radius = 3000, bounds } = req.body;

      if (!keyword) {
        return res.status(400).json({ error: 'Search keyword is required' });
      }

      // Check if we have coordinates or bounds
      if (!bounds && (typeof userLat !== 'number' || typeof userLng !== 'number')) {
        return res.status(400).json({ error: 'Valid user coordinates or bounds are required' });
      }

      // Determine search coordinates
      let searchLat = bounds ? (bounds.north + bounds.south) / 2 : userLat;
      let searchLng = bounds ? (bounds.east + bounds.west) / 2 : userLng;
      let searchLocation = null;

      if (bounds) {
        console.log('Searching within bounds:', bounds);
      }

      // 如果输入是地址，先进行地理编码
      if (isAddress(keyword)) {
        console.log('Detected address input, geocoding address first...');

        try {
          const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
              address: keyword,
              key: GOOGLE_MAPS_API_KEY
            }
          });

          if (geocodeResponse.data.status === 'OK' && geocodeResponse.data.results[0]) {
            const location = geocodeResponse.data.results[0].geometry.location;
            searchLat = location.lat;
            searchLng = location.lng;
            searchLocation = {
              lat: searchLat,
              lng: searchLng,
              address: keyword
            };
            console.log(`Geocoded address "${keyword}" to: ${searchLat}, ${searchLng}`);
          } else {
            throw new Error('Address not found');
          }
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);
          return res.status(400).json({ error: 'Address not found' });
        }
      }

      // 搜索心理健康服务
      const allResults = [];

      // 简化的搜索查询
      const searchQueries = [
        `${keyword} mental health`,
        `${keyword} psychologist`,
        `${keyword} counseling`,
        `${keyword} therapy`,
        `${keyword} psychiatrist`
      ];

      // 统一的API调用函数
      const searchPlaces = async (query, type = null) => {
        try {
          const params = {
            location: `${searchLat},${searchLng}`,
            radius: radius,
            key: GOOGLE_MAPS_API_KEY
          };

          if (type) {
            params.type = type;
          } else {
            params.query = query;
          }

          const response = await axios.get(
            type
              ? 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
              : 'https://maps.googleapis.com/maps/api/place/textsearch/json',
            { params }
          );

          if (response.data.status === 'OK') {
            allResults.push(...response.data.results);
          }
        } catch (error) {
          console.error(`Search error for "${query || type}":`, error);
        }
      };

      // 执行搜索
      await Promise.all([
        ...searchQueries.map(query => searchPlaces(query)),
        searchPlaces(null, 'health')
      ]);

      // 处理和去重结果
      let processedServices = processPlacesResults(allResults);

      // Filter services within bounds if provided
      if (bounds) {
        processedServices = processedServices.filter(service => {
          const { lat, lng } = service.location;
          return lat >= bounds.south && lat <= bounds.north &&
                 lng >= bounds.west && lng <= bounds.east;
        });
        console.log('Filtered services within bounds:', processedServices.length);
      }

      // 按距离排序并返回结果
      const services = sortServicesByDistance(processedServices, searchLat, searchLng);

      return res.status(200).json({
        success: true,
        services,
        count: services.length,
        searchLocation,
        searchRadius: radius,
        bounds
      });

    } catch (error) {
      console.error('Search services error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// 心理健康聊天机器人 Firebase Function
exports.chatbot = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    try {
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
      }

      const { message, conversationHistory = [] } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required and must be a string' });
      }

      // 初始化 Gemini AI
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      // 构建系统提示词
      const systemPrompt = `You are a compassionate mental health support assistant. Your role is to:

1. Provide emotional support and active listening
2. Offer helpful coping strategies and techniques
3. Suggest appropriate mental health resources when needed
4. Maintain a warm, empathetic, and non-judgmental tone
5. Encourage professional help for serious mental health concerns
6. Focus on evidence-based mental health information

Guidelines:
- Always prioritize the user's safety and wellbeing
- If someone expresses suicidal thoughts, encourage them to contact emergency services or crisis hotlines
- Provide practical, actionable advice
- Use simple, clear language
- Be supportive and encouraging
- Avoid giving medical diagnoses or specific treatment recommendations
- Suggest professional help when appropriate
- Keep your responses concise and focused - aim for 2-3 sentences maximum
- Be direct and to the point while maintaining empathy

Remember: You are here to support, not replace professional mental health care.`;

      // 构建完整的对话内容
      let fullPrompt = systemPrompt + '\n\n';

      // 添加对话历史
      conversationHistory.forEach(msg => {
        if (msg.role === 'user') {
          fullPrompt += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          fullPrompt += `Assistant: ${msg.content}\n`;
        }
      });

      // 添加当前消息
      fullPrompt += `User: ${message}\nAssistant:`;

      // 发送请求并获取响应
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        generationConfig: {
          maxOutputTokens: 150,  // 限制最大输出token数量，大约2-3句话
          temperature: 0.7,      // 保持适度的创造性
          topP: 0.8,            // 控制词汇选择的多样性
          topK: 40              // 限制候选词汇数量
        }
      });

      const reply = response.text;

      // 返回响应
      return res.status(200).json({
        success: true,
        reply: reply,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Chatbot error:', error);

      // 处理不同类型的错误
      let errorMessage = 'Sorry, I\'m having trouble responding right now. Please try again later.';

      if (error.message.includes('API key')) {
        errorMessage = 'Service configuration error. Please contact support.';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'Service temporarily unavailable due to high demand. Please try again in a few minutes.';
      } else if (error.message.includes('safety')) {
        errorMessage = 'I understand you\'re going through a difficult time. For your safety and wellbeing, I\'d encourage you to speak with a mental health professional or contact a crisis helpline.';
      }

      return res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  });
});

// 情绪日记 AI 助手 Firebase Function
exports.moodDiaryAI = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    try {
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
      }

      const { type, mood, text, moodHistory, userId } = req.body;

      if (!type || !mood) {
        return res.status(400).json({ error: 'Type and mood are required' });
      }

      // 初始化 Gemini AI
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      let prompt = '';
      let maxTokens = 150;

      if (type === 'tips') {
        // 实时情绪建议
        prompt = `You are a compassionate mental health assistant. A user is feeling ${mood} today. ${text ? `They shared: "${text}"` : ''}

Please provide exactly 3 practical, actionable tips to help them feel better or maintain their positive mood. Each tip should be:
- Under 20 words
- Specific and actionable
- Encouraging and supportive
- Evidence-based

Format your response as exactly 3 numbered tips, one per line, like this:
1. First tip here
2. Second tip here
3. Third tip here

Do not include any introductory text or explanations.`;

        maxTokens = 150;

      } else if (type === 'weekly_summary') {
        // 周报摘要
        prompt = `You are a mental health coach analyzing a user's mood diary. Based on their past week entries: ${moodHistory}

Please provide:
1. A brief, encouraging summary of their emotional patterns (2-3 sentences)
2. 2-3 specific suggestions for improvement or maintenance

Keep the entire response under 150 words. Be warm, supportive, and focus on positive growth.`;

        maxTokens = 200;

      } else if (type === 'insights') {
        // 深度洞察分析
        prompt = `You are a mental health professional. Analyze this mood data: ${moodHistory}

Provide insights about:
- Emotional patterns and triggers
- Positive trends to celebrate
- Areas for gentle improvement
- Personalized recommendations

Be professional yet warm, encouraging, and actionable. Keep under 200 words.`;

        maxTokens = 250;
      }

      // 发送请求并获取响应
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      });

      const reply = response.text;

      // 记录使用情况（可选）
      console.log(`Mood Diary AI used for user ${userId}, type: ${type}, mood: ${mood}`);

      // 返回响应
      return res.status(200).json({
        success: true,
        reply: reply,
        type: type,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Mood Diary AI error:', error);

      let errorMessage = 'Sorry, I\'m having trouble providing insights right now. Please try again later.';

      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error. Please contact support.';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'AI service temporarily unavailable due to high demand. Please try again in a few minutes.';
      } else if (error.message.includes('safety')) {
        errorMessage = 'I understand you\'re going through a difficult time. For your wellbeing, I\'d encourage you to speak with a mental health professional.';
      }

      return res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  });
});
