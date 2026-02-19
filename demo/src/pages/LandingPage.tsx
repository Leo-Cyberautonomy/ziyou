import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Target, ShoppingBag, Play, ChevronRight, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: '低门槛',
    description: '不用懂游戏术语，回答几个简单问题就够了',
    color: 'text-gaming-amber',
  },
  {
    icon: Target,
    title: '精准匹配',
    description: 'AI 根据你的偏好、习惯和设备智能推荐',
    color: 'text-gaming-cyan',
  },
  {
    icon: ShoppingBag,
    title: '闭环体验',
    description: '看中就买，直达各平台商店页面',
    color: 'text-gaming-emerald',
  },
  {
    icon: Play,
    title: '直观决策',
    description: '评分、截图、视频一目了然，不再纠结',
    color: 'text-gaming-rose',
  },
]

const steps = [
  { number: '01', title: '填问卷', description: '告诉我们你的游戏口味' },
  { number: '02', title: 'AI 推荐', description: '智能匹配最适合你的游戏' },
  { number: '03', title: '直接购买', description: '一键跳转到商店下单' },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gaming-dark overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gaming-accent/20 blur-[120px]"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-gaming-cyan/15 blur-[100px]"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 40, -20, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-gaming-rose/10 blur-[80px]"
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="text-gaming-accent-light text-sm font-medium tracking-widest uppercase mb-6">
              Your Personal Game Advisor
            </p>
            <h1 className="gradient-text text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              找到你的下一款
              <br />
              心动游戏
            </h1>
            <p className="text-xl sm:text-2xl text-white/80 font-light mb-4">
              自游 — 你的私人游戏顾问
            </p>
            <p className="text-base text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              不知道玩什么？回答几个简单问题，AI 会根据你的口味、时间和设备，
              从海量游戏中为你精选最合适的推荐，并提供评分、截图和购买链接。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            <button
              onClick={() => navigate('/survey')}
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gaming-accent hover:bg-gaming-accent-light text-white font-semibold text-lg rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <span>开始测试</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-2xl bg-gaming-accent/30 blur-xl -z-10 group-hover:blur-2xl transition-all" />
            </button>
          </motion.div>
        </div>
      </section>

      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              为什么选择<span className="gradient-text">自游</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              不是又一个游戏排行榜，而是真正懂你的推荐引擎
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="glass-card rounded-2xl p-8 hover:border-gaming-accent/30 transition-all duration-300 group"
              >
                <div className={`${feature.color} mb-5`}>
                  <feature.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              三步找到心动游戏
            </h2>
            <p className="text-white/50 text-lg">简单、快速、零门槛</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="relative text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-border bg-gaming-card flex items-center justify-center">
                  <span className="gradient-text text-2xl font-bold">{step.number}</span>
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 translate-x-1/2 w-5 h-5 text-gaming-accent/40" />
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button
              onClick={() => navigate('/survey')}
              className="group inline-flex items-center gap-2 px-8 py-3.5 border border-gaming-accent/40 text-gaming-accent-light hover:bg-gaming-accent/10 rounded-xl font-medium transition-all duration-300 cursor-pointer"
            >
              <span>立即开始</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
