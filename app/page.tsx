import Link from 'next/link'
import {
  BookOpen, Users, TrendingUp, Heart, Award, ArrowRight,
  Play, CheckCircle, Star, Zap, Brain, Target
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Structured Courses',
      desc: 'Organized modules and lessons with videos, text, and interactive quizzes — designed for focused online learning.',
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
    },
    {
      icon: Brain,
      title: 'Wellbeing Tracker',
      desc: 'Daily mood and stress check-ins to monitor your mental health — because your wellbeing matters as much as grades.',
      color: 'text-accent-400',
      bg: 'bg-accent-500/10',
    },
    {
      icon: Users,
      title: 'Community Forums',
      desc: 'Break through isolation with peer discussions and instructor Q&A right inside each course.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      desc: 'Visual dashboards showing your performance, lesson completion, and quiz scores in real-time.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Award,
      title: 'Achievements & Points',
      desc: 'Earn badges and unlock milestones to stay motivated and celebrate every step of your journey.',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
    },
    {
      icon: Target,
      title: 'Research Surveys',
      desc: 'Participate in academic surveys that help educators improve online learning experiences for everyone.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
  ]

  const stats = [
    { value: '95%', label: 'Student Satisfaction' },
    { value: '200+', label: 'Courses Available' },
    { value: '50K+', label: 'Learners Enrolled' },
    { value: '4.8★', label: 'Average Rating' },
  ]

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-surface-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">EduFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#about" className="hover:text-white transition-colors">About</Link>
            <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Log In</Link>
            <Link href="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-600/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent-600/8 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 badge-primary mb-6 text-sm px-4 py-2">
            <Zap className="w-3.5 h-3.5" />
            Designed to solve real online learning challenges
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Learn Smarter,{' '}
            <span className="gradient-text">Not Harder</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            EduFlow tackles every challenge of online education — isolation, motivation, wellbeing,
            and performance — in one unified platform built for modern students.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2 justify-center">
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/courses" className="btn-secondary text-base px-8 py-4 flex items-center gap-2 justify-center">
              <Play className="w-4 h-4" /> Browse Courses
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            {['No credit card required', 'Free to get started', 'Research-backed design'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-slate-800">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-4xl font-bold gradient-text mb-1">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Built to solve every{' '}
              <span className="gradient-text">online learning challenge</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Based on extensive research into the effects of online learning on students,
              EduFlow addresses performance, engagement, motivation, and mental well-being.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-hover group">
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Research */}
      <section id="about" className="py-24 px-6 bg-slate-900/40">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Research-Driven Education
          </h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed mb-12">
            EduFlow is built on academic research examining how online learning impacts students'
            performance, engagement, and wellbeing. Every feature is designed to address a
            documented challenge — from isolation and motivation loss to technology access and
            mental health.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Research Overview', desc: 'How online learning affects academic performance, engagement, and mental well-being.' },
              { n: '02', title: 'Literature Review', desc: 'Building on global studies about virtual education benefits, challenges, and student outcomes.' },
              { n: '03', title: 'Methodology', desc: 'Survey-driven data collection and descriptive analysis to improve online learning systems.' },
            ].map((c) => (
              <div key={c.n} className="card text-left">
                <span className="font-display text-5xl font-bold text-primary-800/60">{c.n}</span>
                <h3 className="font-display font-semibold text-white mt-2 mb-2">{c.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card border-primary-500/20 bg-gradient-to-br from-primary-900/30 to-accent-900/20">
            <Star className="w-10 h-10 text-primary-400 mx-auto mb-4" />
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Ready to transform your learning experience?
            </h2>
            <p className="text-slate-400 mb-8">
              Join thousands of students who are achieving more, stressing less, and staying connected.
            </p>
            <Link href="/register" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-white">EduFlow</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} EduFlow. Built to improve online learning for everyone.
          </p>
          <div className="flex gap-5 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
