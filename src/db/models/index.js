import { DataTypes, Sequelize } from 'sequelize'

import config from '@src/configs/app.config'

import defineAuditLog from './auditLog.model'
import defineClient from './client.model'
import defineMilestone from './milestone.model'
import defineOrganization from './organization.model'
import defineProject from './project.model'
import defineProjectAssignment from './projectAssignment.model'
import defineRefreshSession from './refreshSession.model'
import defineRisk from './risk.model'
import defineRole from './role.model'
import defineUser from './user.model'

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
const RefreshSession = defineRefreshSession(sequelize, DataTypes)
const AuditLog = defineAuditLog(sequelize, DataTypes)
const Client = defineClient(sequelize, DataTypes)
const Project = defineProject(sequelize, DataTypes)
const ProjectAssignment = defineProjectAssignment(sequelize, DataTypes)
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

User.belongsToMany(Role, {
  as: 'roles',
  through: {
    model: 'user_roles',
    timestamps: false
  },
  foreignKey: 'userId',
  otherKey: 'roleId'
})
Role.belongsToMany(User, {
  as: 'users',
  through: {
    model: 'user_roles',
    timestamps: false
  },
  foreignKey: 'roleId',
  otherKey: 'userId'
})

User.hasMany(RefreshSession, {
  as: 'refreshSessions',
  foreignKey: 'userId'
})
RefreshSession.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
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

export {
  AuditLog,
  Client,
  Milestone,
  Organization,
  Project,
  ProjectAssignment,
  RefreshSession,
  Risk,
  Role,
  User,
  sequelize
}
