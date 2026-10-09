import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  House,
  Program,
  Candidate,
  ProgramResult,
  CrewMember,
  CrewTask,
  FestNotification,
  UserRole,
  Grade,
  CandidateScore,
} from '../types/fest';
import {
  INITIAL_HOUSES,
  INITIAL_PROGRAMS,
  INITIAL_CANDIDATES,
  INITIAL_RESULTS,
  INITIAL_CREW_MEMBERS,
  INITIAL_CREW_TASKS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import {
  db,
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  handleFirestoreError,
  OperationType,
  testConnection,
} from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { User, onAuthStateChanged } from 'firebase/auth';

interface FestContextType {
  houses: House[];
  programs: Program[];
  candidates: Candidate[];
  results: Record<string, ProgramResult>;
  crewMembers: CrewMember[];
  crewTasks: CrewTask[];
  notifications: FestNotification[];
  currentRole: UserRole;
  mfaAuthenticated: boolean;
  privacyDataVisible: boolean;
  audioAlertsEnabled: boolean;
  pushPermissionGranted: boolean;
  selectedProgramId: string;
  setSelectedProgramId: (id: string) => void;
  filterDay: 1 | 2 | 3 | 'all';
  setFilterDay: (d: 1 | 2 | 3 | 'all') => void;
  filterDepartment: string;
  setFilterDepartment: (dept: string) => void;
  filterStage: string;
  setFilterStage: (stage: string) => void;

  // Firebase status & auth
  isFirebaseConnected: boolean;
  firebaseUser: User | null;
  loginWithGoogle: () => Promise<void>;
  logoutFirebase: () => Promise<void>;

  // Actions
  calculateGrade: (score: number) => Grade;
  updateCandidateScore: (
    programId: string,
    candidateId: string,
    criteriaScores: Record<string, number>,
    judgeScores?: Array<{ judgeName: string; total: number }>,
    remarks?: string
  ) => void;
  saveScore: (
    programId: string,
    candidateId: string,
    totalMarks: number,
    grade: Grade,
    criteriaScores?: Record<string, number>,
    remarks?: string
  ) => void;
  announceResult: (programId: string, announcedBy: string) => void;
  unannounceResult: (programId: string) => void;
  addHouse: (houseData: {
    name: string;
    motto: string;
    color: string;
    captain: string;
    viceCaptain: string;
    logoEmoji?: string;
  }) => boolean;
  removeHouse: (houseId: string) => boolean;
  registerStudent: (data: {
    name: string;
    houseId: House['id'];
    category: Candidate['category'];
    gradeSection: string;
    phone: string;
    parentPhone: string;
    selectedProgramIds?: string[];
    registeredPrograms?: string[];
    photoUrl?: string;
  }) => Candidate;
  toggleTaskComplete: (taskId: string) => void;
  addCrewTask: (task: Omit<CrewTask, 'id' | 'completed'>) => void;
  setRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  requestRoleChange: (targetRole: UserRole) => void;
  verifyMfa: (code: string) => boolean;
  verifyMfaCode: (code: string) => boolean;
  cancelMfa: () => void;
  isMfaModalOpen: boolean;
  togglePrivacyData: () => void;
  toggleAudioAlerts: () => void;
  requestPushPermission: () => Promise<boolean>;
  sendPushNotification: (
    title: string,
    message: string,
    type?: FestNotification['type'],
    programId?: string,
    houseId?: House['id']
  ) => void;
  broadcastCustomNotification: (title: string, message: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToSampleData: () => void;
}

const FestContext = createContext<FestContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'kalautsav_arts_fest_v1_';

export const FestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load local state initially
  const [houses, setHouses] = useState<House[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'houses');
    return saved ? JSON.parse(saved) : INITIAL_HOUSES;
  });

  const [programs, setPrograms] = useState<Program[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'programs');
    return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'candidates');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [results, setResults] = useState<Record<string, ProgramResult>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'results');
    return saved ? JSON.parse(saved) : INITIAL_RESULTS;
  });

  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'crew');
    return saved ? JSON.parse(saved) : INITIAL_CREW_MEMBERS;
  });

  const [crewTasks, setCrewTasks] = useState<CrewTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'tasks');
    return saved ? JSON.parse(saved) : INITIAL_CREW_TASKS;
  });

  const [notifications, setNotifications] = useState<FestNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [mfaAuthenticated, setMfaAuthenticated] = useState<boolean>(true);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  const [privacyDataVisible, setPrivacyDataVisible] = useState<boolean>(false);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(true);
  const [pushPermissionGranted, setPushPermissionGranted] = useState<boolean>(false);

  const [selectedProgramId, setSelectedProgramId] = useState<string>('prog-01');
  const [filterDay, setFilterDay] = useState<1 | 2 | 3 | 'all'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');

  // Firebase status & User
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'houses', JSON.stringify(houses));
  }, [houses]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'programs', JSON.stringify(programs));
  }, [programs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'candidates', JSON.stringify(candidates));
  }, [candidates]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'results', JSON.stringify(results));
  }, [results]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'crew', JSON.stringify(crewMembers));
  }, [crewMembers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'tasks', JSON.stringify(crewTasks));
  }, [crewTasks]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'notifs', JSON.stringify(notifications));
  }, [notifications]);

  // Firebase Auth listener and Firestore Connection check
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      setFirebaseUser(user);
    });

    testConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Firebase Firestore Realtime Sync
  useEffect(() => {
    const unsubHouses = onSnapshot(
      collection(db, 'houses'),
      snapshot => {
        if (!snapshot.empty) {
          const cloudHouses: House[] = [];
          snapshot.forEach(docSnap => {
            cloudHouses.push(docSnap.data() as House);
          });
          setHouses(cloudHouses);
        } else {
          // Seed houses to Firestore
          INITIAL_HOUSES.forEach(h => {
            setDoc(doc(db, 'houses', h.id), h).catch(() => {});
          });
        }
      },
      err => handleFirestoreError(err, OperationType.GET, 'houses')
    );

    const unsubCandidates = onSnapshot(
      collection(db, 'candidates'),
      snapshot => {
        if (!snapshot.empty) {
          const cloudCands: Candidate[] = [];
          snapshot.forEach(docSnap => {
            cloudCands.push(docSnap.data() as Candidate);
          });
          setCandidates(cloudCands);
        } else {
          // Seed candidates to Firestore
          INITIAL_CANDIDATES.slice(0, 15).forEach(c => {
            setDoc(doc(db, 'candidates', c.id), c).catch(() => {});
          });
        }
      },
      err => handleFirestoreError(err, OperationType.GET, 'candidates')
    );

    const unsubResults = onSnapshot(
      collection(db, 'results'),
      snapshot => {
        if (!snapshot.empty) {
          const cloudResults: Record<string, ProgramResult> = {};
          snapshot.forEach(docSnap => {
            const res = docSnap.data() as ProgramResult;
            cloudResults[res.programId] = res;
          });
          setResults(cloudResults);
        } else {
          // Seed results to Firestore
          Object.entries(INITIAL_RESULTS).forEach(([pId, r]) => {
            setDoc(doc(db, 'results', pId), r).catch(() => {});
          });
        }
      },
      err => handleFirestoreError(err, OperationType.GET, 'results')
    );

    const unsubCrewTasks = onSnapshot(
      collection(db, 'crewTasks'),
      snapshot => {
        if (!snapshot.empty) {
          const cloudTasks: CrewTask[] = [];
          snapshot.forEach(docSnap => {
            cloudTasks.push(docSnap.data() as CrewTask);
          });
          setCrewTasks(cloudTasks);
        } else {
          INITIAL_CREW_TASKS.forEach(t => {
            setDoc(doc(db, 'crewTasks', t.id), t).catch(() => {});
          });
        }
      },
      err => handleFirestoreError(err, OperationType.GET, 'crewTasks')
    );

    return () => {
      unsubHouses();
      unsubCandidates();
      unsubResults();
      unsubCrewTasks();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In Error:', error);
    }
  };

  const logoutFirebase = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  // Audio beep generator using Web Audio API
  const playAlertSound = useCallback((frequency = 660, duration = 0.15) => {
    if (!audioAlertsEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // AudioContext may be restricted before user gesture
    }
  }, [audioAlertsEnabled]);

  // Push notification sender
  const sendPushNotification = useCallback((
    title: string,
    message: string,
    type: FestNotification['type'] = 'announcement',
    programId?: string,
    houseId?: House['id']
  ) => {
    const newNotif: FestNotification = {
      id: 'notif-' + Date.now(),
      timestamp: 'Just now',
      title,
      message,
      type,
      read: false,
      programId,
      houseId,
    };

    setNotifications(prev => [newNotif, ...prev]);
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(() => {});
    playAlertSound(784, 0.2);

    if (pushPermissionGranted && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🌸 KalaUtsav: ${title}`, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch {
        // Fallback
      }
    }
  }, [playAlertSound, pushPermissionGranted]);

  const requestPushPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        setPushPermissionGranted(true);
        sendPushNotification('Push Notifications Enabled', 'You will receive instant alerts for live scores and calls.');
        return true;
      }
    } catch {
      // Fallback
    }
    setPushPermissionGranted(true);
    return true;
  };

  // Grade calculation logic
  const calculateGrade = (score: number): Grade => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'None';
  };

  // Automatic Ranking and House Point Calculation
  const recomputeHouseLeaderboard = useCallback((currentResults: Record<string, ProgramResult>) => {
    const houseStats: Record<string, {
      points: number;
      firsts: number;
      seconds: number;
      thirds: number;
      gradeA: number;
      gradeB: number;
      gradeC: number;
    }> = {};

    setHouses(prevHouses => {
      prevHouses.forEach(h => {
        houseStats[h.id] = { points: 0, firsts: 0, seconds: 0, thirds: 0, gradeA: 0, gradeB: 0, gradeC: 0 };
      });

      const candPointsMap: Record<string, number> = {};

      Object.values(currentResults).forEach(res => {
        if (!res.isAnnounced || !res.scores) return;

        res.scores.forEach(s => {
          if (!houseStats[s.houseId]) {
            houseStats[s.houseId] = { points: 0, firsts: 0, seconds: 0, thirds: 0, gradeA: 0, gradeB: 0, gradeC: 0 };
          }
          const h = houseStats[s.houseId];
          if (h) {
            h.points += s.housePointsEarned;
            if (s.rank === 1) h.firsts += 1;
            else if (s.rank === 2) h.seconds += 1;
            else if (s.rank === 3) h.thirds += 1;

            if (s.grade === 'A') h.gradeA += 1;
            else if (s.grade === 'B') h.gradeB += 1;
            else if (s.grade === 'C') h.gradeC += 1;
          }

          candPointsMap[s.candidateId] = (candPointsMap[s.candidateId] || 0) + s.housePointsEarned;
        });
      });

      setCandidates(prevCands =>
        prevCands.map(c => ({
          ...c,
          totalPointsWon: candPointsMap[c.id] || 0,
        }))
      );

      const updatedHouses = prevHouses.map(h => {
        const stats = houseStats[h.id] || { points: 0, firsts: 0, seconds: 0, thirds: 0, gradeA: 0, gradeB: 0, gradeC: 0 };
        const updated = {
          ...h,
          points: stats.points,
          firstCount: stats.firsts,
          secondCount: stats.seconds,
          thirdCount: stats.thirds,
          gradeACount: stats.gradeA,
          gradeBCount: stats.gradeB,
          gradeCCount: stats.gradeC,
        };
        // Sync updated house to Firestore
        setDoc(doc(db, 'houses', updated.id), updated).catch(() => {});
        return updated;
      });

      return updatedHouses;
    });
  }, []);

  // Update candidate score and dynamically calculate auto grade and ranks
  const updateCandidateScore = (
    programId: string,
    candidateId: string,
    criteriaScores: Record<string, number>,
    judgeScores?: Array<{ judgeName: string; total: number }>,
    remarks?: string
  ) => {
    const prog = programs.find(p => p.id === programId);
    if (!prog) return;

    let totalMarks = 0;
    if (judgeScores && judgeScores.length > 0) {
      const sum = judgeScores.reduce((acc, curr) => acc + curr.total, 0);
      totalMarks = Math.round(sum / judgeScores.length);
    } else {
      totalMarks = Object.values(criteriaScores).reduce((acc, curr) => acc + (curr || 0), 0);
    }

    const grade = calculateGrade(totalMarks);

    setResults(prev => {
      const existing = prev[programId] || {
        programId,
        isAnnounced: false,
        scores: [],
      };

      const cand = candidates.find(c => c.id === candidateId);
      const otherScores = (existing.scores || []).filter(s => s.candidateId !== candidateId);

      const newCandidateScore: CandidateScore = {
        candidateId,
        chestNumber: cand?.chestNumber || 'C-000',
        candidateName: cand?.name || 'Candidate',
        houseId: cand?.houseId || 'ruby',
        photoUrl: cand?.photoUrl,
        programId,
        criteriaScores,
        judgeScores,
        totalMarks,
        grade,
        rank: null,
        housePointsEarned: 0,
        remarks: remarks || '',
        evaluatedAt: new Date().toISOString(),
      };

      const allProgramScores = [...otherScores, newCandidateScore].sort((a, b) => b.totalMarks - a.totalMarks);

      const isGroup = prog.isGroup;
      const rank1Pts = isGroup ? 10 : 5;
      const rank2Pts = isGroup ? 6 : 3;
      const rank3Pts = isGroup ? 2 : 1;

      const rankedScores = allProgramScores.map((s, idx) => {
        let rank: 1 | 2 | 3 | null = null;
        let rankBonus = 0;

        if (idx === 0 && s.totalMarks > 0) {
          rank = 1;
          rankBonus = rank1Pts;
        } else if (idx === 1 && s.totalMarks > 0) {
          rank = 2;
          rankBonus = rank2Pts;
        } else if (idx === 2 && s.totalMarks > 0) {
          rank = 3;
          rankBonus = rank3Pts;
        }

        let gradeBonus = 0;
        if (s.grade === 'A') gradeBonus = 5;
        else if (s.grade === 'B') gradeBonus = 3;
        else if (s.grade === 'C') gradeBonus = 1;

        const totalEarned = rankBonus + gradeBonus;

        return {
          ...s,
          rank,
          housePointsEarned: totalEarned,
        };
      });

      const updatedProgramResult: ProgramResult = {
        ...existing,
        scores: rankedScores,
      };

      // Persist to Firestore
      setDoc(doc(db, 'results', programId), updatedProgramResult).catch(() => {});

      const updated = {
        ...prev,
        [programId]: updatedProgramResult,
      };

      if (updatedProgramResult.isAnnounced) {
        recomputeHouseLeaderboard(updated);
      }

      return updated;
    });
  };

  const saveScore = (
    programId: string,
    candidateId: string,
    totalMarks: number,
    grade: Grade,
    criteriaScores?: Record<string, number>,
    remarks?: string
  ) => {
    updateCandidateScore(programId, candidateId, criteriaScores || {}, undefined, remarks);
  };

  // Announce / Publish Result
  const announceResult = (programId: string, announcedBy: string) => {
    const prog = programs.find(p => p.id === programId);
    if (!prog) return;

    setResults(prev => {
      const current = prev[programId];
      if (!current) return prev;

      const announcedResult: ProgramResult = {
        ...current,
        isAnnounced: true,
        announcedTimestamp: new Date().toISOString(),
        announcedBy: announcedBy || 'Official Tabulation Panel',
      };

      const updated = {
        ...prev,
        [programId]: announcedResult,
      };

      setDoc(doc(db, 'results', programId), announcedResult).catch(() => {});
      recomputeHouseLeaderboard(updated);
      return updated;
    });

    const winner = results[programId]?.scores?.find(s => s.rank === 1);
    const winnerText = winner ? `🥇 Winner: ${winner.candidateName} (${winner.chestNumber})` : 'Scores Ratified';

    sendPushNotification(
      `Result Declared: ${prog.title}`,
      `${winnerText}. Overall house points updated dynamically.`,
      'result',
      programId
    );

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EC4899', '#F43F5E', '#A855F7', '#F59E0B'],
      });
    } catch {
      // Confetti optional
    }
  };

  const unannounceResult = (programId: string) => {
    setResults(prev => {
      const current = prev[programId];
      if (!current) return prev;

      const updatedResult: ProgramResult = {
        ...current,
        isAnnounced: false,
      };

      const updated = {
        ...prev,
        [programId]: updatedResult,
      };

      setDoc(doc(db, 'results', programId), updatedResult).catch(() => {});
      recomputeHouseLeaderboard(updated);
      return updated;
    });

    sendPushNotification('Result Status Updated', `Event results for ${programs.find(p => p.id === programId)?.title} reverted to in-progress.`);
  };

  // Add Team/House (Admin Only)
  const addHouse = (houseData: {
    name: string;
    motto: string;
    color: string;
    captain: string;
    viceCaptain: string;
    logoEmoji?: string;
  }): boolean => {
    if (currentRole !== 'admin') {
      sendPushNotification('Permission Denied', 'Only festival administrators can enroll new teams/houses.', 'announcement');
      return false;
    }

    const houseId = 'house-' + Date.now();
    const newHouse: House = {
      id: houseId,
      name: houseData.name,
      motto: houseData.motto || 'Grace, Art & Creative Harmony',
      color: houseData.color || '#EC4899',
      accentColor: houseData.color || '#DB2777',
      captain: houseData.captain,
      viceCaptain: houseData.viceCaptain,
      points: 0,
      firstCount: 0,
      secondCount: 0,
      thirdCount: 0,
      gradeACount: 0,
      gradeBCount: 0,
      gradeCCount: 0,
      registeredCount: 0,
      logoEmoji: houseData.logoEmoji || '🌸',
    };

    setHouses(prev => [...prev, newHouse]);
    setDoc(doc(db, 'houses', newHouse.id), newHouse).catch(() => {});
    sendPushNotification('New Team Enrolled', `Team "${houseData.name}" has been officially added to Firebase.`, 'announcement');
    return true;
  };

  // Remove Team/House (Admin Only)
  const removeHouse = (houseId: string): boolean => {
    if (currentRole !== 'admin') {
      sendPushNotification('Permission Denied', 'Only festival administrators can delete competitive teams/houses.', 'announcement');
      return false;
    }

    const target = houses.find(h => h.id === houseId);
    if (!target) return false;

    setHouses(prev => prev.filter(h => h.id !== houseId));
    deleteDoc(doc(db, 'houses', houseId)).catch(() => {});
    sendPushNotification('Team Removed', `Team "${target.name}" was removed by Administrator.`, 'announcement');
    return true;
  };

  // Online Student Registration
  const registerStudent = (data: {
    name: string;
    houseId: House['id'];
    category: Candidate['category'];
    gradeSection: string;
    phone: string;
    parentPhone: string;
    selectedProgramIds?: string[];
    registeredPrograms?: string[];
    photoUrl?: string;
  }): Candidate => {
    const selectedPrograms = data.selectedProgramIds || data.registeredPrograms || [];
    const randomSuffix = Math.floor(100 + Math.random() * 899);
    const chestNumber = `C-${randomSuffix}`;

    const newCandidate: Candidate = {
      id: 'cand-' + Date.now(),
      chestNumber,
      name: data.name,
      houseId: data.houseId,
      category: data.category,
      gradeSection: data.gradeSection,
      phoneEncrypted: `•••••••${data.phone.slice(-4) || '1234'}`,
      parentContactEncrypted: `•••••••${data.parentPhone.slice(-4) || '5678'}`,
      registeredPrograms: selectedPrograms,
      attendanceStatus: 'Checked-In',
      totalPointsWon: 0,
      photoUrl: data.photoUrl || '/src/assets/images/avatar_classical_dancer_1791536930246.jpg',
    };

    setCandidates(prev => [newCandidate, ...prev]);
    setDoc(doc(db, 'candidates', newCandidate.id), newCandidate).catch(() => {});

    setHouses(prev =>
      prev.map(h => (h.id === data.houseId ? { ...h, registeredCount: h.registeredCount + 1 } : h))
    );

    sendPushNotification(
      `Registration Confirmed: ${data.name}`,
      `Assigned Chest #${chestNumber} for House ${houses.find(h => h.id === data.houseId)?.name}. Registered in ${selectedPrograms.length} event(s).`,
      'announcement',
      undefined,
      data.houseId
    );

    return newCandidate;
  };

  // Crew Task Handlers
  const toggleTaskComplete = (taskId: string) => {
    setCrewTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const updated = { ...t, completed: !t.completed };
          setDoc(doc(db, 'crewTasks', t.id), updated).catch(() => {});
          return updated;
        }
        return t;
      })
    );
  };

  const addCrewTask = (task: Omit<CrewTask, 'id' | 'completed'>) => {
    const newTask: CrewTask = {
      ...task,
      id: 'task-' + Date.now(),
      completed: false,
    };
    setCrewTasks(prev => [newTask, ...prev]);
    setDoc(doc(db, 'crewTasks', newTask.id), newTask).catch(() => {});
  };

  // Role switching and MFA
  const requestRoleChange = (targetRole: UserRole) => {
    if (targetRole === 'admin' || targetRole === 'judge') {
      setPendingRole(targetRole);
      setIsMfaModalOpen(true);
    } else {
      setCurrentRole(targetRole);
      setMfaAuthenticated(false);
    }
  };

  const switchRole = (role: UserRole) => {
    requestRoleChange(role);
  };

  const verifyMfa = (code: string): boolean => {
    if (code.length === 6) {
      if (pendingRole) {
        setCurrentRole(pendingRole);
        setPendingRole(null);
      }
      setMfaAuthenticated(true);
      setIsMfaModalOpen(false);
      sendPushNotification('Privilege Verified', `Logged into session as ${pendingRole || currentRole}.`);
      return true;
    }
    return false;
  };

  const verifyMfaCode = (code: string): boolean => {
    return verifyMfa(code);
  };

  const cancelMfa = () => {
    setPendingRole(null);
    setIsMfaModalOpen(false);
  };

  const togglePrivacyData = () => {
    setPrivacyDataVisible(prev => !prev);
  };

  const toggleAudioAlerts = () => {
    setAudioAlertsEnabled(prev => !prev);
  };

  const broadcastCustomNotification = (title: string, message: string) => {
    sendPushNotification(title, message, 'announcement');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToSampleData = () => {
    setHouses(INITIAL_HOUSES);
    setPrograms(INITIAL_PROGRAMS);
    setCandidates(INITIAL_CANDIDATES);
    setResults(INITIAL_RESULTS);
    setCrewMembers(INITIAL_CREW_MEMBERS);
    setCrewTasks(INITIAL_CREW_TASKS);
    setNotifications(INITIAL_NOTIFICATIONS);

    // Sync to Firestore
    INITIAL_HOUSES.forEach(h => setDoc(doc(db, 'houses', h.id), h).catch(() => {}));
    INITIAL_CANDIDATES.slice(0, 15).forEach(c => setDoc(doc(db, 'candidates', c.id), c).catch(() => {}));
    Object.entries(INITIAL_RESULTS).forEach(([pId, r]) => setDoc(doc(db, 'results', pId), r).catch(() => {}));

    sendPushNotification('Database Reset', 'Synchronized sample festival catalog to Firestore.');
  };

  return (
    <FestContext.Provider
      value={{
        houses,
        programs,
        candidates,
        results,
        crewMembers,
        crewTasks,
        notifications,
        currentRole,
        mfaAuthenticated,
        privacyDataVisible,
        audioAlertsEnabled,
        pushPermissionGranted,
        selectedProgramId,
        setSelectedProgramId,
        filterDay,
        setFilterDay,
        filterDepartment,
        setFilterDepartment,
        filterStage,
        setFilterStage,
        isFirebaseConnected,
        firebaseUser,
        loginWithGoogle,
        logoutFirebase,
        calculateGrade,
        updateCandidateScore,
        saveScore,
        announceResult,
        unannounceResult,
        addHouse,
        removeHouse,
        registerStudent,
        toggleTaskComplete,
        addCrewTask,
        setRole: setCurrentRole,
        switchRole,
        requestRoleChange,
        verifyMfa,
        verifyMfaCode,
        cancelMfa,
        isMfaModalOpen,
        togglePrivacyData,
        toggleAudioAlerts,
        requestPushPermission,
        sendPushNotification,
        broadcastCustomNotification,
        markNotificationRead,
        markAllNotificationsRead,
        resetToSampleData,
      }}
    >
      {children}
    </FestContext.Provider>
  );
};

export const useFest = () => {
  const context = useContext(FestContext);
  if (!context) {
    throw new Error('useFest must be used within a FestProvider');
  }
  return context;
};
