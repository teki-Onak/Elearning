import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@12345', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eduflow.com' },
    update: {},
    create: {
      name: 'EduFlow Admin',
      email: 'admin@eduflow.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Create demo student
  const studentPassword = await bcrypt.hash('Student@123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'student@eduflow.com' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@eduflow.com',
      password: studentPassword,
      role: 'STUDENT',
    },
  })
  console.log('✅ Demo student created:', student.email)

  // Create achievements
  const achievements = [
    { name: 'First Step', description: 'Complete your first lesson', icon: '🎯', condition: 'complete_1_lesson', points: 10 },
    { name: 'On a Roll', description: 'Complete 5 lessons', icon: '🔥', condition: 'complete_5_lessons', points: 25 },
    { name: 'Course Champion', description: 'Complete an entire course', icon: '🏆', condition: 'complete_1_course', points: 100 },
    { name: 'Scholar', description: 'Complete 3 courses', icon: '🎓', condition: 'complete_3_courses', points: 250 },
    { name: 'Wellbeing Warrior', description: 'Log wellbeing for 7 days in a row', icon: '💚', condition: 'wellbeing_7_days', points: 50 },
    { name: 'Quiz Master', description: 'Pass 10 quizzes', icon: '🧠', condition: 'pass_10_quizzes', points: 75 },
    { name: 'Forum Friend', description: 'Create your first forum post', icon: '💬', condition: 'forum_first_post', points: 15 },
    { name: 'Survey Hero', description: 'Complete a research survey', icon: '📋', condition: 'complete_survey', points: 30 },
  ]

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { id: a.condition },
      update: {},
      create: a,
    })
  }
  console.log('✅ Achievements seeded')

  // Create sample course
  const course = await prisma.course.upsert({
    where: { id: 'course-intro-online-learning' },
    update: {},
    create: {
      id: 'course-intro-online-learning',
      title: 'Introduction to Online Learning',
      description: 'Master the skills needed to succeed in online education. This course covers strategies for self-discipline, motivation, effective note-taking, and staying mentally healthy while learning remotely.',
      category: 'Study Skills',
      level: 'BEGINNER',
      duration: 120,
      isPublished: true,
    },
  })

  const module1 = await prisma.module.upsert({
    where: { id: 'module-1-foundations' },
    update: {},
    create: {
      id: 'module-1-foundations',
      title: 'Foundations of Online Learning',
      description: 'Understanding the online learning environment',
      order: 1,
      courseId: course.id,
    },
  })

  await prisma.lesson.upsert({
    where: { id: 'lesson-1-what-is-online-learning' },
    update: {},
    create: {
      id: 'lesson-1-what-is-online-learning',
      title: 'What is Online Learning?',
      content: `Online learning refers to education delivered through digital platforms and the internet.\n\nIn this lesson, we explore:\n\n• The definition and scope of online learning\n• How it differs from traditional classroom learning\n• The key platforms and tools used\n• Benefits: flexibility, accessibility, self-paced learning\n\n**Why It Matters**\n\nOnline learning has transformed education globally. Whether you're studying remotely by choice or necessity, understanding how to navigate virtual environments effectively is a critical 21st-century skill.\n\n**Key Takeaways**\n- Online learning offers flexibility but requires strong self-discipline\n- Digital literacy is essential for success\n- Building a structured routine helps maintain consistency`,
      order: 1,
      type: 'TEXT',
      duration: 15,
      moduleId: module1.id,
    },
  })

  await prisma.lesson.upsert({
    where: { id: 'lesson-2-setting-up-environment' },
    update: {},
    create: {
      id: 'lesson-2-setting-up-environment',
      title: 'Setting Up Your Learning Environment',
      content: `A productive learning environment is one of the most important factors for online learning success.\n\n**Physical Space**\n- Choose a dedicated, quiet space for studying\n- Ensure good lighting and minimal distractions\n- Keep your workspace organized and tidy\n\n**Digital Setup**\n- Stable internet connection is non-negotiable\n- Use a device with sufficient performance\n- Install required tools and platforms\n\n**Mental Preparation**\n- Set clear learning goals for each session\n- Use the Pomodoro technique (25-min focused work, 5-min break)\n- Keep water and healthy snacks nearby\n\n**Tip**: Research shows students who have a dedicated study space perform up to 20% better in online courses.`,
      order: 2,
      type: 'TEXT',
      duration: 20,
      moduleId: module1.id,
    },
  })

  const module2 = await prisma.module.upsert({
    where: { id: 'module-2-motivation' },
    update: {},
    create: {
      id: 'module-2-motivation',
      title: 'Staying Motivated & Engaged',
      description: 'Strategies to maintain motivation in virtual learning',
      order: 2,
      courseId: course.id,
    },
  })

  await prisma.lesson.upsert({
    where: { id: 'lesson-3-motivation-strategies' },
    update: {},
    create: {
      id: 'lesson-3-motivation-strategies',
      title: 'Motivation Strategies for Online Learners',
      content: `Motivation is one of the biggest challenges in online learning. Without a physical classroom environment, it's easy to lose focus.\n\n**Internal vs External Motivation**\nInternal (intrinsic) motivation comes from within — your genuine desire to learn. External (extrinsic) motivation comes from rewards, grades, or pressure.\n\nResearch shows that intrinsic motivation leads to deeper learning and better long-term retention.\n\n**Practical Strategies**\n1. Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)\n2. Break large assignments into small daily tasks\n3. Reward yourself when you complete milestones\n4. Join study groups or online forums\n5. Track your progress visually (like the progress bar in this platform!)\n\n**Dealing with Procrastination**\n- Identify your distraction triggers\n- Use website blockers during study sessions\n- Start with the smallest, easiest task to build momentum`,
      order: 1,
      type: 'TEXT',
      duration: 20,
      moduleId: module2.id,
    },
  })

  console.log('✅ Sample course seeded')

  // Create research survey (from Chapter 3 methodology)
  const survey = await prisma.survey.upsert({
    where: { id: 'survey-online-learning-effects' },
    update: {},
    create: {
      id: 'survey-online-learning-effects',
      title: 'Effects of Online Learning on Students',
      description: 'Help us understand how online learning affects your academic performance, motivation, and well-being. All responses are anonymous and used for research purposes only.',
      isActive: true,
    },
  })

  const surveyQuestions = [
    { id: 'sq-1', text: 'How would you rate your overall academic performance in online courses?', type: 'RATING', options: [], order: 1, category: 'academic_performance' },
    { id: 'sq-2', text: 'What is the biggest challenge you face in online learning?', type: 'MULTIPLE_CHOICE', options: ['Poor internet access', 'Lack of motivation', 'Difficulty concentrating', 'Limited interaction with classmates', 'Managing time'], order: 2, category: 'challenges' },
    { id: 'sq-3', text: 'How engaged do you feel during online classes compared to in-person classes?', type: 'MULTIPLE_CHOICE', options: ['Much more engaged online', 'Equally engaged', 'Less engaged online', 'Much less engaged online'], order: 3, category: 'motivation' },
    { id: 'sq-4', text: 'Rate your level of motivation to complete online assignments (1=very low, 5=very high)', type: 'RATING', options: [], order: 4, category: 'motivation' },
    { id: 'sq-5', text: 'Has online learning affected your mental health or stress levels?', type: 'MULTIPLE_CHOICE', options: ['Significantly increased stress', 'Slightly increased stress', 'No change', 'Slightly reduced stress', 'Significantly reduced stress'], order: 5, category: 'wellbeing' },
    { id: 'sq-6', text: 'Do you feel socially isolated when learning online?', type: 'YES_NO', options: [], order: 6, category: 'wellbeing' },
    { id: 'sq-7', text: 'What improvements would most help your online learning experience?', type: 'TEXT', options: [], order: 7, category: 'challenges' },
  ]

  for (const q of surveyQuestions) {
    await prisma.surveyQuestion.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, surveyId: survey.id } as any,
    })
  }

  console.log('✅ Research survey seeded')
  console.log('\n🎉 Database seeded successfully!')
  console.log('Admin: admin@eduflow.com / Admin@12345')
  console.log('Student: student@eduflow.com / Student@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
