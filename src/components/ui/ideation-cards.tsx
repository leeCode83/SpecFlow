import { motion } from 'motion/react'
import { Quote, ShieldAlert, Clock, TrendingUp, Swords, DollarSign, Sparkles, Cog, Zap, CheckCircle2, BookOpen, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

export type MetricType = 'originality' | 'buildability' | 'impact' | 'feasibility' | 'learningValue' | 'marketSize' | 'monetization'

export interface MetricConfig {
  icon: LucideIcon
  gradientFrom: string
  gradientTo: string
  accentColor: string
  animationType: 'slideLeft' | 'slideRight' | 'fadeUp' | 'scaleIn'
  label: string
}

export const METRIC_CONFIGS: Record<MetricType, MetricConfig> = {
  originality: { icon: Sparkles, gradientFrom: 'from-purple-500', gradientTo: 'to-purple-700', accentColor: '#a855f7', animationType: 'slideLeft', label: 'Originality' },
  buildability: { icon: Cog, gradientFrom: 'from-blue-500', gradientTo: 'to-blue-700', accentColor: '#3b82f6', animationType: 'slideRight', label: 'Buildability' },
  impact: { icon: Zap, gradientFrom: 'from-rose-500', gradientTo: 'to-rose-700', accentColor: '#f43f5e', animationType: 'fadeUp', label: 'Impact' },
  feasibility: { icon: CheckCircle2, gradientFrom: 'from-blue-500', gradientTo: 'to-blue-700', accentColor: '#3b82f6', animationType: 'slideLeft', label: 'Feasibility' },
  learningValue: { icon: BookOpen, gradientFrom: 'from-emerald-500', gradientTo: 'to-emerald-700', accentColor: '#10b981', animationType: 'slideRight', label: 'Learning Value' },
  marketSize: { icon: TrendingUp, gradientFrom: 'from-cyan-500', gradientTo: 'to-cyan-700', accentColor: '#06b6d4', animationType: 'fadeUp', label: 'Market Size' },
  monetization: { icon: DollarSign, gradientFrom: 'from-green-500', gradientTo: 'to-green-700', accentColor: '#22c55e', animationType: 'scaleIn', label: 'Monetization' },
}

const variantMap = {
  slideLeft: { initial: { opacity: 0, x: -24 }, animate: { opacity: 1, x: 0 } },
  slideRight: { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 } },
  fadeUp: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } },
  scaleIn: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
}

function AnimatedCounter({ value, duration = 0.8, delay = 0 }: { value: number; duration?: number; delay?: number }) {
  return (
    <motion.span
      className="text-xl font-bold"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.2 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.01 }}
      >
        {value}
      </motion.span>
    </motion.span>
  )
}

export function MetricCard({ type, score, index }: { type: MetricType; score: number; index: number }) {
  const config = METRIC_CONFIGS[type]
  const Icon = config.icon
  const anim = variantMap[config.animationType]
  const staggerDelay = 0.2 + index * 0.1

  return (
    <motion.div
      initial={anim.initial}
      animate={anim.animate}
      transition={{ delay: staggerDelay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative overflow-hidden rounded-xl border bg-card/80 p-4 group hover:shadow-xl transition-all duration-300"
      style={{ borderColor: `${config.accentColor}20` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${config.accentColor}40, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-lg transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${config.accentColor}15` }}
            >
              <Icon className="w-4 h-4" style={{ color: config.accentColor }} />
            </div>
            <span className="text-sm font-bold text-foreground/80">{config.label}</span>
          </div>
          <div className="flex items-baseline gap-0.5 tabular-nums">
            <AnimatedCounter value={score} delay={staggerDelay} />
            <span className="text-xs text-muted-foreground font-medium">/10</span>
          </div>
        </div>

        <div className="h-2 bg-background rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score * 10}%` }}
            transition={{ delay: staggerDelay + 0.3, duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full relative overflow-hidden"
            style={{ background: `linear-gradient(90deg, ${config.accentColor}, ${config.accentColor}88)` }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: staggerDelay + 0.3 }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function PitchQuote({ text, delay = 0 }: { text?: string; delay?: number }) {
  if (!text) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/90 via-card/50 to-card/30 border-border/60 p-6 rounded-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
        <Quote className="w-6 h-6 text-primary/40 mb-3" />
        <p className="text-foreground/80 italic text-sm leading-relaxed relative z-10">{text}</p>
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
            const severity = parts[0].toLowerCase().includes('high') ? 'high' : parts[0].toLowerCase().includes('medium') ? 'medium' : 'low'
            const sevColor = severity === 'high' ? 'text-destructive border-destructive/30 bg-destructive/10' : severity === 'medium' ? 'text-warning border-warning/30 bg-warning/10' : 'text-success border-success/30 bg-success/10'
            const SevIcon = severity === 'high' ? AlertTriangle : severity === 'medium' ? Info : CheckCircle2

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 + i * 0.08 }}
                className="flex gap-3 items-start p-4 rounded-xl bg-background/50 border border-border/60 group hover:shadow-md transition-all duration-200"
              >
                <span className={cn('shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border', sevColor)}>
                  <SevIcon className="w-3 h-3" />
                </span>
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
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/90 via-card/50 to-card/30 border-border/60 p-6 rounded-2xl space-y-4">
        <div className="absolute top-0 left-0 w-24 h-24 bg-brand/5 rounded-full blur-[50px] pointer-events-none" />
        <h3 className="text-base font-bold flex items-center gap-2 relative z-10">
          <Clock className="w-4 h-4 text-brand" />
          Difficulty & Time
        </h3>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          {difficultyLevel && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level</span>
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.3, ease: 'backOut' }}
                className={cn('inline-block px-4 py-1.5 rounded-lg border text-xs font-bold', colorClass)}
              >
                {difficultyLevel}
              </motion.span>
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
      <div className="flex gap-3 items-start p-4 rounded-xl bg-gradient-to-r from-background/80 via-background/50 to-background/80 border border-border/60 group hover:shadow-md transition-all duration-200">
        <Swords className="w-4 h-4 text-brand shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Competitive Edge</span>
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
      <div className="flex gap-3 items-start p-4 rounded-xl bg-gradient-to-r from-background/80 via-background/50 to-background/80 border border-border/60 group hover:shadow-md transition-all duration-200">
        <DollarSign className="w-4 h-4 text-success shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200" />
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

export { PitchQuote, RiskCards, DifficultyBadge, CompetitorInsight, MonetizationModel, CopyAnalysisButton }
