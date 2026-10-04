export type GenerationJobStatus = "queued" | "running" | "succeeded" | "failed";
export type GenerationStage =
  | "created"
  | "clustering"
  | "story_building"
  | "concept_exploration"
  | "creative_direction"
  | "experience_generation"
  | "validating"
  | "render_ready";

export interface GenerationStageEvent {
  stage: GenerationStage;
  startedAt: string;
}

export interface GenerationJob {
  id: string;
  tripId: string;
  scope: string;
  sourceRevision: string;
  correlationId: string;
  status: GenerationJobStatus;
  stage: GenerationStage;
  stageLabel: string;
  attempt: number;
  maxAttempts: number;
  nextAttemptAt?: string;
  history: GenerationStageEvent[];
  failureCode?: string;
  failureMessage?: string;
  createdAt: string;
  updatedAt: string;
}
