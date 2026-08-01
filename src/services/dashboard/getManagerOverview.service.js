import { Client, Milestone, Project, ProjectAssignment, Risk, User } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

const ACTIVE_RISK_STATUSES = new Set(['open', 'mitigating'])
const COMPLETE_MILESTONE_STATUSES = new Set(['accepted', 'completed'])

const formatStage = stage =>
  stage
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const getInitials = fullName =>
  fullName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatDate = value =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(value)

class GetManagerOverviewService extends BaseHandler {
  async run () {
    const projects = await Project.findAll({
      where: {
        organizationId: this.context.auth.organizationId,
        status: 'active'
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name']
        },
        {
          model: ProjectAssignment,
          as: 'assignments',
          include: [
            {
              model: User,
              as: 'member',
              attributes: ['id', 'fullName', 'jobTitle']
            }
          ]
        },
        {
          model: Milestone,
          as: 'milestones'
        },
        {
          model: Risk,
          as: 'risks',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'fullName']
            }
          ]
        }
      ],
      order: [
        ['name', 'ASC'],
        [{ model: Milestone, as: 'milestones' }, 'dueDate', 'ASC']
      ]
    })

    const now = new Date()
    const reportingCadenceDays = Number(
      this.context.currentUser.organization.reportingCadenceDays
    ) || 7
    const reportingThreshold = new Date(
      now.getTime() - reportingCadenceDays * 24 * 60 * 60 * 1000
    )
    const uniqueMemberIds = new Set()
    const healthDistribution = {
      green: 0,
      amber: 0,
      red: 0,
      notAssessed: 0
    }
    const attention = []

    projects.forEach(project => {
      project.assignments.forEach(assignment => uniqueMemberIds.add(assignment.userId))

      const healthKey = project.overallHealth === 'not_assessed' ? 'notAssessed' : project.overallHealth
      healthDistribution[healthKey] += 1

      if (!project.lastHealthUpdatedAt || project.lastHealthUpdatedAt < reportingThreshold) {
        attention.push({
          id: `stale-${project.id}`,
          projectId: project.id,
          projectName: project.name,
          tone: 'amber',
          title: 'Weekly health update is overdue',
          meta: project.lastHealthUpdatedAt
            ? `Last update ${formatDate(project.lastHealthUpdatedAt)}`
            : 'No update submitted'
        })
      }

      project.risks
        .filter(risk => ACTIVE_RISK_STATUSES.has(risk.status) && ['high', 'critical'].includes(risk.severity))
        .forEach(risk => {
          attention.push({
            id: `risk-${risk.id}`,
            projectId: project.id,
            projectName: project.name,
            tone: risk.severity === 'critical' ? 'red' : 'amber',
            title: risk.title,
            meta: `${formatStage(risk.severity)} risk · Owner ${risk.owner.fullName}`
          })
        })

      project.milestones
        .filter(
          milestone =>
            !COMPLETE_MILESTONE_STATUSES.has(milestone.status) &&
          new Date(`${milestone.dueDate}T23:59:59Z`) < now
        )
        .forEach(milestone => {
          attention.push({
            id: `milestone-${milestone.id}`,
            projectId: project.id,
            projectName: project.name,
            tone: 'red',
            title: `${milestone.name} is overdue`,
            meta: `Due ${milestone.dueDate}`
          })
        })
    })

    const openBlockers = projects.reduce(
      (total, project) =>
        total + project.risks.filter(risk => ACTIVE_RISK_STATUSES.has(risk.status)).length,
      0
    )
    const updatesDue = projects.filter(
      project => !project.lastHealthUpdatedAt || project.lastHealthUpdatedAt < reportingThreshold
    ).length
    const portfolioScore =
    projects.length === 0
      ? null
      : Math.round(
        projects.reduce(
          (total, project) => total + Number(project.healthScore || 0),
          0
        ) / projects.length
      )

    return {
      generatedAt: now.toISOString(),
      summary: {
        activeProjects: projects.length,
        teamMembers: uniqueMemberIds.size,
        updatesDue,
        openBlockers,
        portfolioScore
      },
      healthDistribution,
      projects: projects.map(project => {
        const acceptedMilestones = project.milestones.filter(milestone =>
          COMPLETE_MILESTONE_STATUSES.has(milestone.status)
        ).length
        const progress =
        project.milestones.length === 0
          ? 0
          : Math.round((acceptedMilestones / project.milestones.length) * 100)
        const nextMilestone = project.milestones.find(milestone =>
          ['planned', 'in_progress', 'ready_for_review', 'changes_requested'].includes(
            milestone.status
          )
        )

        return {
          id: project.id,
          code: project.code,
          name: project.name,
          client: project.client.name,
          stage: project.stage,
          stageLabel: formatStage(project.stage),
          health: project.overallHealth,
          healthScore: Number(project.healthScore || 0),
          managerHealthAssessment:
            project.managerHealthAssessment || 'not_assessed',
          progress,
          acceptedMilestones,
          totalMilestones: project.milestones.length,
          nextMilestone: nextMilestone
            ? {
                name: nextMilestone.name,
                dueDate: nextMilestone.dueDate,
                status: nextMilestone.status
              }
            : null,
          team: project.assignments.slice(0, 4).map(assignment => ({
            id: assignment.member.id,
            fullName: assignment.member.fullName,
            initials: getInitials(assignment.member.fullName),
            jobTitle: assignment.member.jobTitle,
            projectRole: assignment.projectRole,
            workloadSignal: assignment.workloadSignal
          }))
        }
      }),
      attention: attention.slice(0, 6)
    }
  }
}

export default GetManagerOverviewService
