import { Op } from 'sequelize'

import {
  Project,
  ProjectAssignment,
  User
} from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import { getScopedProjectWhere } from '../projects/project.helpers'

class GetFeedbackOptionsService extends BaseHandler {
  async run () {
    const projectScope = await getScopedProjectWhere(
      this.context.auth,
      this.dbTransaction
    )
    const projects = await Project.findAll({
      where: {
        [Op.and]: [
          projectScope,
          {
            status: 'active'
          }
        ]
      },
      attributes: ['id', 'code', 'name'],
      include: [
        {
          model: ProjectAssignment,
          as: 'assignments',
          where: {
            leftAt: {
              [Op.is]: null
            }
          },
          required: false,
          attributes: ['id', 'projectRole'],
          include: [
            {
              model: User,
              as: 'member',
              where: {
                status: 'active'
              },
              attributes: ['id', 'fullName', 'jobTitle']
            }
          ]
        }
      ],
      order: [['name', 'ASC']],
      transaction: this.dbTransaction
    })

    return {
      feedbackTypes: [
        'manager',
        'team_lead',
        'client',
        'project_completion',
        'periodic_review',
        'self_reflection'
      ],
      projects: projects.map(project => ({
        id: project.id,
        code: project.code,
        name: project.name,
        members: project.assignments
          .map(assignment => ({
            id: assignment.member.id,
            fullName: assignment.member.fullName,
            jobTitle: assignment.member.jobTitle,
            projectRole: assignment.projectRole
          }))
          .sort((left, right) => left.fullName.localeCompare(right.fullName))
      }))
    }
  }
}

export default GetFeedbackOptionsService
