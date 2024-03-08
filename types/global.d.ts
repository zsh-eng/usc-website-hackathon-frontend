export {}

declare global {
  interface NavigationLink {
    href: string
    label: string
  }

  type Venue = {
    id: number
    name: string
  }

  type Organisation = {
    id: number
    name: string
    description: string
    isAdminOrg: boolean
    inviteLink: string
    slug: string
    category: IGCategory
    isInactive: boolean
    isInvisible: boolean
  }

  type OrganisationForm = Omit<Organisation, 'slug'> & {
    igHead: number
    otherMembers: number[]
  }

  type UserOnOrg = {
    user: User
    isIGHead: boolean
    org: Organisation
  }

  type OrganisationWithIGHead = Organisation & {
    userOrg: UserOnOrg[]
  }

  type BookingDataBackend = {
    id: number
    venueId: number
    userId: number
    userOrgId: number
    bookedForOrgId?: number
    bookedForOrg?: Organisation // this field will only be populated if a user (typically an admin user) has made a
    // booking on behalf of another org
    start: string
    end: string
    bookedAt: string
    eventName: string
    bookedBy: UserOnOrg
  }

  type BookingDataDisplay = BookingDataBackend & {
    from: Date
    to: Date
  }

  interface BookingDataSelection {
    start: Date
    end: Date
    venueId: number
  }

  interface TelegramUser {
    id: string
    first_name: string
    username: string
    photo_url: string
    auth_date: number
    hash: string
  }

  interface UserInformation {
    firstName: string
    telegramId: string
    photoUrl: string
    username: string
  }

  interface AuthState extends ObjectWithSetupTime {
    token: string
    orgIds: Array<number>
    userInfo: UserInformation | null
    userId: number
    permissions: {
      isAdmin: boolean
      isAcadsAdmin: boolean
      venueIdToIsVenueAdmin: Record<number, boolean>
    }
  }

  interface BookingDataForm {
    eventName: string
    orgId: number
  }

  interface User {
    id: number
    name: string
    telegramUserName: string
    telegramId?: string
  }

  interface ToggleProps {
    isOn: boolean
    setIsOn: (isOn: boolean) => void
  }

  export interface ObjectWithSetupTime {
    setupTime: Date
  }

  export interface StringToStringJSObject {
    [index: string]: string
  }

  export interface NumberToStringJSObject {
    [index: number]: string
  }

  // Stylio
  interface StylioCourse {
    code: string
    name: string
  }

  interface StylioProfessor {
    id: number
    name: string
  }

  interface CourseOffering {
    id: number
    courseCode: string
    professorId: number
    semester: string
    ay: string
  }

  interface StylioStudent {
    id: number
    matriculationNo: string
    name: string
  }

  interface StylioSubmission {
    id: number
    title: string
    text: string
    lastUpdated: Date
    isPublished: boolean
    studentId: number
    courseOfferingId: number
  }

  interface StylioSubmissionPayload {
    title: string
    text: string
    matriculationNo: string
    courseOfferingInput: {
      courseCode: string
      professorId: number
      semester: string
      academicYear: number
    }
  }

  interface StylioDetailedSubmission extends StylioSubmission {
    student: StylioStudent
    courseOffering: CourseOffering & {
      course: StylioCourse
      professor: StylioProfessor
    }
  }
}
