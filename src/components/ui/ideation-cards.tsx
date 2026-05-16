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
      <Card className="bg-card/50 border-border p-6 rounded-2xl">
        <Quote className="w-5 h-5 text-brand/50 mb-2" />
        <p className="text-foreground/80 italic text-sm leading-relaxed">{text}</p>
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
      <Card className="bg-card/50 border-border p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-warning" />
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
                className="flex gap-3 items-start p-3 rounded-xl bg-background/50 border border-border/60"
              >
                <span className="text-warning font-bold text-xs shrink-0 mt-0.5">0{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm text-foreground/80">{parts[0]}</p>
                  {parts[1] && (
                    <p className="text-xs text-muted-foreground mt-1">Mitigation: {parts[1]}</p>
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
    Beginner: 'bg-success/10 text-success border-success/20',
    Intermediate: 'bg-warning/10 text-warning border-warning/20',
    Advanced: 'bg-destructive/10 text-destructive border-destructive/20',
  }
  const colorClass = colorMap[difficultyLevel || ''] || 'bg-muted/10 text-muted-foreground border-muted/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="bg-card/50 border-border p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand" />
          Difficulty & Time
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {difficultyLevel && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level</span>
              <span className={cn('inline-block px-3 py-1 rounded-lg border text-xs font-bold', colorClass)}>
                {difficultyLevel}
              </span>
            </div>
          )}
          {timeEstimateHours && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time Estimate</span>
              <p className="text-sm text-foreground/80 font-medium">{timeEstimateHours}</p>
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
      <div className="flex gap-3 items-start p-4 rounded-xl bg-background/50 border border-border/60">
        <Swords className="w-4 h-4 text-brand shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Competitive Edge</span>
          <p className="text-sm text-foreground/80 leading-relaxed">{text}</p>
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
      <div className="flex gap-3 items-start p-4 rounded-xl bg-background/50 border border-border/60">
        <Cpu className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Tech Rationale</span>
          <p className="text-sm text-foreground/80 leading-relaxed">{text}</p>
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
      <div className="flex gap-3 items-start p-4 rounded-xl bg-background/50 border border-border/60">
        <DollarSign className="w-4 h-4 text-success shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Monetization Model</span>
          <p className="text-sm text-foreground/80 leading-relaxed">{text}</p>
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
        className="w-full py-3 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-white hover:border-border hover:bg-muted/50 transition-all duration-200"
      >
        Copy Full Analysis
      </button>
    </motion.div>
  )
}

export { PitchQuote, RiskCards, DifficultyBadge, CompetitorInsight, TechJustification, MonetizationModel, CopyAnalysisButton }
