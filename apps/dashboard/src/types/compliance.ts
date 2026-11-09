export type EvaluationResult =
  | "Atendido"
  | "Parcial"
  | "Não atendido"
  | "Não avaliado"
  | "Não aplicável";
export type ComplianceState =
  | "Não avaliada"
  | "Conforme"
  | "Parcialmente conforme"
  | "Não conforme"
  | "Não aplicável";

export interface ComplianceCriterion {
  id: string;
  code: string;
  title: string;
  description: string;
  category: "Metodologia" | "Qualidade" | "Governança";
  phaseId: string;
  weight: number;
  mandatory: boolean;
  reference: string;
  evaluationRule: string;
  active: boolean;
}

export interface ComplianceEvaluation {
  id: string;
  projectId: string;
  criterionId: string;
  result: EvaluationResult;
  score: number;
  evidence: string;
  justification: string;
  evaluatedAt: string;
  evaluatedBy: string;
}

export interface CompliancePhase {
  id: string;
  name: string;
  operationalStatus: string;
  state: ComplianceState;
  compliance: number;
  deliverables: number;
  approvedDeliverables: number;
  pending: number;
  stageGate: string;
  plannedDates: string;
  actualDates: string;
  scheduleDeviation: number;
  nonConformities: number;
  evidence: string[];
}

export interface ValidationFinding {
  id: string;
  type: "Ponto positivo" | "Oportunidade de melhoria" | "Não conformidade";
  title: string;
  description: string;
  phase: string;
  criterion: string;
  evidence: string;
  impact: string;
  priority: "Crítica" | "Alta" | "Média" | "Baixa";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  problem: string;
  evidence: string;
  correctiveAction: string;
  benefit: string;
  suggestedOwner: string;
  recommendedDeadline: string;
  priority: "Crítica" | "Alta" | "Média" | "Baixa";
  status: "Não iniciada" | "Em andamento" | "Concluída";
}

export interface ValidationProject {
  id: string;
  code: string;
  name: string;
  owner: string;
  evaluationDate: string;
  evaluationStatus: string;
  criteriaVersion: string;
  profile: "Alta conformidade" | "Conformidade parcial" | "Baixa conformidade";
  phases: CompliancePhase[];
  evaluations: ComplianceEvaluation[];
  findings: ValidationFinding[];
  recommendations: Recommendation[];
  schedule: {
    plannedStart: string;
    plannedEnd: string;
    actualStart: string;
    actualEnd?: string;
    plannedDuration: number;
    elapsedDuration: number;
    remainingDays: number;
    lateDays: number;
    deviation: number;
    overdueActivities: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
  };
  quality: {
    acceptanceCriteria: number;
    requirementsWithTests: number;
    testsExecuted: number;
    testsApproved: number;
    criticalDefects: number;
    approvedDeliverables: number;
    approvedChanges: number;
  };
}

export interface ValidationReport {
  id: string;
  projectId: string;
  evaluationDate: string;
  methodologyScore: number;
  schedulePerformance: number;
  qualityIndicators: ValidationProject["quality"];
  findings: ValidationFinding[];
  recommendations: Recommendation[];
  conclusion: string;
  criteriaVersion: string;
}
