import type {
  ComplianceCriterion,
  ComplianceEvaluation,
  CompliancePhase,
  EvaluationResult,
  Recommendation,
  ValidationFinding,
  ValidationProject,
} from "./../../types/compliance";

export const complianceCriteria: ComplianceCriterion[] = [
  {
    id: "CR-01",
    code: "MET-01",
    title: "Sequenciamento das fases",
    description:
      "As fases respeitam a ordem e as dependências definidas para o ciclo Cascata.",
    category: "Metodologia",
    phaseId: "F00",
    weight: 15,
    mandatory: true,
    reference: "Royce (1970) / regra interna WFL-M01",
    evaluationRule:
      "Nenhuma fase sucessora pode iniciar antes da liberação formal da predecessora.",
    active: true,
  },
  {
    id: "CR-02",
    code: "GOV-01",
    title: "Aprovação formal dos Stage Gates",
    description:
      "Cada transição possui decisão, responsável e data registrados.",
    category: "Governança",
    phaseId: "F00",
    weight: 15,
    mandatory: true,
    reference: "ISO/IEC/IEEE 12207 / regra WFL-G02",
    evaluationRule:
      "Todos os gates aplicáveis devem possuir decisão documentada.",
    active: true,
  },
  {
    id: "CR-03",
    code: "REQ-01",
    title: "Requisitos com critérios de aceitação",
    description:
      "Requisitos aprovados possuem condições verificáveis de aceite.",
    category: "Qualidade",
    phaseId: "F01",
    weight: 12,
    mandatory: true,
    reference: "ISO/IEC/IEEE 29148 / regra WFL-R04",
    evaluationRule: "Cobertura mínima configurada de 90%.",
    active: true,
  },
  {
    id: "CR-04",
    code: "ANA-01",
    title: "Análise funcional aprovada",
    description:
      "Regras, restrições, premissas e dependências estão documentadas.",
    category: "Metodologia",
    phaseId: "F02",
    weight: 10,
    mandatory: true,
    reference: "ISO/IEC/IEEE 12207 / regra WFL-A03",
    evaluationRule: "Documento aprovado e vinculado ao baseline de requisitos.",
    active: true,
  },
  {
    id: "CR-05",
    code: "ARQ-01",
    title: "Decisões arquiteturais registradas",
    description:
      "Decisões relevantes possuem contexto, alternativas e consequências.",
    category: "Governança",
    phaseId: "F03",
    weight: 10,
    mandatory: false,
    reference: "ISO/IEC 25010 / regra WFL-D05",
    evaluationRule: "ADRs críticos aprovados e artefatos versionados.",
    active: true,
  },
  {
    id: "CR-06",
    code: "IMP-01",
    title: "Implementação vinculada aos requisitos",
    description:
      "Módulos e funcionalidades mantêm referência aos requisitos aprovados.",
    category: "Qualidade",
    phaseId: "F04",
    weight: 10,
    mandatory: true,
    reference: "CMMI / regra WFL-I02",
    evaluationRule:
      "Cobertura de rastreabilidade de implementação igual ou superior a 85%.",
    active: true,
  },
  {
    id: "CR-07",
    code: "TST-01",
    title: "Cobertura de validação",
    description:
      "Requisitos possuem casos de teste executados e evidências associadas.",
    category: "Qualidade",
    phaseId: "F05",
    weight: 15,
    mandatory: true,
    reference: "ISO/IEC/IEEE 29119 / regra WFL-T01",
    evaluationRule: "Cobertura mínima de 90% e defeitos críticos tratados.",
    active: true,
  },
  {
    id: "CR-08",
    code: "CHG-01",
    title: "Controle formal de mudanças",
    description:
      "Mudanças possuem solicitação, análise de impacto e aprovação.",
    category: "Governança",
    phaseId: "F00",
    weight: 8,
    mandatory: true,
    reference: "PMBOK / regra WFL-C02",
    evaluationRule:
      "100% das mudanças de baseline possuem histórico e aprovação.",
    active: true,
  },
  {
    id: "CR-09",
    code: "MNT-01",
    title: "Evidências de operação e manutenção",
    description:
      "Incidentes, correções e intervenções são rastreáveis após a implantação.",
    category: "Metodologia",
    phaseId: "F07",
    weight: 5,
    mandatory: false,
    reference: "ISO/IEC/IEEE 15288 / regra WFL-M07",
    evaluationRule: "Aplicável somente a projetos implantados.",
    active: true,
  },
];

const phaseNames = [
  "Requisitos",
  "Análise",
  "Arquitetura e Projeto",
  "Implementação",
  "Testes e Validação",
  "Implantação",
  "Operação e Manutenção",
];
const resultScore: Record<EvaluationResult, number> = {
  Atendido: 1,
  Parcial: 0.5,
  "Não atendido": 0,
  "Não avaliado": 0,
  "Não aplicável": 0,
};

function buildEvaluations(
  projectId: string,
  results: EvaluationResult[],
): ComplianceEvaluation[] {
  return complianceCriteria.map((criterion, index) => ({
    id: `EV-${projectId}-${index + 1}`,
    projectId,
    criterionId: criterion.id,
    result: results[index],
    score: resultScore[results[index]],
    evidence:
      results[index] === "Não avaliado"
        ? "Evidência ainda não anexada"
        : results[index] === "Não aplicável"
          ? "Projeto ainda não alcançou a fase de operação"
          : `DOC-${criterion.code} · Evidência versionada e vinculada`,
    justification:
      results[index] === "Atendido"
        ? "Regra interna atendida com evidência aprovada."
        : results[index] === "Parcial"
          ? "Evidência disponível, porém com pendências de aprovação ou cobertura."
          : results[index] === "Não atendido"
            ? "A regra configurada não foi atendida e requer ação corretiva."
            : results[index] === "Não aplicável"
              ? "Critério não aplicável ao estágio atual, com justificativa registrada."
              : "Critério pendente de avaliação formal.",
    evaluatedAt: "2025-06-18",
    evaluatedBy: "Marina Costa",
  }));
}

function buildPhases(level: "high" | "partial" | "low"): CompliancePhase[] {
  const compliance =
    level === "high"
      ? [100, 96, 92, 90, 94, 88, 85]
      : level === "partial"
        ? [94, 82, 72, 68, 61, 45, 0]
        : [58, 42, 35, 30, 24, 0, 0];
  return phaseNames.map((name, index) => {
    const value = compliance[index];
    const notApplicable = index === 6 && level !== "high";
    const state = notApplicable
      ? "Não aplicável"
      : value >= 85
        ? "Conforme"
        : value >= 60
          ? "Parcialmente conforme"
          : value === 0
            ? "Não avaliada"
            : "Não conforme";
    const deliverables = 5 + (index % 4);
    return {
      id: `F0${index + 1}`,
      name,
      operationalStatus:
        value >= 85 ? "Concluída" : value > 0 ? "Em andamento" : "Não iniciada",
      state,
      compliance: value,
      deliverables,
      approvedDeliverables: Math.round((deliverables * value) / 100),
      pending: deliverables - Math.round((deliverables * value) / 100),
      stageGate:
        value >= 85 ? "Aprovado" : value >= 60 ? "Pendente" : "Não submetido",
      plannedDates: `${String(index + 1).padStart(2, "0")}/01 — ${String(index + 1).padStart(2, "0")}/02`,
      actualDates:
        value === 0
          ? "—"
          : `${String(index + 2).padStart(2, "0")}/01 — ${value >= 85 ? String(index + 2).padStart(2, "0") + "/02" : "em andamento"}`,
      scheduleDeviation:
        level === "high"
          ? index % 3
          : level === "partial"
            ? index * 3
            : index * 6,
      nonConformities:
        value >= 85 ? 0 : value >= 60 ? 1 : value === 0 ? 0 : 2 + (index % 2),
      evidence:
        value === 0
          ? []
          : [`Checklist ${name} v2.0`, `Ata do Stage Gate F0${index + 1}`],
    };
  });
}

const commonStrengths: ValidationFinding[] = [
  {
    id: "FND-01",
    type: "Ponto positivo",
    title: "Requisitos formalmente aprovados",
    description: "O baseline possui aprovação e responsáveis identificados.",
    phase: "F01",
    criterion: "REQ-01",
    evidence: "Ata SG-F01 e baseline REQ-v2.3",
    impact: "Reduz ambiguidades nas fases sucessoras.",
    priority: "Alta",
  },
  {
    id: "FND-02",
    type: "Ponto positivo",
    title: "Testes associados aos requisitos",
    description: "A matriz mantém vínculo entre requisito e caso de teste.",
    phase: "F05",
    criterion: "TST-01",
    evidence: "Matriz RTM-v1.8",
    impact: "Facilita verificação de cobertura.",
    priority: "Média",
  },
];

const recommendations: Recommendation[] = [
  {
    id: "REC-01",
    title: "Regularizar evidências dos Stage Gates",
    description: "Consolidar decisões e assinaturas pendentes.",
    problem: "Gates sem parecer formal completo.",
    evidence: "Checklist GOV-01 com duas pendências.",
    correctiveAction: "Realizar reunião de gate e anexar ata aprovada.",
    benefit: "Evita avanço sem autorização e melhora auditabilidade.",
    suggestedOwner: "Marina Costa",
    recommendedDeadline: "2025-06-28",
    priority: "Crítica",
    status: "Não iniciada",
  },
  {
    id: "REC-02",
    title: "Completar rastreabilidade de implementação",
    description: "Relacionar funcionalidades recentes ao baseline.",
    problem: "Cobertura abaixo da meta configurada.",
    evidence: "Matriz RTM-v1.8 indica 82%.",
    correctiveAction: "Atualizar vínculos e revisar requisitos órfãos.",
    benefit: "Amplia cobertura de impacto e validação.",
    suggestedOwner: "Ana Souza",
    recommendedDeadline: "2025-07-03",
    priority: "Alta",
    status: "Em andamento",
  },
  {
    id: "REC-03",
    title: "Formalizar análise de impacto",
    description: "Padronizar avaliação antes de mudanças de baseline.",
    problem: "Uma mudança foi aprovada sem impacto técnico completo.",
    evidence: "SCM-014 sem parecer de arquitetura.",
    correctiveAction: "Adicionar checklist obrigatório ao fluxo de mudança.",
    benefit: "Reduz retrabalho e risco de regressões.",
    suggestedOwner: "Rafael Lima",
    recommendedDeadline: "2025-07-10",
    priority: "Média",
    status: "Não iniciada",
  },
];

const partialFindings: ValidationFinding[] = [
  ...commonStrengths,
  {
    id: "FND-03",
    type: "Oportunidade de melhoria",
    title: "Entregáveis aguardando aprovação",
    description:
      "Três artefatos técnicos estão concluídos, mas sem parecer final.",
    phase: "F03",
    criterion: "ARQ-01",
    evidence: "Arquitetura v2.1, API v1.4 e ADR-009",
    impact: "Pode bloquear formalmente o Stage Gate.",
    priority: "Alta",
  },
  {
    id: "FND-04",
    type: "Não conformidade",
    title: "Fase iniciada antes do gate",
    description:
      "Implementação teve atividades iniciadas antes da aprovação integral de F03.",
    phase: "F04",
    criterion: "MET-01",
    evidence: "ATV-003 iniciou em 25/03; gate F03 permanece pendente.",
    impact: "Quebra o sequenciamento metodológico configurado.",
    priority: "Crítica",
  },
];

export const validationProjects: ValidationProject[] = [
  {
    id: "P-A",
    code: "WFL-001",
    name: "WaterfallLab — Sistema de Gestão do Ciclo de Vida",
    owner: "Marina Costa",
    evaluationDate: "18/06/2025",
    evaluationStatus: "Avaliação concluída",
    criteriaVersion: "WFL-COMP v1.2",
    profile: "Alta conformidade",
    phases: buildPhases("high"),
    evaluations: buildEvaluations("P-A", [
      "Atendido",
      "Atendido",
      "Atendido",
      "Atendido",
      "Atendido",
      "Atendido",
      "Atendido",
      "Atendido",
      "Não aplicável",
    ]),
    findings: commonStrengths,
    recommendations: recommendations.slice(2),
    schedule: {
      plannedStart: "05/01/2025",
      plannedEnd: "12/07/2025",
      actualStart: "05/01/2025",
      plannedDuration: 188,
      elapsedDuration: 164,
      remainingDays: 24,
      lateDays: 0,
      deviation: 4,
      overdueActivities: 2,
      onTimeDeliveries: 18,
      lateDeliveries: 2,
    },
    quality: {
      acceptanceCriteria: 96,
      requirementsWithTests: 94,
      testsExecuted: 148,
      testsApproved: 137,
      criticalDefects: 1,
      approvedDeliverables: 38,
      approvedChanges: 7,
    },
  },
  {
    id: "P-B",
    code: "ERP-024",
    name: "Modernização do ERP Corporativo",
    owner: "Lucas Mendes",
    evaluationDate: "17/06/2025",
    evaluationStatus: "Revisão necessária",
    criteriaVersion: "WFL-COMP v1.2",
    profile: "Conformidade parcial",
    phases: buildPhases("partial"),
    evaluations: buildEvaluations("P-B", [
      "Parcial",
      "Parcial",
      "Atendido",
      "Atendido",
      "Parcial",
      "Parcial",
      "Parcial",
      "Não atendido",
      "Não aplicável",
    ]),
    findings: partialFindings,
    recommendations,
    schedule: {
      plannedStart: "10/01/2025",
      plannedEnd: "30/09/2025",
      actualStart: "15/01/2025",
      plannedDuration: 263,
      elapsedDuration: 159,
      remainingDays: 104,
      lateDays: 0,
      deviation: 14,
      overdueActivities: 7,
      onTimeDeliveries: 11,
      lateDeliveries: 5,
    },
    quality: {
      acceptanceCriteria: 88,
      requirementsWithTests: 82,
      testsExecuted: 96,
      testsApproved: 78,
      criticalDefects: 3,
      approvedDeliverables: 22,
      approvedChanges: 4,
    },
  },
  {
    id: "P-C",
    code: "APP-018",
    name: "Portal de Atendimento Digital",
    owner: "Ana Souza",
    evaluationDate: "15/06/2025",
    evaluationStatus: "Não conformidades críticas",
    criteriaVersion: "WFL-COMP v1.2",
    profile: "Baixa conformidade",
    phases: buildPhases("low"),
    evaluations: buildEvaluations("P-C", [
      "Não atendido",
      "Não atendido",
      "Parcial",
      "Não avaliado",
      "Não atendido",
      "Parcial",
      "Não atendido",
      "Não atendido",
      "Não aplicável",
    ]),
    findings: [
      ...partialFindings,
      {
        id: "FND-05",
        type: "Não conformidade",
        title: "Rastreabilidade não estabelecida",
        description: "Requisitos não possuem vínculos verificáveis com testes.",
        phase: "F05",
        criterion: "TST-01",
        evidence: "Matriz de rastreabilidade ausente.",
        impact: "Não é possível demonstrar cobertura de validação.",
        priority: "Crítica",
      },
    ],
    recommendations,
    schedule: {
      plannedStart: "08/01/2025",
      plannedEnd: "18/06/2025",
      actualStart: "22/01/2025",
      plannedDuration: 161,
      elapsedDuration: 175,
      remainingDays: 0,
      lateDays: 14,
      deviation: 31,
      overdueActivities: 15,
      onTimeDeliveries: 4,
      lateDeliveries: 9,
    },
    quality: {
      acceptanceCriteria: 62,
      requirementsWithTests: 38,
      testsExecuted: 51,
      testsApproved: 34,
      criticalDefects: 8,
      approvedDeliverables: 9,
      approvedChanges: 1,
    },
  },
];

export function calculateCompliance(project: ValidationProject) {
  let achieved = 0,
    applicable = 0,
    evaluatedWeight = 0;
  project.evaluations.forEach((evaluation) => {
    const criterion = complianceCriteria.find(
      (item) => item.id === evaluation.criterionId,
    );
    if (!criterion || evaluation.result === "Não aplicável") return;
    applicable += criterion.weight;
    if (evaluation.result !== "Não avaliado")
      evaluatedWeight += criterion.weight;
    achieved += criterion.weight * evaluation.score;
  });
  const methodologyScore = Math.round((achieved / applicable) * 100);
  const coverage = Math.round((evaluatedWeight / applicable) * 100);
  const stageGates = project.phases.filter(
    (phase) => phase.stageGate === "Aprovado",
  ).length;
  const deliverables = project.phases.reduce(
    (sum, phase) => sum + phase.deliverables,
    0,
  );
  const approved = project.phases.reduce(
    (sum, phase) => sum + phase.approvedDeliverables,
    0,
  );
  return {
    methodologyScore,
    coverage,
    stageGates,
    deliverableCompliance: Math.round((approved / deliverables) * 100),
    criticalNonConformities: project.findings.filter(
      (item) => item.type === "Não conformidade" && item.priority === "Crítica",
    ).length,
    risks:
      project.findings.filter((item) => item.type !== "Ponto positivo").length +
      project.quality.criticalDefects,
    schedulePerformance: Math.max(0, 100 - project.schedule.deviation),
  };
}

export const complianceService = {
  listProjects: () => validationProjects,
  getProject: (id: string) =>
    validationProjects.find((project) => project.id === id) ||
    validationProjects[0],
  calculate: calculateCompliance,
};
