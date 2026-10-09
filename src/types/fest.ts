export type HouseId = string;

export interface House {
  id: HouseId;
  name: string;
  motto: string;
  color: string;
  accentColor: string;
  captain: string;
  viceCaptain: string;
  points: number;
  firstCount: number;
  secondCount: number;
  thirdCount: number;
  gradeACount: number;
  gradeBCount: number;
  gradeCCount: number;
  registeredCount: number;
  logoEmoji?: string;
}

export type FestCategory = 'Sub-Junior' | 'Junior' | 'Senior' | 'Super Senior';
export type FestDepartment = 'Music' | 'Dance' | 'Fine Arts' | 'Literary' | 'Theatre' | 'Digital Media';

export type ProgramStatus = 'upcoming' | 'in_progress' | 'evaluating' | 'announced';

export interface ScoringCriteria {
  id: string;
  name: string;
  maxMarks: number;
  weightage: number;
  description: string;
}

export interface Program {
  id: string;
  code: string; // e.g. "DAN-101"
  title: string;
  department: FestDepartment;
  category: FestCategory;
  isGroup: boolean;
  maxDurationMins: number;
  day: 1 | 2 | 3;
  dateStr: string;
  timeSlot: string;
  stage: string;
  venueDetail: string;
  status: ProgramStatus;
  maxCandidates: number;
  criteria: ScoringCriteria[];
  coordinatorName: string;
  judges: string[];
}

export interface Candidate {
  id: string;
  chestNumber: string; // e.g. "C-104"
  name: string;
  houseId: HouseId;
  category: FestCategory;
  gradeSection: string; // e.g. "10-A"
  phoneEncrypted: string;
  parentContactEncrypted: string;
  registeredPrograms: string[]; // Program IDs
  attendanceStatus: 'Checked-In' | 'Awaiting' | 'Performing' | 'Completed';
  totalPointsWon: number;
  photoUrl?: string;
}

export type Grade = 'A' | 'B' | 'C' | 'None';

export interface CandidateScore {
  candidateId: string;
  chestNumber: string;
  candidateName: string;
  houseId: HouseId;
  programId: string;
  photoUrl?: string;
  criteriaScores: Record<string, number>;
  judgeScores?: Array<{
    judgeName: string;
    total: number;
  }>;
  totalMarks: number;
  grade: Grade;
  rank?: 1 | 2 | 3 | null;
  housePointsEarned: number;
  remarks?: string;
  evaluatedAt?: string;
  announcedAt?: string;
}

export interface ProgramResult {
  programId: string;
  isAnnounced: boolean;
  announcedTimestamp?: string;
  announcedBy?: string;
  scores: CandidateScore[];
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  assignedPrograms: string[]; // Program IDs
  assignedStages: string[];
  avatarBg: string;
}

export interface CrewTask {
  id: string;
  crewMemberId: string;
  title: string;
  programId?: string;
  stage?: string;
  day: 1 | 2 | 3;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  dueDate: string;
}

export type UserRole = 'admin' | 'judge' | 'coordinator' | 'spectator';

export interface FestNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'result' | 'schedule' | 'call' | 'announcement';
  programId?: string;
  houseId?: HouseId;
  read: boolean;
}
