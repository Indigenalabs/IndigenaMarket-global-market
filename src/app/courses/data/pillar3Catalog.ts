export type AccessLevel = 'public' | 'restricted' | 'elder-approved' | 'by-arrangement';

export type Pillar3Category = {
  id: string;
  name: string;
  iconEmoji: string;
  description: string;
  accessLevel: AccessLevel;
  rateRange: { min: number; max: number; unit: string };
  color: string;
  topics: string[];
};

export const PILLAR3_CATEGORIES: Pillar3Category[] = [
  {
    id: 'traditional_arts',
    name: 'Traditional Art Courses',
    iconEmoji: '🪶',
    description: 'Traditional painting, carving, weaving, pottery, beadwork, and craft mastery.',
    accessLevel: 'public',
    rateRange: { min: 80, max: 700, unit: 'per course' },
    color: '#d4af37',
    topics: ['Traditional Painting Techniques','Carving Fundamentals','Basket Weaving Mastery','Pottery & Ceramics','Textile Weaving','Beadwork Techniques','Jewelry Making','Featherwork Arts','Hide Tanning','Quillwork']
  },
  {
    id: 'language_learning',
    name: 'Language Learning Courses',
    iconEmoji: '🗣️',
    description: 'Beginner to advanced Indigenous language learning, literacy, and oral traditions.',
    accessLevel: 'public',
    rateRange: { min: 50, max: 700, unit: 'per course' },
    color: '#4A90E2',
    topics: ['Beginning Indigenous Language','Intermediate Conversation','Advanced Fluency',"Children's Language Programs",'Language Through Art','Elder-Led Oral Traditions','Writing Systems','Ceremonial Language']
  },
  {
    id: 'cultural_knowledge',
    name: 'Cultural Knowledge Courses',
    iconEmoji: '🌿',
    description: 'Ecological knowledge, medicinal plants, food systems, storytelling, and star knowledge.',
    accessLevel: 'restricted',
    rateRange: { min: 100, max: 700, unit: 'per course' },
    color: '#DC143C',
    topics: ['Traditional Ecological Knowledge','Medicinal Plants','Traditional Food Systems','Ceremonial Protocols','Oral History & Storytelling','Genealogy & Family History','Seasonal Calendars','Constellations & Star Knowledge']
  },
  {
    id: 'contemporary_art_design',
    name: 'Contemporary Art & Design Courses',
    iconEmoji: '🖌️',
    description: 'Modern Indigenous painting, digital art, fashion, printmaking, and portfolio skills.',
    accessLevel: 'public',
    rateRange: { min: 100, max: 700, unit: 'per course' },
    color: '#f59e0b',
    topics: ['Contemporary Indigenous Painting','Digital Art for Indigenous Artists','Fashion Design with Cultural Elements','Printmaking','Photography for Artists','Portfolio Development','Artist Statement Writing','Exhibition Preparation']
  },
  {
    id: 'performing_arts',
    name: 'Performing Arts Courses',
    iconEmoji: '🥁',
    description: 'Dance, drumming, singing, flute making, storytelling performance, and ceremonial music.',
    accessLevel: 'public',
    rateRange: { min: 100, max: 700, unit: 'per course' },
    color: '#eab308',
    topics: ['Traditional Dance','Drumming','Singing & Chanting','Flute Making & Playing','Storytelling Performance','Ceremonial Music','Contemporary Indigenous Music','Powwow Dance Styles']
  },
  {
    id: 'business_entrepreneurship',
    name: 'Business & Entrepreneurship',
    iconEmoji: '🧺',
    description: 'Launch and scale Indigenous businesses with culturally grounded market strategy.',
    accessLevel: 'public',
    rateRange: { min: 80, max: 600, unit: 'per course' },
    color: '#22c55e',
    topics: ['Starting an Art Business','Pricing Your Work','E-commerce for Artists','Marketing & Social Media','Licensing & Intellectual Property','Gallery Representation','Financial Management','Grant Writing']
  },
  {
    id: 'curatorial_museum',
    name: 'Curatorial & Museum Studies',
    iconEmoji: '🏺',
    description: 'Curation, museum protocols, repatriation, and Indigenous museology practice.',
    accessLevel: 'restricted',
    rateRange: { min: 150, max: 700, unit: 'per course' },
    color: '#8b5cf6',
    topics: ['Curating Indigenous Art','Museum Protocols','Repatriation Processes','Exhibition Writing','Collection Management','Cultural Consultation','Indigenous Museology']
  },
  {
    id: 'academic_university',
    name: 'Academic & University-Level Courses',
    iconEmoji: '📜',
    description: 'University-grade Indigenous studies, politics, treaty studies, and decolonization.',
    accessLevel: 'public',
    rateRange: { min: 300, max: 2000, unit: 'per course' },
    color: '#06b6d4',
    topics: ['Indigenous Studies','Indigenous History','Indigenous Politics','Indigenous Research Methodologies','Treaty Studies','Indigenous Literature','Indigenous Philosophy','Decolonization Studies']
  },
  {
    id: 'teacher_education',
    name: 'Teacher Education & Curriculum Development',
    iconEmoji: '📖',
    description: 'Indigenous pedagogy, curriculum design, assessment, and classroom cultural inclusion.',
    accessLevel: 'public',
    rateRange: { min: 150, max: 700, unit: 'per course' },
    color: '#0ea5e9',
    topics: ['Indigenous Pedagogy','Curriculum Development','Classroom Cultural Inclusion','Language Teaching Methods','Elder Engagement in Schools','Land-Based Education','Assessment in Indigenous Education','Indigenous Early Childhood Education']
  },
  {
    id: 'language_teacher_training',
    name: 'Language Teacher Training',
    iconEmoji: '🗣️',
    description: 'Train language teachers in immersion, assessment, materials, and master-apprentice methods.',
    accessLevel: 'public',
    rateRange: { min: 150, max: 700, unit: 'per course' },
    color: '#2563eb',
    topics: ['Language Teaching Methods','Curriculum Development for Languages','Language Assessment','Immersion Techniques','Materials Development','Language Technology','Master-Apprentice Method','Language Nest Training']
  },
  {
    id: 'youth_family',
    name: 'Youth & Family Courses',
    iconEmoji: '🌱',
    description: 'Intergenerational learning, children programs, youth camps, leadership, and family language.',
    accessLevel: 'public',
    rateRange: { min: 20, max: 600, unit: 'per course' },
    color: '#14b8a6',
    topics: ['Indigenous Crafts for Kids','Stories with Elders','Family Language Learning','Youth Cultural Camps (Online)','Coming of Age Preparation','Intergenerational Learning',"Children's Songs & Games",'Youth Leadership']
  },
  {
    id: 'health_wellness',
    name: 'Health & Wellness Courses',
    iconEmoji: '🌿',
    description: 'Traditional healing, nutrition, grief support, and trauma-informed wellness through culture.',
    accessLevel: 'restricted',
    rateRange: { min: 100, max: 600, unit: 'per course' },
    color: '#16a34a',
    topics: ['Traditional Healing Practices','Indigenous Nutrition','Wellness Through Culture','Pregnancy & Birth Traditions','Grief & Loss in Indigenous Contexts','Substance Recovery Through Culture','Elder Wellness','Intergenerational Trauma Healing']
  },
  {
    id: 'land_environment',
    name: 'Land & Environment Courses',
    iconEmoji: '🏞️',
    description: 'Land stewardship, climate adaptation, fire knowledge, and sustainable harvesting practices.',
    accessLevel: 'public',
    rateRange: { min: 150, max: 700, unit: 'per course' },
    color: '#22c55e',
    topics: ['Traditional Ecological Knowledge','Wild Plant Identification','Traditional Hunting & Trapping','Sustainable Harvesting','Fire Management','Water Protection','Climate Adaptation','Animal Tracking']
  },
  {
    id: 'digital_preservation',
    name: 'Digital Skills for Cultural Preservation',
    iconEmoji: '🪶',
    description: 'Digitization, archives, oral history recording, apps, websites, and VR cultural storytelling.',
    accessLevel: 'public',
    rateRange: { min: 150, max: 1000, unit: 'per course' },
    color: '#8b5cf6',
    topics: ['Digitizing Cultural Materials','Digital Archive Management','Creating Language Apps','Recording Oral Histories','Video Documentation','Website Development for Cultural Centers','Social Media for Cultural Advocacy','Virtual Reality for Cultural Sites']
  },
  {
    id: 'cultural_tourism',
    name: 'Cultural Tourism Training',
    iconEmoji: '🛶',
    description: 'Guide, host, and market culturally safe tourism experiences with protocol integrity.',
    accessLevel: 'public',
    rateRange: { min: 100, max: 600, unit: 'per course' },
    color: '#06b6d4',
    topics: ['Tour Guide Training','Cultural Interpretation','Starting a Tourism Business','Hosting Visitors','Storytelling for Tourism','Cultural Safety for Visitors','Marketing Cultural Experiences','Partnerships with Travel Companies']
  },
  {
    id: 'advocacy_organizing',
    name: 'Advocacy & Community Organizing',
    iconEmoji: '🛡️',
    description: 'Community organizing, policy analysis, coalition building, and media-facing advocacy.',
    accessLevel: 'public',
    rateRange: { min: 150, max: 700, unit: 'per course' },
    color: '#ef4444',
    topics: ['Community Organizing','Advocacy Campaign Development','Media Relations','Public Speaking','Policy Analysis','Lobbying Government','Coalition Building','Digital Advocacy']
  },
  {
    id: 'sacred_ceremonial',
    name: 'Sacred & Ceremonial Knowledge',
    iconEmoji: '🔥',
    description: 'Protocol-governed ceremonial teachings offered only with community authority.',
    accessLevel: 'elder-approved',
    rateRange: { min: 0, max: 0, unit: 'by arrangement' },
    color: '#f97316',
    topics: ['Ceremonial Preparation','Sacred Song Teaching','Protocol Training','Pipe Teachings','Sweat Lodge Teachings','Medicine Bundle Care','Naming Ceremony Protocols','Coming of Age Ceremonies']
  },
  {
    id: 'professional_development',
    name: 'Professional Development',
    iconEmoji: '🧭',
    description: 'Leadership, governance, project management, HR, conflict resolution, and planning.',
    accessLevel: 'public',
    rateRange: { min: 200, max: 800, unit: 'per course' },
    color: '#0f766e',
    topics: ['Indigenous Leadership','Board Governance for Indigenous Organizations','Nonprofit Management','Project Management','Grant Management','Human Resources in Indigenous Contexts','Conflict Resolution','Strategic Planning']
  },
  {
    id: 'online_workshops',
    name: 'Online Workshops & Short Format',
    iconEmoji: '🪵',
    description: 'Short-form sessions: language snacks, craft intros, story hours, and live Q&A.',
    accessLevel: 'public',
    rateRange: { min: 10, max: 100, unit: 'per workshop' },
    color: '#f59e0b',
    topics: ['2-Hour Beading Workshop','Intro to Carving','Language Snack','Cooking Class','Dance Workshop','Storytelling Hour','Plant Walk (Virtual)','Q&A with Artist']
  },
  {
    id: 'certificate_programs',
    name: 'Certificate Programs & Bundles',
    iconEmoji: '🏺',
    description: 'Multi-course certificate tracks and advanced bundles for professional outcomes.',
    accessLevel: 'public',
    rateRange: { min: 800, max: 5000, unit: 'per program' },
    color: '#a855f7',
    topics: ['Indigenous Arts Certificate','Language Fluency Certificate','Cultural Tourism Certificate','Traditional Ecological Knowledge Certificate','Indigenous Education Certificate','Curatorial Studies Certificate','Master-Apprentice Program','Elder Teaching Certificate']
  }
];

export const PILLAR3_REVENUE_OVERVIEW = {
  totalCategories: 20,
  totalEducatorsYear5: 20400,
  totalCoursesYear5: 45000,
  averageCoursePriceUSD: 200,
  transactionRevenueModerateUSD: 2100000,
  subscriptionAttributionUSD: 35000000,
  totalPillarRevenueUSD: 37100000
};



