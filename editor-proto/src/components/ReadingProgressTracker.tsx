import React, { useState, useEffect } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { useSceneStore } from '../store/useSceneStore'

interface ReadingSession {
  id: string
  startTime: Date
  endTime?: Date
  sceneId: string
  sceneName: string
  wordsRead: number
  timeSpent: number // minutes
  scrollProgress: number // 0-100%
}

interface ReadingStats {
  totalSessions: number
  totalTimeSpent: number // minutes
  totalWordsRead: number
  averageReadingSpeed: number // words per minute
  sessionsToday: number
  currentStreak: number // consecutive days
  longestStreak: number
  favoriteScenes: string[]
  readingGoal: number // minutes per day
  goalProgress: number // 0-100%
}

export const ReadingProgressTracker: React.FC = () => {
  const { getCurrentScene } = useSceneStore()
  const currentScene = getCurrentScene()
  
  const [currentSession, setCurrentSession] = useState<ReadingSession | null>(null)
  const [readingStats, setReadingStats] = useState<ReadingStats>({
    totalSessions: 0,
    totalTimeSpent: 0,
    totalWordsRead: 0,
    averageReadingSpeed: 0,
    sessionsToday: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteScenes: [],
    readingGoal: 30, // 30分/日がデフォルト
    goalProgress: 0
  })
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // 読書セッションの開始
  const startReadingSession = () => {
    if (!currentScene || currentSession) return

    const newSession: ReadingSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      sceneId: currentScene.id,
      sceneName: currentScene.title,
      wordsRead: 0,
      timeSpent: 0,
      scrollProgress: 0
    }

    setCurrentSession(newSession)
    saveSessionToStorage(newSession)
  }

  // 読書セッションの終了
  const endReadingSession = () => {
    if (!currentSession) return

    const endTime = new Date()
    const timeSpent = Math.round((endTime.getTime() - currentSession.startTime.getTime()) / (1000 * 60))
    
    const completedSession: ReadingSession = {
      ...currentSession,
      endTime,
      timeSpent,
      scrollProgress,
      wordsRead: estimateWordsRead()
    }

    // セッションを保存
    saveCompletedSession(completedSession)
    
    // 統計を更新
    updateReadingStats(completedSession)
    
    setCurrentSession(null)
  }

  // 読んだ単語数を推定
  const estimateWordsRead = (): number => {
    if (!currentScene) return 0
    
    const content = currentScene.content || ''
    const totalWords = content.split(/\s+/).length
    const wordsRead = Math.round(totalWords * (scrollProgress / 100))
    
    return wordsRead
  }

  // スクロール進捗の更新
  const updateScrollProgress = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
    
    setScrollProgress(Math.min(100, Math.max(0, progress)))
  }

  // セッションをローカルストレージに保存
  const saveSessionToStorage = (session: ReadingSession) => {
    const sessions = getStoredSessions()
    sessions.push(session)
    localStorage.setItem('reading-sessions', JSON.stringify(sessions))
  }

  // 完了したセッションを保存
  const saveCompletedSession = (session: ReadingSession) => {
    const sessions = getStoredSessions()
    const index = sessions.findIndex(s => s.id === session.id)
    
    if (index >= 0) {
      sessions[index] = session
    } else {
      sessions.push(session)
    }
    
    localStorage.setItem('reading-sessions', JSON.stringify(sessions))
  }

  // 保存されたセッションを取得
  const getStoredSessions = (): ReadingSession[] => {
    try {
      const stored = localStorage.getItem('reading-sessions')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // 読書統計を更新
  const updateReadingStats = (completedSession: ReadingSession) => {
    const sessions = getStoredSessions()
    const today = new Date().toDateString()
    
    const todaySessions = sessions.filter(s => 
      s.endTime && new Date(s.endTime).toDateString() === today
    )
    
    const totalTimeToday = todaySessions.reduce((sum, s) => sum + s.timeSpent, 0)
    const totalWordsToday = todaySessions.reduce((sum, s) => sum + s.wordsRead, 0)
    
    const allCompletedSessions = sessions.filter(s => s.endTime)
    const totalTime = allCompletedSessions.reduce((sum, s) => sum + s.timeSpent, 0)
    const totalWords = allCompletedSessions.reduce((sum, s) => sum + s.wordsRead, 0)
    
    const averageSpeed = totalTime > 0 ? Math.round(totalWords / totalTime) : 0
    const goalProgress = Math.min(100, Math.round((totalTimeToday / readingStats.readingGoal) * 100))
    
    // 連続日数の計算
    const { currentStreak, longestStreak } = calculateStreaks(sessions)
    
    // お気に入りシーンの計算
    const favoriteScenes = calculateFavoriteScenes(sessions)

    setReadingStats({
      totalSessions: allCompletedSessions.length,
      totalTimeSpent: totalTime,
      totalWordsRead: totalWords,
      averageReadingSpeed: averageSpeed,
      sessionsToday: todaySessions.length,
      currentStreak,
      longestStreak,
      favoriteScenes,
      readingGoal: readingStats.readingGoal,
      goalProgress
    })
  }

  // 連続日数を計算
  const calculateStreaks = (sessions: ReadingSession[]) => {
    const completedSessions = sessions.filter(s => s.endTime)
    if (completedSessions.length === 0) return { currentStreak: 0, longestStreak: 0 }

    // 日付ごとにグループ化
    const sessionsByDate = new Map<string, ReadingSession[]>()
    completedSessions.forEach(session => {
      const date = new Date(session.endTime!).toDateString()
      if (!sessionsByDate.has(date)) {
        sessionsByDate.set(date, [])
      }
      sessionsByDate.get(date)!.push(session)
    })

    const dates = Array.from(sessionsByDate.keys()).sort()
    
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    const today = new Date().toDateString()
    let checkDate = new Date()
    
    // 現在の連続日数を計算
    for (let i = 0; i < 30; i++) { // 最大30日前まで確認
      const dateStr = checkDate.toDateString()
      if (sessionsByDate.has(dateStr)) {
        currentStreak++
      } else if (dateStr !== today) {
        break
      }
      checkDate.setDate(checkDate.getDate() - 1)
    }
    
    // 最長連続日数を計算
    let lastDate: Date | null = null
    for (const dateStr of dates) {
      const currentDate = new Date(dateStr)
      
      if (lastDate && (currentDate.getTime() - lastDate.getTime()) === 24 * 60 * 60 * 1000) {
        tempStreak++
      } else {
        tempStreak = 1
      }
      
      longestStreak = Math.max(longestStreak, tempStreak)
      lastDate = currentDate
    }

    return { currentStreak, longestStreak }
  }

  // お気に入りシーンを計算
  const calculateFavoriteScenes = (sessions: ReadingSession[]): string[] => {
    const sceneTime = new Map<string, number>()
    
    sessions.filter(s => s.endTime).forEach(session => {
      const current = sceneTime.get(session.sceneName) || 0
      sceneTime.set(session.sceneName, current + session.timeSpent)
    })
    
    return Array.from(sceneTime.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sceneName]) => sceneName)
  }

  // 読書目標の設定
  const setReadingGoal = (minutes: number) => {
    setReadingStats(prev => ({
      ...prev,
      readingGoal: minutes,
      goalProgress: Math.min(100, Math.round((prev.totalTimeSpent / minutes) * 100))
    }))
    localStorage.setItem('reading-goal', minutes.toString())
  }

  // 時間フォーマット
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}分`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}時間${mins > 0 ? `${mins}分` : ''}`
  }

  // 初期化
  useEffect(() => {
    // 保存された目標を読み込み
    const savedGoal = localStorage.getItem('reading-goal')
    if (savedGoal) {
      const goal = parseInt(savedGoal)
      setReadingStats(prev => ({ ...prev, readingGoal: goal }))
    }

    // 統計を初期化
    const sessions = getStoredSessions()
    if (sessions.length > 0) {
      updateReadingStats(sessions[sessions.length - 1])
    }

    // スクロールイベントリスナー
    const handleScroll = () => updateScrollProgress()
    window.addEventListener('scroll', handleScroll)
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // シーン変更時の処理
  useEffect(() => {
    if (currentSession && currentScene && currentSession.sceneId !== currentScene.id) {
      // 前のセッションを終了
      endReadingSession()
      
      // 新しいセッションを開始
      setTimeout(() => startReadingSession(), 100)
    }
  }, [currentScene])

  // 自動セッション開始（5秒後）
  useEffect(() => {
    if (!currentSession && currentScene) {
      const timer = setTimeout(() => {
        startReadingSession()
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [currentScene, currentSession])

  // ページ離脱時にセッション終了
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSession) {
        endReadingSession()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentSession])

  return (
    <div className="reading-progress-tracker">
      {/* 進捗インジケーター */}
      <div className="reading-progress-indicator">
        <div 
          className="progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 統計表示トグル */}
      <button 
        className="stats-toggle"
        onClick={() => setIsVisible(!isVisible)}
        title="読書統計を表示"
      >
        📊
      </button>

      {/* 統計パネル */}
      {isVisible && (
        <div className="reading-stats-panel">
          <div className="stats-header">
            <h3>📚 読書統計</h3>
            <button onClick={() => setIsVisible(false)}>×</button>
          </div>

          <div className="stats-content">
            {/* 今日の進捗 */}
            <div className="stat-section">
              <h4>今日の進捗</h4>
              <div className="goal-progress">
                <div className="goal-bar">
                  <div 
                    className="goal-fill"
                    style={{ width: `${readingStats.goalProgress}%` }}
                  />
                </div>
                <span>{readingStats.goalProgress}% 達成</span>
              </div>
              <div className="today-stats">
                <span>セッション: {readingStats.sessionsToday}回</span>
                <span>目標: {formatTime(readingStats.readingGoal)}</span>
              </div>
            </div>

            {/* 全体統計 */}
            <div className="stat-section">
              <h4>全体統計</h4>
              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-value">{readingStats.totalSessions}</span>
                  <span className="stat-label">総セッション数</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{formatTime(readingStats.totalTimeSpent)}</span>
                  <span className="stat-label">総読書時間</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{readingStats.totalWordsRead.toLocaleString()}</span>
                  <span className="stat-label">総読書語数</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{readingStats.averageReadingSpeed}</span>
                  <span className="stat-label">語/分</span>
                </div>
              </div>
            </div>

            {/* 連続記録 */}
            <div className="stat-section">
              <h4>連続記録</h4>
              <div className="streak-stats">
                <div className="streak-item">
                  <span className="streak-value">{readingStats.currentStreak}</span>
                  <span className="streak-label">現在の連続日数</span>
                </div>
                <div className="streak-item">
                  <span className="streak-value">{readingStats.longestStreak}</span>
                  <span className="streak-label">最長連続日数</span>
                </div>
              </div>
            </div>

            {/* お気に入りシーン */}
            {readingStats.favoriteScenes.length > 0 && (
              <div className="stat-section">
                <h4>よく読むシーン</h4>
                <div className="favorite-scenes">
                  {readingStats.favoriteScenes.map((scene, index) => (
                    <div key={scene} className="favorite-scene">
                      <span className="scene-rank">#{index + 1}</span>
                      <span className="scene-name">{scene}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 目標設定 */}
            <div className="stat-section">
              <h4>読書目標設定</h4>
              <div className="goal-setting">
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={readingStats.readingGoal}
                  onChange={(e) => setReadingGoal(parseInt(e.target.value))}
                />
                <span>{formatTime(readingStats.readingGoal)}/日</span>
              </div>
            </div>
          </div>

          {/* 現在のセッション */}
          {currentSession && (
            <div className="current-session">
              <div className="session-info">
                <span>📖 読書中: {currentSession.sceneName}</span>
                <span>進捗: {scrollProgress}%</span>
              </div>
              <button 
                className="end-session-btn"
                onClick={endReadingSession}
              >
                セッション終了
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
