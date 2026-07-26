import { StatusCodes } from 'http-status-codes'

import getManagerOverview from '@src/services/dashboard/getManagerOverview.service'

const getOverviewController = async (request, response) => {
  const overview = await getManagerOverview(request.auth)

  response.status(StatusCodes.OK).json({
    data: overview
  })
}

export default getOverviewController
