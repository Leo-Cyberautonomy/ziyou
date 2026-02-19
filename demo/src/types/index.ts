export interface Game {
  id: string
  name: string
  nameEn: string
  cover: string
  screenshots: string[]
  genres: string[]
  platforms: string[]
  devices: string[]
  releaseYear: number
  scores: {
    metacritic: number
    ign: number
    taptap: number
  }
  description: string
  recommendReason: string
  videoUrl: string
  buyLinks: BuyLink[]
  tags: string[]
  developer: string
  publisher: string
  playtime: string
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard'
}

export interface BuyLink {
  platform: string
  url: string
  price: string
  icon: string
}

export type ExperienceLevel = 'beginner' | 'casual' | 'moderate' | 'hardcore'
export type GamePurpose = 'competitive' | 'relaxing' | 'story' | 'social' | 'creative'
export type GenreType = 'action' | 'rpg' | 'shooter' | 'strategy' | 'simulation' | 'adventure' | 'sports' | 'puzzle' | 'racing' | 'horror' | 'rhythm' | 'roguelike'
export type DeviceType = 'phone' | 'tablet' | 'pc' | 'handheld' | 'console'
export type PlatformType = 'steam' | 'epic' | 'psstore' | 'eshop' | 'appstore' | 'googleplay' | 'xbox'
export type AgePreference = 'classic' | 'new' | 'both'

export interface PlayerProfile {
  experienceLevel: ExperienceLevel
  weeklyHours: number
  purposes: GamePurpose[]
  genrePreferences: GenreType[]
  devices: DeviceType[]
  platformPreferences: PlatformType[]
  agePreference: AgePreference
  favoriteGames: string[]
}

export interface SurveyStep {
  id: number
  title: string
  subtitle: string
  type: 'single' | 'multi' | 'slider' | 'tags' | 'text-list'
}

export const EXPERIENCE_LABELS: Record<ExperienceLevel, { label: string; desc: string; icon: string }> = {
  beginner: { label: '纯新手', desc: '很少或从未玩过游戏', icon: '🌱' },
  casual: { label: '轻度玩家', desc: '偶尔玩玩，不太深入', icon: '🎮' },
  moderate: { label: '中度玩家', desc: '有一定经验，会主动找游戏玩', icon: '⚔️' },
  hardcore: { label: '硬核玩家', desc: '游戏老手，追求挑战和深度', icon: '🏆' },
}

export const PURPOSE_LABELS: Record<GamePurpose, { label: string; icon: string }> = {
  competitive: { label: '竞技对抗', icon: '🎯' },
  relaxing: { label: '休闲放松', icon: '☕' },
  story: { label: '剧情沉浸', icon: '📖' },
  social: { label: '社交互动', icon: '👥' },
  creative: { label: '创意建造', icon: '🔨' },
}

export const GENRE_LABELS: Record<GenreType, { label: string; icon: string }> = {
  action: { label: '动作', icon: '⚡' },
  rpg: { label: 'RPG', icon: '🗡️' },
  shooter: { label: '射击', icon: '🔫' },
  strategy: { label: '策略', icon: '♟️' },
  simulation: { label: '模拟', icon: '🏗️' },
  adventure: { label: '冒险', icon: '🗺️' },
  sports: { label: '体育', icon: '⚽' },
  puzzle: { label: '解谜', icon: '🧩' },
  racing: { label: '竞速', icon: '🏎️' },
  horror: { label: '恐怖', icon: '👻' },
  rhythm: { label: '音游', icon: '🎵' },
  roguelike: { label: 'Roguelike', icon: '🎲' },
}

export const DEVICE_LABELS: Record<DeviceType, { label: string; icon: string }> = {
  phone: { label: '手机', icon: '📱' },
  tablet: { label: '平板', icon: '📲' },
  pc: { label: 'PC', icon: '💻' },
  handheld: { label: '掌机', icon: '🎮' },
  console: { label: '主机', icon: '🖥️' },
}

export const PLATFORM_LABELS: Record<PlatformType, { label: string }> = {
  steam: { label: 'Steam' },
  epic: { label: 'Epic Games' },
  psstore: { label: 'PlayStation Store' },
  eshop: { label: 'Nintendo eShop' },
  appstore: { label: 'App Store' },
  googleplay: { label: 'Google Play' },
  xbox: { label: 'Xbox Store' },
}
