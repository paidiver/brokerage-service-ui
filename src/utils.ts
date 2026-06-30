import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(utc)

export const formatUuid = (uuid: string) => {
  const parts = [
    uuid.substring(0, 8),
    uuid.substring(8, 12),
    uuid.substring(12, 16),
    uuid.substring(16, 20),
    uuid.substring(20, 32)
  ]
  return parts.join('-')
}

export const formatDatetime = (datetimeString: string, localFormat = true): string => {
  if (localFormat) {
    return dayjs.utc(datetimeString).local().format('D MMM YYYY h:mma')
  }
  return dayjs.utc(datetimeString).format('D MMM YYYY h:mma')
}
