import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Rocket, Plus, X, Clock, Gamepad2, Loader2 } from 'lucide-react'
import StepIndicator from '../components/StepIndicator'
import {
  type ExperienceLevel,
  type GamePurpose,
  type GenreType,
  type DeviceType,
  type PlayerProfile,
  EXPERIENCE_LABELS,
  PURPOSE_LABELS,
  GENRE_LABELS,
  DEVICE_LABELS,
} from '../types/index'

const TOTAL_STEPS = 5

const stepMeta = [
  { title: '你的游戏经验', subtitle: '选择最符合你的段位' },
  { title: '你想从游戏中获得什么', subtitle: '可以多选' },
  { title: '喜欢的游戏类型', subtitle: '选得越多推荐越准' },
  { title: '你用什么设备玩游戏', subtitle: '可以多选' },
  { title: '游戏时间与偏好', subtitle: '帮助我们更了解你' },
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function SurveyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [gameInput, setGameInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [profile, setProfile] = useState<PlayerProfile>({
    experienceLevel: 'casual',
    weeklyHours: 10,
    purposes: [],
    genrePreferences: [],
    devices: [],
    platformPreferences: [],
    agePreference: 'both',
    favoriteGames: [],
  })

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return !!profile.experienceLevel
      case 1:
        return profile.purposes.length > 0
      case 2:
        return profile.genrePreferences.length > 0
      case 3:
        return profile.devices.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const submitToBackend = async () => {
    setLoading(true)
    setError('')
    try {
      const body = {
        experience_level: profile.experienceLevel,
        weekly_hours: profile.weeklyHours,
        purposes: profile.purposes,
        genre_preferences: profile.genrePreferences,
        devices: profile.devices,
        platform_preferences: profile.platformPreferences,
        age_preference: profile.agePreference,
        favorite_games: profile.favoriteGames,
      }
      const resp = await fetch(`${API_BASE}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.detail || `请求失败 (${resp.status})`)
      }
      const data = await resp.json()
      navigate('/results', { state: { games: data.games } })
    } catch (e: any) {
      setError(e.message || '推荐服务暂时不可用，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    } else {
      submitToBackend()
    }
  }

  const goBack = () => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const toggleMulti = <T extends string>(
    arr: T[],
    value: T,
    setter: (updated: T[]) => void,
  ) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value])
  }

  const addFavoriteGame = () => {
    const trimmed = gameInput.trim()
    if (trimmed && profile.favoriteGames.length < 5 && !profile.favoriteGames.includes(trimmed)) {
      setProfile((p) => ({ ...p, favoriteGames: [...p.favoriteGames, trimmed] }))
      setGameInput('')
    }
  }

  const removeFavoriteGame = (game: string) => {
    setProfile((p) => ({ ...p, favoriteGames: p.favoriteGames.filter((g) => g !== game) }))
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {(Object.entries(EXPERIENCE_LABELS) as [ExperienceLevel, typeof EXPERIENCE_LABELS[ExperienceLevel]][]).map(
              ([key, val]) => (
                <button
                  key={key}
                  onClick={() => setProfile((p) => ({ ...p, experienceLevel: key }))}
                  className={`glass-card rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer group ${
                    profile.experienceLevel === key
                      ? 'border-gaming-accent/60 glow-accent scale-[1.02]'
                      : 'hover:border-gaming-accent/30'
                  }`}
                >
                  <span className="text-3xl mb-3 block">{val.icon}</span>
                  <h3 className="text-white font-semibold text-lg mb-1">{val.label}</h3>
                  <p className="text-white/45 text-sm">{val.desc}</p>
                </button>
              ),
            )}
          </div>
        )

      case 1:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {(Object.entries(PURPOSE_LABELS) as [GamePurpose, typeof PURPOSE_LABELS[GamePurpose]][]).map(
              ([key, val]) => {
                const selected = profile.purposes.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() =>
                      toggleMulti(profile.purposes, key, (updated) =>
                        setProfile((p) => ({ ...p, purposes: updated })),
                      )
                    }
                    className={`glass-card rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${
                      selected
                        ? 'border-gaming-accent/60 glow-accent scale-[1.02]'
                        : 'hover:border-gaming-accent/30'
                    }`}
                  >
                    <span className="text-3xl mb-3 block">{val.icon}</span>
                    <h3 className="text-white font-semibold">{val.label}</h3>
                  </button>
                )
              },
            )}
          </div>
        )

      case 2:
        return (
          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {(Object.entries(GENRE_LABELS) as [GenreType, typeof GENRE_LABELS[GenreType]][]).map(
              ([key, val]) => {
                const selected = profile.genrePreferences.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() =>
                      toggleMulti(profile.genrePreferences, key, (updated) =>
                        setProfile((p) => ({ ...p, genrePreferences: updated })),
                      )
                    }
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer text-sm ${
                      selected
                        ? 'bg-gaming-accent/20 border border-gaming-accent/60 text-gaming-accent-light glow-accent'
                        : 'glass-card text-white/70 hover:text-white hover:border-gaming-accent/30'
                    }`}
                  >
                    <span className="text-lg">{val.icon}</span>
                    <span>{val.label}</span>
                  </button>
                )
              },
            )}
          </div>
        )

      case 3:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-3xl mx-auto">
            {(Object.entries(DEVICE_LABELS) as [DeviceType, typeof DEVICE_LABELS[DeviceType]][]).map(
              ([key, val]) => {
                const selected = profile.devices.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() =>
                      toggleMulti(profile.devices, key, (updated) =>
                        setProfile((p) => ({ ...p, devices: updated })),
                      )
                    }
                    className={`glass-card rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${
                      selected
                        ? 'border-gaming-accent/60 glow-accent scale-[1.02]'
                        : 'hover:border-gaming-accent/30'
                    }`}
                  >
                    <span className="text-3xl mb-3 block">{val.icon}</span>
                    <h3 className="text-white font-semibold text-sm">{val.label}</h3>
                  </button>
                )
              },
            )}
          </div>
        )

      case 4:
        return (
          <div className="max-w-2xl mx-auto space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-gaming-cyan" />
                <h3 className="text-white font-semibold text-lg">每周游戏时间</h3>
              </div>
              <div className="glass-card rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/50 text-sm">几乎不玩</span>
                  <span className="text-gaming-accent-light text-2xl font-bold tabular-nums">
                    {profile.weeklyHours >= 40 ? '40+' : profile.weeklyHours} 小时
                  </span>
                  <span className="text-white/50 text-sm">重度沉迷</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={40}
                  value={profile.weeklyHours}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, weeklyHours: Number(e.target.value) }))
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gaming-card accent-gaming-accent"
                  style={{
                    background: `linear-gradient(to right, #6366F1 0%, #22D3EE ${
                      ((profile.weeklyHours - 1) / 39) * 100
                    }%, rgba(21,26,46,0.85) ${((profile.weeklyHours - 1) / 39) * 100}%)`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <Gamepad2 className="w-5 h-5 text-gaming-emerald" />
                <h3 className="text-white font-semibold text-lg">你喜欢的游戏（选填）</h3>
                <span className="text-white/30 text-sm">{profile.favoriteGames.length}/5</span>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={gameInput}
                    onChange={(e) => setGameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFavoriteGame()}
                    placeholder="输入游戏名称，按回车添加"
                    maxLength={50}
                    className="flex-1 bg-gaming-dark/80 border border-gaming-border rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-gaming-accent/50 transition-colors"
                  />
                  <button
                    onClick={addFavoriteGame}
                    disabled={!gameInput.trim() || profile.favoriteGames.length >= 5}
                    className="px-4 py-3 bg-gaming-accent/20 text-gaming-accent-light rounded-xl hover:bg-gaming-accent/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {profile.favoriteGames.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.favoriteGames.map((game) => (
                      <span
                        key={game}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gaming-accent/15 text-gaming-accent-light text-sm rounded-lg"
                      >
                        {game}
                        <button
                          onClick={() => removeFavoriteGame(game)}
                          className="hover:text-gaming-rose transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gaming-dark flex flex-col">
      <div className="pt-8 pb-4 px-6">
        <div className="max-w-3xl mx-auto">
          <StepIndicator
            currentStep={step + 1}
            steps={stepMeta.map((s, i) => ({ id: i + 1, label: s.title }))}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {stepMeta[step].title}
              </h2>
              <p className="text-white/45">{stepMeta[step].subtitle}</p>
            </div>

            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <div className="mx-6 mb-2 max-w-3xl mx-auto rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gaming-dark/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-10 text-center max-w-sm"
          >
            <Loader2 className="w-10 h-10 text-gaming-accent animate-spin mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">AI 正在分析你的偏好</h3>
            <p className="text-white/45 text-sm">正在从海量游戏中为你精选推荐，请稍候…</p>
          </motion.div>
        </div>
      )}

      <div className="sticky bottom-0 bg-gaming-dark/80 backdrop-blur-xl border-t border-gaming-border py-5 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white/60 hover:text-white rounded-xl transition-colors disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>上一步</span>
          </button>

          <div className="text-white/30 text-sm">
            {step + 1} / {TOTAL_STEPS}
          </div>

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gaming-accent hover:bg-gaming-accent-light text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>下一步</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gaming-accent hover:bg-gaming-accent-light text-white font-medium rounded-xl transition-all duration-300 cursor-pointer group disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI 推荐中…</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  <span>获取推荐</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
