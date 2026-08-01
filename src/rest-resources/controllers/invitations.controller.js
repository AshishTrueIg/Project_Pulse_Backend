import { StatusCodes } from 'http-status-codes'

import { sendResponse } from '@src/helpers/response.helpers'
import AcceptInvitationService from '@src/services/invitations/acceptInvitation.service'
import CreateInvitationService from '@src/services/invitations/createInvitation.service'
import ListInvitationsService from '@src/services/invitations/listInvitations.service'
import ResendInvitationService from '@src/services/invitations/resendInvitation.service'
import RevokeInvitationService from '@src/services/invitations/revokeInvitation.service'
import ValidateInvitationService from '@src/services/invitations/validateInvitation.service'

class InvitationsController {
  static async list (request, response, next) {
    try {
      const result = await ListInvitationsService.execute(
        request.query,
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async create (request, response, next) {
    try {
      const result = await CreateInvitationService.execute(
        request.body,
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Invitation created',
        statusCode: StatusCodes.CREATED
      })
    } catch (error) {
      next(error)
    }
  }

  static async resend (request, response, next) {
    try {
      const result = await ResendInvitationService.execute(
        {
          invitationId: request.params.invitationId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Invitation resent'
      })
    } catch (error) {
      next(error)
    }
  }

  static async revoke (request, response, next) {
    try {
      const result = await RevokeInvitationService.execute(
        {
          invitationId: request.params.invitationId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Invitation revoked'
      })
    } catch (error) {
      next(error)
    }
  }

  static async validate (request, response, next) {
    try {
      response.set('Cache-Control', 'no-store')
      const result = await ValidateInvitationService.execute(
        request.body,
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async accept (request, response, next) {
    try {
      response.set('Cache-Control', 'no-store')
      const result = await AcceptInvitationService.execute(
        request.body,
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Invitation accepted'
      })
    } catch (error) {
      next(error)
    }
  }
}

export default InvitationsController
