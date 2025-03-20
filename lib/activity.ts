import { prisma } from './prisma'

export type ActivityType = 
  | 'USER_LOGIN'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'STATION_CREATED'
  | 'STATION_UPDATED'
  | 'STATION_DELETED'
  | 'DESTINATION_CREATED'
  | 'DESTINATION_UPDATED'
  | 'DESTINATION_DELETED'

export async function logActivity(userId: number, type: ActivityType, message: string) {
  return prisma.activity.create({
    data: {
      userId,
      type,
      message,
    },
  })
}

export async function getRecentActivities(limit = 10) {
  return prisma.activity.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  })
} 