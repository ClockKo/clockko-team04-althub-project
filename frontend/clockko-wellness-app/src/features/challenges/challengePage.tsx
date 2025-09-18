import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { cn } from '../../lib/utils'
import greenlight from '../../assets/images/greenlight.png'
import teacup from '../../assets/images/teacuppurple.png'
import flame from '../../assets/images/flame.png'
import checkmark from '../../assets/images/checkmark.png'
import {
  fetchChallenges,
  fetchLeaders,
  fetchChallengeStats,
  startChallenge,
} from '../challenges/api'
import type { Challenge, Leader, ChallengeStats } from '../challenges/api'
import ChallengePoses from '../../assets/images/ChallengePoses.png'
import { useState, useEffect } from 'react'

// ---- DEMO DATA (for when backend API is not available) ----
const DEMO_CHALLENGES: Challenge[] = [
  {
    id: '1',
    name: 'Healthy Boundaries',
    description: 'Log off before 5pm for 5 days',
    points: 75,
    joinedCount: 145,
    joinedAvatars: ['/avatars/avatar1.png', '/avatars/avatar2.png', '/avatars/avatar3.png'],
    progress: 0,
    total: 5,
    status: 'not_started',
  },
  {
    id: '2',
    name: 'Focus Sprint Master',
    description: 'Complete 10 focus sessions',
    points: 75,
    joinedCount: 145,
    joinedAvatars: ['/avatars/avatar1.png', '/avatars/avatar2.png', '/avatars/avatar3.png'],
    progress: 0,
    total: 10,
    status: 'not_started',
  },
  {
    id: '3',
    name: 'Break Champion',
    description: 'Take proper breaks during 5 work sessions',
    points: 75,
    joinedCount: 145,
    joinedAvatars: ['/avatars/avatar1.png', '/avatars/avatar2.png', '/avatars/avatar3.png'],
    progress: 0,
    total: 5,
    status: 'not_started',
  },
]

const DEMO_LEADERS: Leader[] = [
  { rank: 1, name: 'Sophie L.', avatar: '/avatars/avatar1.png', points: 1245 },
  { rank: 2, name: 'Femi K.', avatar: '/avatars/avatar2.png', points: 1180 },
  { rank: 3, name: 'Mary S.', avatar: '/avatars/avatar3.png', points: 1095 },
  { rank: 4, name: 'You', avatar: '/avatars/avatar4.png', points: 0, isCurrentUser: true },
  { rank: 5, name: 'Femi K.', avatar: '/avatars/avatar2.png', points: 745 },
  { rank: 6, name: 'Tolu B.', avatar: '/avatars/avatar5.png', points: 680 },
  { rank: 7, name: 'Maggy C.', avatar: '/avatars/avatar6.png', points: 620 },
]

const DEMO_STATS: ChallengeStats = {
  totalPoints: 0,
  challengesDone: 0,
  shutdownStreak: 0,
  avgShutdownTime: '0',
}

// React Query Hooks
function useChallengeStats() {
  return useQuery({ queryKey: ['challengeStats'], queryFn: fetchChallengeStats })
}
function useChallenges() {
  return useQuery({ queryKey: ['challenges'], queryFn: fetchChallenges })
}
function useLeaders() {
  return useQuery({ queryKey: ['leaders'], queryFn: fetchLeaders })
}
function useStartChallenge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: startChallenge,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenges'] })
      qc.invalidateQueries({ queryKey: ['challengeStats'] })
      qc.invalidateQueries({ queryKey: ['leaders'] })
    },
  })
}

// Skeleton Components
function ChallengeCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 mb-3 shadow bg-white animate-pulse">
      <div className="flex justify-between items-center mb-1">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-6 h-6 bg-gray-200 rounded-full"></div>
          ))}
        </div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow lg:max-w-lg">
      <div className="font-semibold text-lg mb-2 text-center">This Week's Leaders</div>
      <div>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 px-2 rounded-lg mb-1">
            <div className="flex items-center gap-3">
              <div className="w-6 h-4 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// StatCard Component
function StatCard({
  icon,
  value,
  label,
  color,
  width,
}: {
  icon: React.ReactNode
  value: React.ReactNode
  label: string
  color?: string
  width?: string
}) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl bg-white p-4 flex flex-row gap-2 items-center shadow',
        color,
        width
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-3xl">{icon}</div>
      <div className="mx-4">
        <div className="font-bold text-2xl">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </motion.div>
  )
}

// ChallengeCard Component
function ChallengeCard({
  challenge,
  onStart,
}: {
  challenge: Challenge
  onStart: (id: string) => void
}) {
  const isInProgress = challenge.status === 'in_progress'
  const isCompleted = challenge.status === 'completed'
  return (
    <motion.div
      className={cn(
        'rounded-2xl p-4 mb-3 shadow bg-white',
        isInProgress && 'bg-indigo-50 border border-indigo-200',
        isCompleted && 'bg-green-50 border border-green-200'
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="font-semibold text-lg">{challenge.name}</div>
        <div className="text-blue1 font-bold text-sm">{challenge.points} Points</div>
      </div>
      <div className="text-gray-500 text-sm mb-2">{challenge.description}</div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex -space-x-2">
          {challenge.joinedAvatars.slice(0, 3).map((img, i) => (
            <Avatar key={i} className="w-6 h-6 border-2 border-white">
              <AvatarImage src={img} alt="" />
              <AvatarFallback className="text-xs bg-gray-200">
                {String.fromCharCode(65 + i)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className="text-xs text-gray-400">+{challenge.joinedCount} Joined</span>
      </div>
      {isInProgress && challenge.progress !== undefined && challenge.total !== undefined && (
        <div className="mb-2">
          <div className="text-xs mb-1">Progress</div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue1 rounded-full"
              style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
            />
          </div>
          <div className="text-xs text-right mt-1">
            {challenge.progress}/{challenge.total}
          </div>
        </div>
      )}
      <div>
        {isCompleted ? (
          <Button disabled variant="outline" className="w-full">
            Completed
          </Button>
        ) : isInProgress ? (
          <Button disabled variant="outline" className="w-full">
            In Progress
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => onStart(challenge.id)}>
            Start Challenge
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// Leaderboard Component
function Leaderboard({ leaders }: { leaders: Leader[] }) {
  return (
    <motion.div
      className="rounded-2xl  p-4 lg:max-w-lg lg:bg-white lg:rounded-2xl lg:shadow"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="font-semibold text-lg mb-2 text-center">This Week's Leaders</div>
      <div className="px-[1.5rem] bg-white rounded-2xl shadow p-4 lg:bg-transparent lg:rounded-none lg:shadow-none">
        {leaders.map((l) => (
          <div
            key={l.rank}
            className={cn(
              'flex items-center justify-between py-2 px-2 rounded-lg mb-1',
              l.isCurrentUser && 'bg-indigo-100'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-500">#{l.rank}</span>
              <Avatar className="w-8 h-8">
                <AvatarImage src={l.avatar} alt={l.name} />
                <AvatarFallback className="bg-gray-200 text-sm font-medium">
                  {l.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <span className={cn('font-medium', l.isCurrentUser && 'text-indigo-700')}>
                {l.name}
              </span>
            </div>
            <span className="font-semibold text-blue1">{l.points} Points</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Main Page
export default function ChallengesPage() {
  // Store previous leader data for fallback
  const [prevLeaderData, setPrevLeaderData] = useState<Leader[]>([])

  const { data: stats, isLoading: statsLoading } = useChallengeStats()
  const { data: challenges, isLoading: challengesLoading } = useChallenges()
  const { data: leaders, isLoading: leadersLoading, refetch: refetchLeaders } = useLeaders()
  const startChallengeMutation = useStartChallenge()

  // Use demo data as fallback when API calls fail or are loading
  const displayStats = stats || DEMO_STATS
  const displayChallenges = challenges || DEMO_CHALLENGES
  // Leaderboard state logic
  const [showKoalaEmpty, setShowKoalaEmpty] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderData, setLeaderData] = useState<Leader[]>([])

  // Show koala empty state if user hasn't started any challenges
  useEffect(() => {
    if (displayStats.challengesDone === 0) {
      setShowKoalaEmpty(true)
      setShowSkeleton(false)
      setShowLeaderboard(false)
      setLeaderData([])
      // After 3.5 seconds, show skeleton and try to fetch leaders
      const timer = setTimeout(() => {
        setShowKoalaEmpty(false)
        setShowSkeleton(true)
        refetchLeaders()
      }, 3500)
      return () => clearTimeout(timer)
    } else {
      setShowKoalaEmpty(false)
      setShowSkeleton(false)
      setShowLeaderboard(true)
    }
  }, [displayStats.challengesDone, refetchLeaders])

  // When leaders data is fetched, show leaderboard or fallback
  useEffect(() => {
    if (showSkeleton && !leadersLoading) {
      setShowSkeleton(false)
      if (leaders && leaders.length > 0) {
        setLeaderData(leaders)
        setPrevLeaderData(leaders)
      } else {
        setLeaderData(DEMO_LEADERS)
        setPrevLeaderData(DEMO_LEADERS)
      }
      setShowLeaderboard(true)
    }
  }, [leaders, leadersLoading, showSkeleton])

  // Refresh leaderboard every 1 hour
  useEffect(() => {
    const interval = setInterval(() => {
      refetchLeaders().then((result) => {
        const newLeaders = result.data
        if (newLeaders && newLeaders.length > 0) {
          setLeaderData(newLeaders)
          setPrevLeaderData(newLeaders)
        } else {
          // fallback to previous result
          setLeaderData(prevLeaderData.length > 0 ? prevLeaderData : DEMO_LEADERS)
        }
      })
    }, 3600000) // 1 hour in ms
    return () => clearInterval(interval)
  }, [refetchLeaders, prevLeaderData])

  function handleStartChallenge(id: string) {
    startChallengeMutation.mutate(id)
  }

  return (
    <div className="min-h-screen w-screen bg-powderBlue md:px-2 xs:px-4 py-2 lg:w-[80vw] max-w-[1440px]">
      <div className="mb-6 p-8">
        <h1 className="text-2xl font-regular mb-2">Challenges & Rewards</h1>
        <div className="grid grid-rows-2 lg:grid-cols-4 gap-4 mb-4 mt-8 lg:gap-2">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 mb-4 lg:mb-0">
            <StatCard
              icon={<img src={greenlight} alt="green light icon" />}
              value={statsLoading ? '...' : displayStats.totalPoints}
              label="Total Points"
              color="bg-white"
              width="w-full"
            />
            <StatCard
              icon={<img src={checkmark} alt="checkmark icon" />}
              value={statsLoading ? '...' : displayStats.challengesDone}
              label="Challenges Done"
              color="bg-white"
              width="w-full"
            />
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <StatCard
              icon={<img src={flame} alt="yellow flame icon" />}
              value={statsLoading ? '...' : displayStats.shutdownStreak}
              label="Shutdown Streak"
              color="bg-white"
              width="w-full"
            />
            <StatCard
              icon={<img src={teacup} alt="tea cup icon" />}
              value={statsLoading ? '...' : displayStats.avgShutdownTime}
              label="Avg Shutdown Time"
              color="bg-white"
              width="w-full"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center lg:text-left px-[1.5rem]">
          <div className="font-semibold text-lg mb-2 text-center lg:text-left lg:mt-[-2rem]">
            This Week's Challenges
          </div>
          {challengesLoading ? (
            <>
              <ChallengeCardSkeleton />
              <ChallengeCardSkeleton />
              <ChallengeCardSkeleton />
            </>
          ) : (
            displayChallenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} onStart={handleStartChallenge} />
            ))
          )}
        </div>
        {/* Leaderboard logic: koala empty, skeleton, or leaderboard */}
        {showKoalaEmpty ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <img src={ChallengePoses} alt="Koala pose" className="w-[80%] mb-4" />
          </div>
        ) : showSkeleton ? (
          <LeaderboardSkeleton />
        ) : showLeaderboard ? (
          <Leaderboard leaders={leaderData} />
        ) : null}
      </div>
    </div>
  )
}
