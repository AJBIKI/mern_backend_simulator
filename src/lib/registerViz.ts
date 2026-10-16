import type { ComponentType } from 'react'
import { SequenceSwimlane } from '@/components/viz/SequenceSwimlane'
import { AnimatedPipeline } from '@/components/viz/AnimatedPipeline'
import { EventLoopClock } from '@/components/viz/EventLoopClock'
import { QueueLanes } from '@/components/viz/QueueLanes'
import { TwoPanelCompare } from '@/components/viz/TwoPanelCompare'
import { URLMatcher } from '@/components/viz/URLMatcher'
import { StateMachine } from '@/components/viz/StateMachine'
import { TreeTraversal } from '@/components/viz/TreeTraversal'
import { CacheFlow } from '@/components/viz/CacheFlow'
import { TokenBucket } from '@/components/viz/TokenBucket'
import { ProducerQueue } from '@/components/viz/ProducerQueue'
import { ReplicaSwimlane } from '@/components/viz/ReplicaSwimlane'
import { ConnectionPool } from '@/components/viz/ConnectionPool'
import { ProcessTree } from '@/components/viz/ProcessTree'
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
  StateMachine,
  TreeTraversal,
  CacheFlow,
  TokenBucket,
  ProducerQueue,
  ReplicaSwimlane,
  ConnectionPool,
  ProcessTree,
}

export function getVizComponent(key: string): ComponentType<VizProps> | null {
  return registry[key] ?? null
}

export { registry as vizRegistry }
