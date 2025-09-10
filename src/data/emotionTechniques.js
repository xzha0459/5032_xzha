// Emotion Management Techniques Data
export const mainCategories = [
  { id: 'anxiety', name: 'Anxiety Management' },
  { id: 'depression', name: 'Depression Coping' },
  { id: 'stress', name: 'Stress Relief' },
  { id: 'sleep', name: 'Sleep Improvement' }
]

export const techniques = [
  // Anxiety Management Techniques
  {
    id: 'anxiety-breathing',
    category: 'anxiety',
    subcategory: 'breathing',
    title: 'Deep Breathing Exercises',
    description: 'Control your breathing to relieve anxiety symptoms',
    icon: '🫁',
    tags: ['breathing', 'relaxation', 'immediate'],
    tips: [
      { title: '4-7-8 Breathing', description: 'Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds' },
      { title: 'Diaphragmatic Breathing', description: 'Place your hand on your abdomen and feel it rise and fall with each breath' },
      { title: 'Counted Breathing', description: 'Count to 4 while inhaling, count to 6 while exhaling' }
    ]
  },
  {
    id: 'anxiety-muscle',
    category: 'anxiety',
    subcategory: 'relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Relieve physical tension by tensing and relaxing muscles',
    icon: '💪',
    tags: ['muscle', 'relaxation', 'physical'],
    tips: [
      { title: 'Start from Toes', description: 'Gradually tense and relax each body part' },
      { title: 'Hold for 5 Seconds', description: 'Tense each muscle group for 5 seconds then release' },
      { title: 'Full Body Scan', description: 'Work from feet to head, relaxing each area' }
    ]
  },
  {
    id: 'anxiety-mindfulness',
    category: 'anxiety',
    subcategory: 'mindfulness',
    title: 'Mindfulness Meditation',
    description: 'Focus on the present moment, observe feelings without judgment',
    icon: '🧘',
    tags: ['meditation', 'mindfulness', 'focus'],
    tips: [
      { title: 'Body Scan', description: 'Focus attention on different parts of your body' },
      { title: 'Breath Observation', description: 'Observe the natural flow of your breathing' },
      { title: 'Thought Observation', description: 'Notice thoughts without following them' }
    ]
  },
  {
    id: 'anxiety-cognitive',
    category: 'anxiety',
    subcategory: 'cognitive',
    title: 'Cognitive Restructuring',
    description: 'Identify and challenge negative thought patterns',
    icon: '🧠',
    tags: ['cognitive', 'thinking', 'restructuring'],
    tips: [
      { title: 'Identify Negative Thoughts', description: 'Record specific thoughts that trigger anxiety' },
      { title: 'Examine Evidence', description: 'Look for evidence that supports or contradicts these thoughts' },
      { title: 'Positive Alternatives', description: 'Replace negative thoughts with more balanced ones' }
    ]
  },

  // Depression Coping Methods
  {
    id: 'depression-routine',
    category: 'depression',
    subcategory: 'lifestyle',
    title: 'Establish Daily Routine',
    description: 'Maintain regular schedule and create stable life rhythm',
    icon: '⏰',
    tags: ['routine', 'schedule', 'stability'],
    tips: [
      { title: 'Fixed Wake Time', description: 'Wake up at the same time every day, even on weekends' },
      { title: 'Regular Meals', description: 'Eat at scheduled times and maintain balanced nutrition' },
      { title: 'Bedtime Ritual', description: 'Create fixed bedtime relaxation activities' }
    ]
  },
  {
    id: 'depression-social',
    category: 'depression',
    subcategory: 'social',
    title: 'Social Connection',
    description: 'Maintain contact with friends and family, participate in social activities',
    icon: '👥',
    tags: ['social', 'connection', 'support'],
    tips: [
      { title: 'Reach Out Actively', description: 'Proactively call friends or family members' },
      { title: 'Join Activities', description: 'Participate in interest groups or community activities' },
      { title: 'Seek Support', description: 'Share your feelings with trusted people' }
    ]
  },
  {
    id: 'depression-goals',
    category: 'depression',
    subcategory: 'motivation',
    title: 'Set Small Goals',
    description: 'Create achievable small goals to gradually restore sense of accomplishment',
    icon: '🎯',
    tags: ['goals', 'achievement', 'motivation'],
    tips: [
      { title: 'SMART Goals', description: 'Set specific, measurable, achievable goals' },
      { title: 'Break Down Tasks', description: 'Divide large goals into small steps' },
      { title: 'Celebrate Progress', description: 'Celebrate every small achievement' }
    ]
  },

  // Stress Relief Strategies
  {
    id: 'stress-time',
    category: 'stress',
    subcategory: 'management',
    title: 'Time Management',
    description: 'Create priority lists and allocate time reasonably',
    icon: '📅',
    tags: ['time', 'management', 'efficiency'],
    tips: [
      { title: 'Priority Matrix', description: 'Categorize tasks by importance and urgency' },
      { title: 'Pomodoro Technique', description: '25 minutes focused work, 5 minutes break' },
      { title: 'Learn to Say "No"', description: 'Don\'t take on tasks beyond your capacity' }
    ]
  },
  {
    id: 'stress-relaxation',
    category: 'stress',
    subcategory: 'relaxation',
    title: 'Relaxation Techniques',
    description: 'Try various relaxation methods to relieve stress',
    icon: '🧘‍♀️',
    tags: ['relaxation', 'techniques', 'relief'],
    tips: [
      { title: 'Massage', description: 'Regular massage or self-massage' },
      { title: 'Hot Bath', description: 'Take a hot bath or shower to relax' },
      { title: 'Listen to Music', description: 'Listen to soothing music or nature sounds' }
    ]
  },
  {
    id: 'stress-diet',
    category: 'stress',
    subcategory: 'lifestyle',
    title: 'Healthy Diet',
    description: 'Manage stress through healthy eating',
    icon: '🥗',
    tags: ['diet', 'healthy', 'nutrition'],
    tips: [
      { title: 'Limit Caffeine', description: 'Reduce coffee, tea and energy drink intake' },
      { title: 'More Fruits & Vegetables', description: 'Increase fresh fruits and vegetables intake' },
      { title: 'Regular Meals', description: 'Maintain regular meal times' }
    ]
  },

  // Sleep Improvement Recommendations
  {
    id: 'sleep-routine',
    category: 'sleep',
    subcategory: 'routine',
    title: 'Create Sleep Ritual',
    description: 'Engage in relaxing activities 1 hour before bed, establish fixed bedtime ritual',
    icon: '🌙',
    tags: ['ritual', 'bedtime', 'relaxation'],
    tips: [
      { title: 'Reading', description: 'Read relaxing books before bed' },
      { title: 'Meditation', description: 'Practice brief meditation or deep breathing' },
      { title: 'Journaling', description: 'Record thoughts and feelings from the day' }
    ]
  },
  {
    id: 'sleep-environment',
    category: 'sleep',
    subcategory: 'environment',
    title: 'Optimize Sleep Environment',
    description: 'Ensure room is cool, dark, and quiet for optimal sleep environment',
    icon: '🛏️',
    tags: ['environment', 'bedroom', 'comfort'],
    tips: [
      { title: 'Temperature Control', description: 'Keep room temperature between 64-72°F (18-22°C)' },
      { title: 'Blackout Curtains', description: 'Use blackout curtains or eye mask' },
      { title: 'Reduce Noise', description: 'Use earplugs or white noise machine' }
    ]
  },
  {
    id: 'sleep-screen',
    category: 'sleep',
    subcategory: 'habits',
    title: 'Limit Screen Time',
    description: 'Avoid electronic devices 1 hour before bedtime',
    icon: '📱',
    tags: ['screen', 'electronics', 'blue-light'],
    tips: [
      { title: 'Set Time Limits', description: 'Stop using electronic devices 1 hour before bed' },
      { title: 'Blue Light Filter', description: 'Use blue light filtering features or glasses' },
      { title: 'Alternative Activities', description: 'Replace screen time with reading or listening to music' }
    ]
  }
]

// Subcategory Configuration
export const subcategories = {
  anxiety: [
    { id: 'all', name: 'All' },
    { id: 'breathing', name: 'Breathing Exercises' },
    { id: 'relaxation', name: 'Relaxation Techniques' },
    { id: 'mindfulness', name: 'Mindfulness Meditation' },
    { id: 'cognitive', name: 'Cognitive Restructuring' }
  ],
  depression: [
    { id: 'all', name: 'All' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'social', name: 'Social Support' },
    { id: 'motivation', name: 'Motivation Recovery' }
  ],
  stress: [
    { id: 'all', name: 'All' },
    { id: 'management', name: 'Time Management' },
    { id: 'relaxation', name: 'Relaxation Techniques' },
    { id: 'lifestyle', name: 'Lifestyle' }
  ],
  sleep: [
    { id: 'all', name: 'All' },
    { id: 'routine', name: 'Sleep Ritual' },
    { id: 'environment', name: 'Sleep Environment' },
    { id: 'habits', name: 'Sleep Habits' }
  ]
}