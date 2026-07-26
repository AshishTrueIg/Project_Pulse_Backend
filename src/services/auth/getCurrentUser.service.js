import BaseHandler from '@src/libs/baseHandler'

import { serializeAuthUser } from './authUser.service'

class GetCurrentUserService extends BaseHandler {
  async run () {
    return {
      user: serializeAuthUser(this.context.currentUser)
    }
  }
}

export default GetCurrentUserService
