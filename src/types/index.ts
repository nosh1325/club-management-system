export type UserRole = 'STUDENT' | 'CLUB_LEADER' | 'ADMIN'

export type ClubStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export type EventStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export type MembershipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export type BudgetRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  studentId: string | null
  department: string | null
  semester: string | null
  phone: string | null
  bio: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Club {
  id: string
  name: string
  description: string | null
  logo: string | null
  email: string | null
  website: string | null
  phone: string | null
  department: string | null
  status: ClubStatus
  foundedYear: number | null
  vision: string | null
  mission: string | null
  activities: string[]
  leaderId: string
  createdAt: Date
  updatedAt: Date
  leader?: User
  _count?: {
    memberships: number
    events: number
  }
}

export interface Event {
  id: string
  title: string
  description: string | null
  venue: string
  startDate: Date
  endDate: Date
  capacity: number | null
  isPublic: boolean
  status: EventStatus
  requirements: string | null
  clubId: string
  createdAt: Date
  updatedAt: Date
  club?: Club
  _count?: {
    rsvps: number
  }
}

export interface Membership {
  id: string
  userId: string
  clubId: string
  status: MembershipStatus
  role: string | null
  joinedAt: Date | null
  createdAt: Date
  updatedAt: Date
  user?: User
  club?: Club
}

export interface EventRsvp {
  id: string
  userId: string
  eventId: string
  status: string
  createdAt: Date
  updatedAt: Date
  user?: User
  event?: Event
}

export interface BudgetRequest {
  id: string
  title: string
  description: string | null
  amount: number
  purpose: string
  status: BudgetRequestStatus
  clubId: string
  requestedBy: string
  reviewedBy: string | null
  reviewNotes: string | null
  requestedAt: Date
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
  club?: Club
  requester?: User
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  recipients: string[]
  sentAt: Date
  createdAt: Date
}

// Form types
export interface RegisterUserData {
  name: string
  email: string
  password: string
  studentId?: string
  department?: string
  semester?: string
  phone?: string
}

export interface CreateClubData {
  name: string
  description?: string
  email?: string
  website?: string
  phone?: string
  department?: string
  foundedYear?: number
  vision?: string
  mission?: string
  activities: string[]
}

export interface CreateEventData {
  title: string
  description?: string
  venue: string
  startDate: Date
  endDate: Date
  capacity?: number
  isPublic: boolean
  requirements?: string
}

export interface CreateBudgetRequestData {
  title: string
  description?: string
  amount: number
  purpose: string
}

// Notification types
export type NotificationType = 'GENERAL' | 'CLUB_SPECIFIC' | 'EVENT' | 'URGENT' | 'MAINTENANCE'

export type NotificationTarget = 'ALL_USERS' | 'ALL_CLUB_LEADERS' | 'SPECIFIC_CLUB' | 'STUDENTS_ONLY' | 'ADMINS_ONLY'

export interface NotificationWithStatus extends Notification {
  isRead?: boolean
  readAt?: Date
}

export interface CreateNotificationData {
  title: string
  message: string
  type: NotificationType
  target: NotificationTarget
  clubId?: string
}

export interface NotificationStats {
  total: number
  unread: number
}
