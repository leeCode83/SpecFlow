import { motion } from 'motion/react'
import { Quote, ShieldAlert, Clock, TrendingUp, Swords, DollarSign, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

function PitchQuote({ text, delay = 0 }: { text?: string; delay?: number }) {
  if (!text) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="bg-slate-900/50 border-slate-800 p-6 rounded-2xl">
        <Quote className="w-5 h-5 text-orange-500/50 mb-2" />
        <p className="text-slate-300 italic text-sm leading-relaxed">{text}</p>
      </Card>
    </motion.div>
  )
}

function RiskCards({ risks, delay = 0 }: { risks?: string[]; delay?: number }) {
  if (!risks || risks.length === 0) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="bg-slate-900/50 border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Key Risks & Mitigations
        </h3>
        <div className="space-y-3">
          {risks.map((risk, i) => {
            const parts = risk.split(' — ')
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 + i * 0.08 }}
                className="flex gap-3 items-start p-3 rounded-xl bg-slate-950/50 border border-slate-800/60"
              >
                <span className="text-amber-500 font-bold text-xs shrink-0 mt-0.5">0{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-300">{parts[0]}</p>
                  {parts[1] && (
                    <p className="text-xs text-slate-500 mt-1">Mitigation: {parts[1]}</p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )
}

function DifficultyBadge({
  difficultyLevel,
  timeEstimateHours,
  delay = 0,
}: {
  difficultyLevel?: string
  timeEstimateHours?: string
  delay?: number
}) {
  if (!difficultyLevel && !timeEstimateHours) return null

  const colorMap: Record<string, string> = {
    Beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  const colorClass = colorMap[difficultyLevel || ''] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="bg-slate-900/50 border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          Difficulty & Time
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {difficultyLevel && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Level</span>
              <span className={cn('inline-block px-3 py-1 rounded-lg border text-xs font-bold', colorClass)}>
                {difficultyLevel}
              </span>
            </div>
          )}
          {timeEstimateHours && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Time Estimate</span>
              <p className="text-sm text-slate-300 font-medium">{timeEstimateHours}</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function CompetitorInsight({
  text,
  delay = 0,
}: {
  text?: string
  delay?: number
}) {
  if (!text) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="flex gap-3 items-start p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
        <Swords className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Competitive Edge</span>
          <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
        </div>
      </div>
    </motion.div>
  )
}

function TechJustification({
  text,
  delay = 0,
}: {
  text?: string
  delay?: number
}) {
  if (!text) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="flex gap-3 items-start p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
        <Cpu className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Tech Rationale</span>
          <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
        </div>
      </div>
    </motion.div>
  )
}

function MonetizationModel({
  text,
  delay = 0,
}: {
  text?: string
  delay?: number
}) {
  if (!text) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="flex gap-3 items-start p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
        <DollarSign className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Monetization Model</span>
          <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
        </div>
      </div>
    </motion.div>
  )
}

function CopyAnalysisButton({ feedback }: { feedback: Record<string, unknown> | null }) {
  if (!feedback) return null

  const handleCopy = async () => {
    try {
      const text = JSON.stringify(feedback, null, 2)
      await navigator.clipboard.writeText(text)
    } catch {
      // fallback silently
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <button
        onClick={handleCopy}
        className="w-full py-3 rounded-xl border border-slate-700/50 text-sm text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/50 transition-all duration-200"
      >
        Copy Full Analysis
      </button>
    </motion.div>
  )
}

export { PitchQuote, RiskCards, DifficultyBadge, CompetitorInsight, TechJustification, MonetizationModel, CopyAnalysisButton }
