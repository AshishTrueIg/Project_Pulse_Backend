import { StatusCodes } from 'http-status-codes'

const sendResponse = (
  { response },
  data,
  {
    message = 'success',
    statusCode = StatusCodes.OK
  } = {}
) => {
  const payload = {
    success: true,
    message,
    data
  }

  response.status(statusCode).json(payload)
}

const sendNoContent = ({ response }) => {
  response.status(StatusCodes.NO_CONTENT).send()
}

export { sendNoContent, sendResponse }
