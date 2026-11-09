"use client";
import { useMemo, useState, type ElementType, type ReactNode } from "react";
import { BarChart } from "@/components/charts";
import { PageHeader } from "@/components/shared/page-header";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileText,
  GitBranch,
  ListChecks,
  Scale,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from "@/components/ui/icons";
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  Progress,
  Select,
  Title,
} from "@/components/ui";
import {
  complianceCriteria,
  complianceService,
} from "@/services/compliances/compliance-service";
import type {
  CompliancePhase,
  ComplianceState,
  EvaluationResult,
  Recommendation,
  ValidationFinding,
} from "@/types/compliance";

const stateTone = (state: ComplianceState) =>
  state === "Conforme"
    ? "success"
    : state === "Parcialmente conforme"
      ? "warning"
      : state === "Não conforme"
        ? "danger"
        : state === "Não aplicável"
          ? "purple"
          : "neutral";
const resultTone = (result: EvaluationResult) =>
  result === "Atendido"
    ? "success"
    : result === "Parcial"
      ? "warning"
      : result === "Não atendido"
        ? "danger"
        : result === "Não aplicável"
          ? "purple"
          : "neutral";
const priorityTone = (priority: string) =>
  priority === "Crítica"
    ? "danger"
    : priority === "Alta"
      ? "warning"
      : priority === "Média"
        ? "info"
        : "neutral";

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <Title level={2}>{title}</Title>
        <div className="mt-1 text-sm text-ink-muted">{description}</div>
      </div>
      {action}
    </div>
  );
}

function ComplianceScoreCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ElementType;
  tone?: "blue" | "green" | "amber" | "red";
  trend?: string;
}) {
  const color = {
    blue: "bg-primary-soft text-primary",
    green: "bg-success-soft text-success",
    amber: "bg-warning-soft text-warning-strong",
    red: "bg-danger-soft text-danger",
  }[tone];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-success">
            <TrendingUp size={12} />
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4 text-2xl font-bold">{value}</div>
      <div className="mt-0.5 text-xs font-semibold">{label}</div>
      <div className="mt-2 flex gap-1 text-[11px] leading-4 text-ink-muted">
        <CircleDot size={11} className="mt-0.5 shrink-0" />
        {detail}
      </div>
    </Card>
  );
}

export function WaterfallCompliancePhaseCard({
  phase,
  expanded,
  onToggle,
}: {
  phase: CompliancePhase;
  expanded: boolean;
  onToggle: () => void;
}) {
  const criteria = complianceCriteria.filter(
    (item) => item.phaseId === phase.id || item.phaseId === "F00",
  );
  return (
    <Card
      className={`overflow-hidden ${phase.state === "Não conforme" ? "border-danger/40" : ""}`}
    >
      <div className="cursor-pointer p-4" onClick={onToggle}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${phase.state === "Conforme" ? "bg-success-soft text-success" : phase.state === "Não conforme" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning-strong"}`}
          >
            {phase.id}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-bold">{phase.name}</div>
              <Badge tone={stateTone(phase.state)}>{phase.state}</Badge>
              <Badge tone="neutral">{phase.operationalStatus}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
              <span>
                {phase.approvedDeliverables}/{phase.deliverables} entregáveis
                aprovados
              </span>
              <span>Stage Gate: {phase.stageGate}</span>
              <span>{phase.nonConformities} não conformidades</span>
            </div>
          </div>
          <div className="w-full md:w-40">
            <div className="mb-1 flex justify-between text-xs">
              <span>Conformidade</span>
              <strong>{phase.compliance}%</strong>
            </div>
            <Progress
              value={phase.compliance}
              tone={
                phase.compliance >= 85
                  ? "green"
                  : phase.compliance >= 60
                    ? "amber"
                    : "blue"
              }
            />
          </div>
          <Button
            variant="ghost"
            className="p-2"
            aria-label={expanded ? "Recolher fase" : "Expandir fase"}
          >
            <ChevronDown
              size={17}
              className={expanded ? "rotate-180" : ""}
            />
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-line bg-surface-subtle p-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Cronograma
              </div>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Planejado</span>
                  <span>{phase.plannedDates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Real</span>
                  <span>{phase.actualDates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Desvio</span>
                  <span
                    className={
                      phase.scheduleDeviation > 10
                        ? "font-semibold text-danger"
                        : ""
                    }
                  >
                    {phase.scheduleDeviation} dias
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Evidências
              </div>
              <div className="mt-2 space-y-2">
                {phase.evidence.length ? (
                  phase.evidence.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <FileCheck2 size={14} className="text-success" />
                      {item}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-ink-muted">
                    Nenhuma evidência disponível.
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Critérios relacionados
              </div>
              <div className="mt-2 space-y-2">
                {criteria.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-line bg-white p-2 text-xs"
                  >
                    <span className="font-mono font-bold text-primary">
                      {item.code}
                    </span>{" "}
                    · {item.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {phase.state === "Não aplicável" && (
            <div className="mt-4 rounded-lg border border-purple/20 bg-purple-soft p-3 text-xs text-purple">
              <strong>Justificativa:</strong> a fase ainda não é aplicável ao
              estágio atual do projeto e foi excluída do denominador da
              pontuação.
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function FindingsColumn({
  title,
  findings,
  positive = false,
}: {
  title: string;
  findings: ValidationFinding[];
  positive?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <div
          className={`rounded-lg p-2 ${positive ? "bg-success-soft text-success" : "bg-warning-soft text-warning-strong"}`}
        >
          {positive ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
        </div>
        <Title level={2}>{title}</Title>
      </div>
      <div className="mt-4 space-y-3">
        {findings.length ? (
          findings.map((item) => (
            <div key={item.id} className="rounded-lg border border-line p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold">{item.title}</div>
                <Badge tone={priorityTone(item.priority)}>
                  {item.priority}
                </Badge>
              </div>
              <div className="mt-1 text-xs leading-5 text-ink-muted">
                {item.description}
              </div>
              <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
                <div>
                  <span className="font-bold text-ink-faint">FASE</span>
                  <div>{item.phase}</div>
                </div>
                <div>
                  <span className="font-bold text-ink-faint">CRITÉRIO</span>
                  <div>{item.criterion}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-bold text-ink-faint">EVIDÊNCIA</span>
                  <div>{item.evidence}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-bold text-ink-faint">IMPACTO</span>
                  <div>{item.impact}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-sm text-ink-muted">
            Nenhum item identificado nesta avaliação.
          </div>
        )}
      </div>
    </Card>
  );
}

export function ValidationPage() {
  const projects = complianceService.listProjects();
  const [projectId, setProjectId] = useState(projects[0].id);
  const project = complianceService.getProject(projectId);
  const metrics = complianceService.calculate(project);
  const [expanded, setExpanded] = useState<string | null>("F01");
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(project.evaluationDate);
  const [findingFilter, setFindingFilter] = useState("Todos");
  const [recommendationSort, setRecommendationSort] = useState("Prioridade");
  const [recommendations, setRecommendations] = useState(
    project.recommendations,
  );
  const [actionRecommendation, setActionRecommendation] =
    useState<Recommendation | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);

  const changeProject = (id: string) => {
    setProjectId(id);
    const next = complianceService.getProject(id);
    setRecommendations(next.recommendations);
    setLastRun(next.evaluationDate);
    setExpanded("F01");
  };
  const runValidation = () => {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setLastRun(new Intl.DateTimeFormat("pt-BR").format(new Date()));
    }, 900);
  };
  const phaseChart = project.phases.map((phase) => ({
    phase: phase.id,
    planejado: 30 + Number(phase.id.slice(-1)) * 3,
    real:
      phase.compliance === 0
        ? 0
        : 30 + Number(phase.id.slice(-1)) * 3 + phase.scheduleDeviation,
  }));
  const filteredFindings = project.findings.filter(
    (item) => findingFilter === "Todos" || item.type === findingFilter,
  );
  const strengths = filteredFindings.filter(
    (item) => item.type === "Ponto positivo",
  );
  const improvements = filteredFindings.filter(
    (item) => item.type !== "Ponto positivo",
  );
  const sortedRecommendations = useMemo(
    () =>
      [...recommendations].sort((a, b) =>
        recommendationSort === "Prioridade"
          ? ["Crítica", "Alta", "Média", "Baixa"].indexOf(a.priority) -
            ["Crítica", "Alta", "Média", "Baixa"].indexOf(b.priority)
          : a.recommendedDeadline.localeCompare(b.recommendedDeadline),
      ),
    [recommendations, recommendationSort],
  );
  const methodologyCriteria = project.evaluations.map((evaluation) => ({
    evaluation,
    criterion: complianceCriteria.find(
      (item) => item.id === evaluation.criterionId,
    )!,
  }));
  const generalSituation =
    metrics.methodologyScore >= 85
      ? "Adequado"
      : metrics.methodologyScore >= 60
        ? "Requer atenção"
        : "Crítico";

  return (
    <div>
      <PageHeader
        title="Validação e Conformidade"
        description="Avaliação da aderência metodológica, qualidade e desempenho dos projetos."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setReportOpen(true)}>
              <Eye size={16} />
              Visualizar relatório
            </Button>
            <Button onClick={runValidation} disabled={running}>
              {running ? (
                <Clock3 className="animate-spin" size={16} />
              ) : (
                <Activity size={16} />
              )}
              {running ? "Executando validação..." : "Executar validação"}
            </Button>
          </div>
        }
      />

      <Card className="mb-6 p-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:items-end">
          <label>
            <span className="mb-1.5 block text-xs font-semibold">
              Projeto avaliado
            </span>
            <Select
              className="w-full"
              value={projectId}
              onChange={(e) => changeProject(e.target.value)}
            >
              {projects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {item.name}
                </option>
              ))}
            </Select>
          </label>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
              Responsável
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
              <UserRound size={15} className="text-primary" />
              {project.owner}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
              Última avaliação
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
              <CalendarDays size={15} className="text-primary" />
              {lastRun}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
              Status
            </div>
            <div className="mt-1">
              <Badge
                tone={
                  project.profile === "Alta conformidade"
                    ? "success"
                    : project.profile === "Baixa conformidade"
                      ? "danger"
                      : "warning"
                }
              >
                {project.evaluationStatus}
              </Badge>
            </div>
          </div>
        </div>
        {lastRun !== project.evaluationDate && (
          <div className="mt-4 rounded-lg bg-success-soft p-3 text-sm font-semibold text-success">
            <Check size={16} className="mr-2 inline" />
            Avaliação demonstrativa concluída. Os indicadores foram recalculados
            pelas regras WFL-COMP v1.2.
          </div>
        )}
      </Card>

      <SectionHeader
        title="Visão executiva da validação"
        description="Indicadores internos calculados a partir dos critérios e evidências demonstrativas."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ComplianceScoreCard
          label="Aderência ao Cascata"
          value={`${metrics.methodologyScore}%`}
          detail={`Cobertura da avaliação: ${metrics.coverage}%`}
          icon={Scale}
          tone={
            metrics.methodologyScore >= 85
              ? "green"
              : metrics.methodologyScore >= 60
                ? "amber"
                : "red"
          }
          trend="+2,4%"
        />
        <ComplianceScoreCard
          label="Conformidade dos entregáveis"
          value={`${metrics.deliverableCompliance}%`}
          detail="Artefatos aprovados sobre aplicáveis"
          icon={FileCheck2}
          tone={metrics.deliverableCompliance >= 85 ? "green" : "amber"}
        />
        <ComplianceScoreCard
          label="Stage Gates aprovados"
          value={`${metrics.stageGates}/7`}
          detail="Decisões formais registradas"
          icon={CheckCircle2}
          tone={metrics.stageGates >= 5 ? "green" : "amber"}
        />
        <ComplianceScoreCard
          label="Rastreabilidade"
          value={`${project.quality.requirementsWithTests}%`}
          detail="Requisitos vinculados a testes"
          icon={GitBranch}
          tone={
            project.quality.requirementsWithTests >= 90
              ? "green"
              : project.quality.requirementsWithTests >= 70
                ? "amber"
                : "red"
          }
        />
        <ComplianceScoreCard
          label="Desvio do cronograma"
          value={`${project.schedule.deviation}%`}
          detail="Indicador de desempenho, separado da aderência"
          icon={
            project.schedule.deviation > 20 ? ArrowDownRight : TrendingUp
          }
          tone={
            project.schedule.deviation > 20
              ? "red"
              : project.schedule.deviation > 10
                ? "amber"
                : "green"
          }
        />
        <ComplianceScoreCard
          label="Não conformidades críticas"
          value={String(metrics.criticalNonConformities)}
          detail="Achados metodológicos com prioridade crítica"
          icon={AlertTriangle}
          tone={metrics.criticalNonConformities ? "red" : "green"}
        />
        <ComplianceScoreCard
          label="Riscos identificados"
          value={String(metrics.risks)}
          detail="Riscos de processo, qualidade e defeitos"
          icon={AlertTriangle}
          tone={metrics.risks > 6 ? "red" : "amber"}
        />
        <ComplianceScoreCard
          label="Situação geral"
          value={generalSituation}
          detail={`${project.profile} · indicador WaterfallLab`}
          icon={ShieldCheck}
          tone={
            generalSituation === "Adequado"
              ? "green"
              : generalSituation === "Crítico"
                ? "red"
                : "amber"
          }
        />
      </div>

      <div className="mt-7">
        <SectionHeader
          title="Matriz de Conformidade Waterfall"
          description="Resultado por fase, entregáveis, Stage Gates, datas e evidências."
        />
        <div className="space-y-3">
          {project.phases.map((phase) => (
            <WaterfallCompliancePhaseCard
              key={phase.id}
              phase={phase}
              expanded={expanded === phase.id}
              onToggle={() =>
                setExpanded(expanded === phase.id ? null : phase.id)
              }
            />
          ))}
        </div>
      </div>

      <div className="mt-7">
        <SectionHeader
          title="Aderência ao Modelo Cascata"
          description="Aderência metodológica e desempenho são avaliados separadamente para evitar penalizar o método apenas por atrasos."
        />
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <Card className="border-success/30 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-success">
                  Aderência metodológica
                </div>
                <div className="mt-2 text-3xl font-bold">
                  {metrics.methodologyScore}%
                </div>
              </div>
              <Scale size={30} className="text-success" />
            </div>
            <div className="mt-3 text-sm text-ink-muted">
              Sequenciamento, documentação, aceite, rastreabilidade, mudanças e
              governança.
            </div>
            <Progress value={metrics.methodologyScore} tone="green" />
          </Card>
          <Card className="border-primary/30 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-primary">
                  Desempenho do projeto
                </div>
                <div className="mt-2 text-3xl font-bold">
                  {metrics.schedulePerformance}%
                </div>
              </div>
              <BarChart3 size={30} className="text-primary" />
            </div>
            <div className="mt-3 text-sm text-ink-muted">
              Cronograma, entregas, duração, atividades vencidas e
              previsibilidade.
            </div>
            <Progress value={metrics.schedulePerformance} />
          </Card>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-surface-muted text-xs text-ink-muted">
                <tr>
                  {[
                    "Critério",
                    "Dimensão / Fase",
                    "Resultado",
                    "Peso",
                    "Evidência",
                    "Justificativa e recomendação",
                  ].map((item) => (
                    <th key={item} className="px-4 py-3 font-semibold">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {methodologyCriteria.map(({ criterion, evaluation }) => (
                  <tr key={criterion.id}>
                    <td className="px-4 py-4">
                      <div className="font-mono text-xs font-bold text-primary">
                        {criterion.code}
                      </div>
                      <div className="mt-1 font-semibold">
                        {criterion.title}
                      </div>
                      <div className="mt-1 text-[10px] text-ink-muted">
                        {criterion.reference}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone="neutral">{criterion.category}</Badge>
                      <div className="mt-1 text-xs text-ink-muted">
                        {criterion.phaseId}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={resultTone(evaluation.result)}>
                        {evaluation.result}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      {criterion.weight}
                    </td>
                    <td className="px-4 py-4 text-xs">{evaluation.evidence}</td>
                    <td className="max-w-sm px-4 py-4 text-xs leading-5 text-ink-muted">
                      {evaluation.justification}
                      <div className="mt-1 font-semibold text-primary">
                        {evaluation.result === "Atendido"
                          ? "Manter controle e evidências."
                          : "Executar plano de ação relacionado."}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="mt-3 rounded-lg border border-primary/20 bg-primary-soft p-3 text-xs text-primary">
          <CircleDot size={15} className="mr-2 inline" />
          <strong>Fórmula:</strong> pontos ponderados alcançados ÷ pontos
          ponderados aplicáveis × 100. Critérios não avaliados permanecem
          visíveis e valem zero; não aplicáveis justificados são excluídos.
          Cobertura atual: {metrics.coverage}%.
        </div>
      </div>

      <div className="mt-7">
        <SectionHeader
          title="Análise de Prazos e Duração"
          description="Desempenho temporal independente da classificação metodológica."
          action={
            <Button variant="secondary">
              <CalendarDays size={15} />
              Visualizar cronograma
            </Button>
          }
        />
        <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <Card className="p-5">
            <Title level={2}>Duração planejada versus real/transcorrida</Title>
            <div className="text-xs text-ink-muted">
              Dias por fase · valores em andamento representam duração
              transcorrida, não duração definitiva
            </div>
            <div className="mt-4 h-72">
              <BarChart
                data={phaseChart}
                xKey="phase"
                series={[
                  {
                    key: "planejado",
                    label: "Planejada",
                    color: "var(--color-primary-soft-strong)",
                  },
                  {
                    key: "real",
                    label: "Real / transcorrida",
                    color: "var(--color-primary)",
                  },
                ]}
                legend
              />
            </div>
          </Card>
          <Card className="p-5">
            <Title level={2}>Resumo do cronograma</Title>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              {[
                ["Início planejado", project.schedule.plannedStart],
                ["Término planejado", project.schedule.plannedEnd],
                ["Início real", project.schedule.actualStart],
                ["Término real", project.schedule.actualEnd || "Em andamento"],
                [
                  "Duração planejada",
                  `${project.schedule.plannedDuration} dias`,
                ],
                [
                  "Duração transcorrida",
                  `${project.schedule.elapsedDuration} dias`,
                ],
                ["Dias restantes", `${project.schedule.remainingDays} dias`],
                ["Dias de atraso", `${project.schedule.lateDays} dias`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-surface-subtle p-3">
                  <div className="text-[10px] font-bold uppercase text-ink-faint">
                    {label}
                  </div>
                  <div className="mt-1 font-semibold">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-danger-soft p-3">
                <div className="text-xl font-bold text-danger">
                  {project.schedule.overdueActivities}
                </div>
                <div className="text-[10px] text-ink-muted">
                  Atividades vencidas
                </div>
              </div>
              <div className="rounded-lg bg-success-soft p-3">
                <div className="text-xl font-bold text-success">
                  {project.schedule.onTimeDeliveries}
                </div>
                <div className="text-[10px] text-ink-muted">No prazo</div>
              </div>
              <div className="rounded-lg bg-warning-soft p-3">
                <div className="text-xl font-bold text-warning-strong">
                  {project.schedule.lateDeliveries}
                </div>
                <div className="text-[10px] text-ink-muted">Com atraso</div>
              </div>
            </div>
          </Card>
        </div>
        <Card className="mt-5 p-5">
          <Title level={2}>Timeline de marcos e Stage Gates</Title>
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="relative flex min-w-[850px] gap-4 before:absolute before:left-5 before:right-5 before:top-4 before:h-px before:bg-line">
              {project.phases.map((phase) => (
                <div key={phase.id} className="relative z-10 w-40 shrink-0">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full border-4 border-white text-white ${phase.state === "Conforme" ? "bg-success" : phase.state === "Não conforme" ? "bg-danger" : phase.state === "Não aplicável" ? "bg-purple" : "bg-warning"}`}
                  >
                    {phase.state === "Conforme" ? (
                      <Check size={13} />
                    ) : (
                      <CircleDot size={13} />
                    )}
                  </div>
                  <div className="mt-3 text-xs font-bold">
                    {phase.id} · {phase.name}
                  </div>
                  <div className="mt-1 text-[10px] text-ink-muted">
                    {phase.plannedDates}
                  </div>
                  <div className="mt-2">
                    <Badge tone={stateTone(phase.state)}>
                      {phase.stageGate}
                    </Badge>
                  </div>
                  {phase.scheduleDeviation > 10 && (
                    <div className="mt-2 text-[10px] font-semibold text-danger">
                      +{phase.scheduleDeviation} dias
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-7">
        <SectionHeader
          title="Pontos Positivos e Oportunidades de Melhoria"
          description="Achados sustentados por critérios e evidências registradas."
          action={
            <Select
              value={findingFilter}
              onChange={(e) => setFindingFilter(e.target.value)}
            >
              <option>Todos</option>
              <option>Ponto positivo</option>
              <option>Oportunidade de melhoria</option>
              <option>Não conformidade</option>
            </Select>
          }
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <FindingsColumn
            title="Pontos Positivos"
            findings={strengths}
            positive
          />
          <FindingsColumn title="Pontos a Melhorar" findings={improvements} />
        </div>
      </div>

      <div className="mt-7">
        <SectionHeader
          title="Recomendações e Boas Práticas"
          description="Ações corretivas priorizadas conforme problemas e evidências da avaliação."
          action={
            <Select
              value={recommendationSort}
              onChange={(e) => setRecommendationSort(e.target.value)}
            >
              <option>Prioridade</option>
              <option>Prazo</option>
            </Select>
          }
        />
        <div className="space-y-3">
          {sortedRecommendations.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div
                  className={`rounded-lg p-2 ${item.priority === "Crítica" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning-strong"}`}
                >
                  <CircleDot size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {item.id}
                    </span>
                    <Title level={3}>{item.title}</Title>
                    <Badge tone={priorityTone(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge
                      tone={
                        item.status === "Concluída"
                          ? "success"
                          : item.status === "Em andamento"
                            ? "info"
                            : "neutral"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-ink-muted">
                    {item.description}
                  </div>
                  <div className="mt-3 grid gap-3 text-xs md:grid-cols-3">
                    <div>
                      <strong>Problema:</strong> {item.problem}
                    </div>
                    <div>
                      <strong>Evidência:</strong> {item.evidence}
                    </div>
                    <div>
                      <strong>Benefício:</strong> {item.benefit}
                    </div>
                  </div>
                  <div className="mt-3 text-xs">
                    <UserRound size={13} className="mr-1 inline text-primary" />
                    {item.suggestedOwner} ·{" "}
                    <CalendarDays
                      size={13}
                      className="ml-3 mr-1 inline text-primary"
                    />
                    {item.recommendedDeadline}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setActionRecommendation(item)}
                >
                  Plano de ação <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <SectionHeader
          title="Qualidade e Rastreabilidade"
          description="Indicadores não presumem aprovação: cada relação depende de evidência explícita."
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [
              "Critérios de aceitação",
              `${project.quality.acceptanceCriteria}%`,
              ClipboardCheck,
            ],
            [
              "Requisitos com testes",
              `${project.quality.requirementsWithTests}%`,
              GitBranch,
            ],
            [
              "Testes executados",
              String(project.quality.testsExecuted),
              ListChecks,
            ],
            [
              "Testes aprovados",
              String(project.quality.testsApproved),
              CheckCircle2,
            ],
            [
              "Defeitos críticos",
              String(project.quality.criticalDefects),
              AlertTriangle,
            ],
            [
              "Entregáveis aprovados",
              String(project.quality.approvedDeliverables),
              FileCheck2,
            ],
            [
              "Mudanças aprovadas",
              String(project.quality.approvedChanges),
              CheckCircle2,
            ],
          ].map(([label, value, Icon]) => (
            <Card key={label as string} className="p-4">
              <Icon size={18} className="text-primary" />
              <div className="mt-3 text-xl font-bold">{value as string}</div>
              <div className="text-xs text-ink-muted">{label as string}</div>
            </Card>
          ))}
        </div>
        <Card className="mt-5 overflow-hidden">
          <div className="border-b border-line p-5">
            <Title level={2}>
              Requirement → Deliverable → Test Case → Validation Evidence
            </Title>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-surface-muted text-xs text-ink-muted">
                <tr>
                  {[
                    "Requisito",
                    "Entregável",
                    "Caso de teste",
                    "Evidência de validação",
                    "Estado",
                  ].map((item) => (
                    <th key={item} className="px-5 py-3">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  [
                    "RF-002 · Stage Gates",
                    "Fluxo de aprovação v2.0",
                    "CT-042 / CT-043",
                    "EXEC-2025-0618",
                    "Estabelecida",
                  ],
                  [
                    "RF-003 · Rastreabilidade",
                    "Matriz RTM v1.8",
                    "CT-055",
                    "REL-QA-014",
                    "Estabelecida",
                  ],
                  [
                    "RF-004 · Exportação",
                    "Relatórios v0.8",
                    "CT-051",
                    "Evidência pendente",
                    "Parcial",
                  ],
                  [
                    "RNF-002 · WCAG",
                    "Guia de acessibilidade",
                    "—",
                    "—",
                    "Não estabelecida",
                  ],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.slice(0, 4).map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className="px-5 py-4">
                        {cell}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <Badge
                        tone={
                          row[4] === "Estabelecida"
                            ? "success"
                            : row[4] === "Parcial"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {row[4] === "Não estabelecida"
                          ? "Rastreabilidade não estabelecida"
                          : row[4]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mt-7">
        <Card className="p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary-soft p-2 text-primary">
                <FileText size={20} />
              </div>
              <div>
                <Title level={2}>Relatório de Validação do Projeto</Title>
                <div className="mt-1 text-sm text-ink-muted">
                  Relatório consolidado com resultado por fase, prazos,
                  qualidade, achados, ações e parecer final.
                </div>
                <div className="mt-2 text-xs text-ink-faint">
                  Versão dos critérios: {project.criteriaVersion} · Avaliador:{" "}
                  {project.owner}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setReportOpen(true)}>
                <Eye size={15} />
                Visualizar relatório
              </Button>
              <Button
                variant="secondary"
                disabled
                title="Exportação depende da integração com o backend"
              >
                <Download size={15} />
                PDF
              </Button>
              <Button
                variant="secondary"
                disabled
                title="Exportação depende da integração com o backend"
              >
                <Download size={15} />
                CSV
              </Button>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-surface-subtle p-3 text-xs text-ink-muted">
            <CircleDot size={14} className="mr-2 inline" />
            Exportações estão preparadas na interface, mas permanecem
            indisponíveis até a integração com o serviço de relatórios do
            backend NestJS.
          </div>
        </Card>
      </div>

      <div className="mt-5">
        <Card>
          <div
            className="flex cursor-pointer items-center justify-between p-5"
            onClick={() => setReferencesOpen(!referencesOpen)}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={19} className="text-primary" />
              <div>
                <Title level={2}>Referências e Critérios de Avaliação</Title>
                <div className="text-xs text-ink-muted">
                  Bases conceituais associadas às regras internas do
                  WaterfallLab
                </div>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={referencesOpen ? "rotate-180" : ""}
            />
          </div>
          {referencesOpen && (
            <div className="border-t border-line p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "Royce (1970)",
                  "ISO/IEC/IEEE 12207",
                  "ISO/IEC/IEEE 29148",
                  "ISO/IEC 25010",
                  "ISO/IEC/IEEE 29119",
                  "ISO/IEC/IEEE 15288",
                  "PMBOK",
                  "CMMI",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-line bg-surface-subtle p-3 text-sm font-semibold"
                  >
                    {item}
                    <div className="mt-1 text-[10px] font-normal text-ink-muted">
                      Referência conceitual vinculada a uma regra interna.
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs text-warning-strong">
                <AlertTriangle size={14} className="mr-2 inline" />A avaliação
                representa a aderência aos critérios configurados no
                WaterfallLab e não constitui certificação independente.
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={Boolean(actionRecommendation)}
        onClose={() => setActionRecommendation(null)}
        title="Registrar plano de ação"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setActionRecommendation(null)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (actionRecommendation)
                  setRecommendations((items) =>
                    items.map((item) =>
                      item.id === actionRecommendation.id
                        ? { ...item, status: "Em andamento" }
                        : item,
                    ),
                  );
                setActionRecommendation(null);
              }}
            >
              Salvar plano
            </Button>
          </>
        }
      >
        {actionRecommendation && (
          <div className="space-y-4">
            <div className="rounded-lg bg-surface-subtle p-3">
              <div className="font-semibold">{actionRecommendation.title}</div>
              <div className="mt-1 text-xs text-ink-muted">
                {actionRecommendation.correctiveAction}
              </div>
            </div>
            <label>
              <span className="mb-1.5 block text-xs font-semibold">
                Responsável
              </span>
              <Select
                className="w-full"
                defaultValue={actionRecommendation.suggestedOwner}
              >
                <option>Marina Costa</option>
                <option>Lucas Mendes</option>
                <option>Rafael Lima</option>
                <option>Ana Souza</option>
              </Select>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold">Prazo</span>
              <Input
                type="date"
                defaultValue={actionRecommendation.recommendedDeadline}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold">Status</span>
              <Select className="w-full">
                <option>Não iniciada</option>
                <option>Em andamento</option>
                <option>Concluída</option>
              </Select>
            </label>
          </div>
        )}
      </Modal>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Relatório de Validação do Projeto"
        footer={
          <Button onClick={() => setReportOpen(false)}>Fechar relatório</Button>
        }
      >
        <div className="space-y-5 text-sm">
          <div className="rounded-lg bg-primary-soft p-4">
            <div className="text-xs font-bold uppercase text-primary">
              Parecer final · {project.criteriaVersion}
            </div>
            <div className="mt-2 font-bold">
              {project.code} · {project.name}
            </div>
            <div className="mt-1 text-ink-muted">
              Período da avaliação: janeiro a junho de 2025 · Responsável:{" "}
              {project.owner}
            </div>
          </div>
          <div>
            <Title level={3}>Resumo executivo</Title>
            <div className="mt-2 leading-6 text-ink-muted">
              O projeto apresenta{" "}
              <strong className="text-ink">
                {project.profile.toLowerCase()}
              </strong>
              , com índice metodológico de {metrics.methodologyScore}% e
              cobertura de avaliação de {metrics.coverage}%. Foram identificadas{" "}
              {metrics.criticalNonConformities} não conformidades críticas e{" "}
              {project.schedule.overdueActivities} atividades vencidas.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-line p-3">
              <div className="text-xs text-ink-muted">Aderência</div>
              <div className="text-xl font-bold">
                {metrics.methodologyScore}%
              </div>
            </div>
            <div className="rounded-lg border border-line p-3">
              <div className="text-xs text-ink-muted">Desempenho temporal</div>
              <div className="text-xl font-bold">
                {metrics.schedulePerformance}%
              </div>
            </div>
            <div className="rounded-lg border border-line p-3">
              <div className="text-xs text-ink-muted">Stage Gates</div>
              <div className="text-xl font-bold">{metrics.stageGates}/7</div>
            </div>
            <div className="rounded-lg border border-line p-3">
              <div className="text-xs text-ink-muted">Rastreabilidade</div>
              <div className="text-xl font-bold">
                {project.quality.requirementsWithTests}%
              </div>
            </div>
          </div>
          <div>
            <Title level={3}>Resultado por fase</Title>
            <div className="mt-2 space-y-2">
              {project.phases.map((phase) => (
                <div
                  key={phase.id}
                  className="flex items-center justify-between rounded-lg bg-surface-subtle p-2"
                >
                  <span>
                    {phase.id} · {phase.name}
                  </span>
                  <Badge tone={stateTone(phase.state)}>
                    {phase.compliance}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Title level={3}>Conclusão</Title>
            <div className="mt-2 leading-6 text-ink-muted">
              {generalSituation === "Adequado"
                ? "O projeto demonstra controles metodológicos consistentes. Recomenda-se manter a governança e concluir as ações de melhoria registradas."
                : generalSituation === "Crítico"
                  ? "O projeto requer ação corretiva imediata antes do avanço formal entre fases. As não conformidades críticas devem ser tratadas e reavaliadas."
                  : "O projeto possui aderência parcial. Recomenda-se concluir aprovações pendentes, fortalecer evidências e acompanhar o plano de ação."}
            </div>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs text-warning-strong">
            Indicador interno WaterfallLab. Este relatório não constitui
            certificação independente.
          </div>
        </div>
      </Modal>
    </div>
  );
}
