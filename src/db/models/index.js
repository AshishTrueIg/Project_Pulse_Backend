import { DataTypes, Sequelize } from 'sequelize'

import config from '@src/configs/app.config'

import defineAuditLog from './auditLog.model'
import defineBillingRecord from './billingRecord.model'
import defineClient from './client.model'
import defineMilestone from './milestone.model'
import defineOrganization from './organization.model'
import defineProject from './project.model'
import defineProjectAssignment from './projectAssignment.model'
import defineProjectContract from './projectContract.model'
import defineProjectFeedback from './projectFeedback.model'
import defineProjectHealthUpdate from './projectHealthUpdate.model'
import defineRefreshSession from './refreshSession.model'
import defineRisk from './risk.model'
import defineRole from './role.model'
import defineUser from './user.model'
import defineUserInvitation from './userInvitation.model'
import defineUserRole from './userRole.model'

const sequelize = new Sequelize(
  config.get('db.name'),
  config.get('db.username'),
  config.get('db.password'),
  {
    host: config.get('db.host'),
    port: config.get('db.port'),
    dialect: 'postgres',
    logging: config.get('db.logging') ? console.log : false,
    define: {
      underscored: true,
      timestamps: true
    }
  }
)

const Organization = defineOrganization(sequelize, DataTypes)
const Role = defineRole(sequelize, DataTypes)
const User = defineUser(sequelize, DataTypes)
const UserInvitation = defineUserInvitation(sequelize, DataTypes)
const UserRole = defineUserRole(sequelize, DataTypes)
const RefreshSession = defineRefreshSession(sequelize, DataTypes)
const AuditLog = defineAuditLog(sequelize, DataTypes)
const BillingRecord = defineBillingRecord(sequelize, DataTypes)
const Client = defineClient(sequelize, DataTypes)
const Project = defineProject(sequelize, DataTypes)
const ProjectAssignment = defineProjectAssignment(sequelize, DataTypes)
const ProjectContract = defineProjectContract(sequelize, DataTypes)
const ProjectFeedback = defineProjectFeedback(sequelize, DataTypes)
const ProjectHealthUpdate = defineProjectHealthUpdate(sequelize, DataTypes)
const Milestone = defineMilestone(sequelize, DataTypes)
const Risk = defineRisk(sequelize, DataTypes)

Organization.hasMany(Role, {
  as: 'roles',
  foreignKey: 'organizationId'
})
Role.belongsTo(Organization, {
  as: 'organization',
  foreignKey: 'organizationId'
})

Organization.hasMany(User, {
  as: 'users',
  foreignKey: 'organizationId'
})
User.belongsTo(Organization, {
  as: 'organization',
  foreignKey: 'organizationId'
})
User.belongsTo(User, {
  as: 'manager',
  foreignKey: 'managerUserId'
})
User.hasMany(User, {
  as: 'directReports',
  foreignKey: 'managerUserId'
})

User.belongsToMany(Role, {
  as: 'roles',
  through: {
    model: UserRole
  },
  foreignKey: 'userId',
  otherKey: 'roleId'
})
Role.belongsToMany(User, {
  as: 'users',
  through: {
    model: UserRole
  },
  foreignKey: 'roleId',
  otherKey: 'userId'
})

Organization.hasMany(UserInvitation, {
  as: 'invitations',
  foreignKey: 'organizationId'
})
UserInvitation.belongsTo(Organization, {
  as: 'organization',
  foreignKey: 'organizationId'
})
Role.hasMany(UserInvitation, {
  as: 'invitations',
  foreignKey: 'roleId'
})
UserInvitation.belongsTo(Role, {
  as: 'role',
  foreignKey: 'roleId'
})
User.hasMany(UserInvitation, {
  as: 'sentInvitations',
  foreignKey: 'invitedByUserId'
})
UserInvitation.belongsTo(User, {
  as: 'invitedBy',
  foreignKey: 'invitedByUserId'
})
User.hasMany(UserInvitation, {
  as: 'managedInvitations',
  foreignKey: 'managerUserId'
})
UserInvitation.belongsTo(User, {
  as: 'manager',
  foreignKey: 'managerUserId'
})
User.hasOne(UserInvitation, {
  as: 'acceptedInvitation',
  foreignKey: 'acceptedUserId'
})
UserInvitation.belongsTo(User, {
  as: 'acceptedUser',
  foreignKey: 'acceptedUserId'
})

User.hasMany(RefreshSession, {
  as: 'refreshSessions',
  foreignKey: 'userId'
})
RefreshSession.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
})

User.hasMany(AuditLog, {
  as: 'auditEvents',
  foreignKey: 'actorUserId'
})
AuditLog.belongsTo(User, {
  as: 'actor',
  foreignKey: 'actorUserId'
})

Organization.hasMany(Client, {
  as: 'clients',
  foreignKey: 'organizationId'
})
Client.belongsTo(Organization, {
  as: 'organization',
  foreignKey: 'organizationId'
})

Organization.hasMany(Project, {
  as: 'projects',
  foreignKey: 'organizationId'
})
Project.belongsTo(Organization, {
  as: 'organization',
  foreignKey: 'organizationId'
})
Client.hasMany(Project, {
  as: 'projects',
  foreignKey: 'clientId'
})
Project.belongsTo(Client, {
  as: 'client',
  foreignKey: 'clientId'
})
User.hasMany(Project, {
  as: 'managedProjects',
  foreignKey: 'managerUserId'
})
Project.belongsTo(User, {
  as: 'manager',
  foreignKey: 'managerUserId'
})

Project.hasMany(ProjectAssignment, {
  as: 'assignments',
  foreignKey: 'projectId'
})
ProjectAssignment.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId'
})
User.hasMany(ProjectAssignment, {
  as: 'projectAssignments',
  foreignKey: 'userId'
})
ProjectAssignment.belongsTo(User, {
  as: 'member',
  foreignKey: 'userId'
})

Project.hasMany(Milestone, {
  as: 'milestones',
  foreignKey: 'projectId'
})
Milestone.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId'
})
User.hasMany(Milestone, {
  as: 'ownedMilestones',
  foreignKey: 'ownerUserId'
})
Milestone.belongsTo(User, {
  as: 'owner',
  foreignKey: 'ownerUserId'
})
User.hasMany(Milestone, {
  as: 'acceptedMilestones',
  foreignKey: 'acceptedByUserId'
})
Milestone.belongsTo(User, {
  as: 'acceptedBy',
  foreignKey: 'acceptedByUserId'
})

Project.hasMany(Risk, {
  as: 'risks',
  foreignKey: 'projectId'
})
Risk.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId'
})
Risk.belongsTo(User, {
  as: 'owner',
  foreignKey: 'ownerUserId'
})

Project.hasOne(ProjectContract, {
  as: 'contract',
  foreignKey: 'projectId'
})
ProjectContract.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId'
})
ProjectContract.hasMany(BillingRecord, {
  as: 'billingRecords',
  foreignKey: 'contractId'
})
BillingRecord.belongsTo(ProjectContract, {
  as: 'contract',
  foreignKey: 'contractId'
})
Project.hasMany(BillingRecord, {
  as: 'billingRecords',
  foreignKey: 'projectId'
})
BillingRecord.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId'
})

Project.hasMany(ProjectFeedback, {
  as: 'feedback',
  foreignKey: 'projectId'
})
ProjectFeedback.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId'
})
User.hasMany(ProjectFeedback, {
  as: 'receivedProjectFeedback',
  foreignKey: 'subjectUserId'
})
ProjectFeedback.belongsTo(User, {
  as: 'subject',
  foreignKey: 'subjectUserId'
})
User.hasMany(ProjectFeedback, {
  as: 'authoredProjectFeedback',
  foreignKey: 'authorUserId'
})
ProjectFeedback.belongsTo(User, {
  as: 'author',
  foreignKey: 'authorUserId'
})

Project.hasMany(ProjectHealthUpdate, {
  as: 'healthUpdates',
  foreignKey: 'projectId'
})
ProjectHealthUpdate.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId'
})
User.hasMany(ProjectHealthUpdate, {
  as: 'submittedHealthUpdates',
  foreignKey: 'submittedByUserId'
})
ProjectHealthUpdate.belongsTo(User, {
  as: 'submittedBy',
  foreignKey: 'submittedByUserId'
})

export {
  AuditLog,
  BillingRecord,
  Client,
  Milestone,
  Organization,
  Project,
  ProjectAssignment,
  ProjectContract,
  ProjectFeedback,
  ProjectHealthUpdate,
  RefreshSession,
  Risk,
  Role,
  User,
  UserInvitation,
  UserRole,
  sequelize
}
