import type { ComponentType } from 'react'
import { SequenceSwimlane } from '@/components/viz/SequenceSwimlane'
import { AnimatedPipeline } from '@/components/viz/AnimatedPipeline'
import { EventLoopClock } from '@/components/viz/EventLoopClock'
import { QueueLanes } from '@/components/viz/QueueLanes'
import { TwoPanelCompare } from '@/components/viz/TwoPanelCompare'
import { URLMatcher } from '@/components/viz/URLMatcher'
import type { VizStep } from '@/content/types'

export interface VizProps {
  steps: VizStep[]
  currentStep: number
  onStep: (step: number) => void
  onPlay: () => void
  onReset: () => void
}

const registry: Record<string, ComponentType<VizProps>> = {
  SequenceSwimlane,
  AnimatedPipeline,
  EventLoopClock,
  QueueLanes,
  TwoPanelCompare,
  URLMatcher,
}

export function getVizComponent(key: string): ComponentType<VizProps> | null {
  return registry[key] ?? null
}

export { registry as vizRegistry }
