import jsPDF from 'jspdf';
import { House, Program, Candidate, ProgramResult, CrewMember, CrewTask } from '../types/fest';

// Helper to trigger direct CSV file download
export const downloadCSV = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 1. Export Candidates for a single Program (CSV)
export const exportProgramCandidatesCSV = (program: Program, candidates: Candidate[], houses: House[]) => {
  const houseMap = new Map(houses.map(h => [h.id, h.name]));
  const headers = ['Sl No', 'Chest Number', 'Candidate Name', 'House / Team', 'Category', 'Class & Sec', 'Attendance Status'];
  
  const programCandidates = candidates.filter(c => c.registeredPrograms.includes(program.id));
  const rows = programCandidates.map((c, index) => [
    index + 1,
    `"${c.chestNumber}"`,
    `"${c.name}"`,
    `"${houseMap.get(c.houseId) || c.houseId}"`,
    `"${c.category}"`,
    `"${c.gradeSection}"`,
    `"${c.attendanceStatus}"`
  ]);

  const csvContent = [
    `"PROGRAM CANDIDATE CALL SHEET - KALAUTSAV 2026"`,
    `"Program: ${program.code} - ${program.title}"`,
    `"Venue: ${program.stage} | Day: ${program.day} | Time: ${program.timeSlot}"`,
    `"Total Registered Candidates: ${programCandidates.length}"`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  downloadCSV(`${program.code}_Candidates_List.csv`, csvContent);
};

// 2. Export Official Program Result (CSV)
export const exportProgramResultCSV = (program: Program, result: ProgramResult, houses: House[]) => {
  const houseMap = new Map(houses.map(h => [h.id, h.name]));
  const headers = ['Rank', 'Chest Number', 'Candidate Name', 'House', 'Total Marks (/100)', 'Grade', 'House Points', 'Status'];

  const rows = (result.scores || []).map(s => [
    s.rank ? s.rank : 'Unranked',
    `"${s.chestNumber}"`,
    `"${s.candidateName}"`,
    `"${houseMap.get(s.houseId) || s.houseId}"`,
    s.totalMarks,
    s.grade,
    s.housePointsEarned,
    result.isAnnounced ? 'Announced' : 'Evaluating'
  ]);

  const csvContent = [
    `"OFFICIAL RESULT SHEET - KALAUTSAV ARTS FEST 2026"`,
    `"Program: ${program.code} - ${program.title}"`,
    `"Announced Status: ${result.isAnnounced ? 'OFFICIALLY DECLARED' : 'PROVISIONAL / NOT ANNOUNCED'}"`,
    `"Certified By: ${result.announcedBy || 'Tabulation Panel'}"`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  downloadCSV(`${program.code}_Official_Result.csv`, csvContent);
};

// 3. Export House Standings (CSV)
export const exportHouseStandingsCSV = (houses: House[]) => {
  const headers = ['Rank', 'House Name', 'Motto', 'Total Points', '1st Places', '2nd Places', '3rd Places', 'A-Grades', 'B-Grades', 'C-Grades', 'House Captain'];
  const sorted = [...houses].sort((a, b) => b.points - a.points);
  
  const rows = sorted.map((h, i) => [
    i + 1,
    `"${h.name}"`,
    `"${h.motto}"`,
    h.points,
    h.firstCount,
    h.secondCount,
    h.thirdCount,
    h.gradeACount,
    h.gradeBCount,
    h.gradeCCount,
    `"${h.captain}"`
  ]);

  const csvContent = [
    `"INTER-HOUSE ARTS FEST CHAMPIONSHIP STANDINGS - KALAUTSAV 2026"`,
    `"Export Timestamp: ${new Date().toLocaleString()}"`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  downloadCSV(`KalaUtsav_House_Standings.csv`, csvContent);
};

// 4. Export Crew Operations & Workload (CSV)
export const exportCrewOperationsCSV = (crew: CrewMember[], tasks: CrewTask[]) => {
  const headers = ['Crew Member', 'Role', 'Department', 'Assigned Programs Count', 'Total Tasks Assigned', 'Completed Tasks', 'Pending Tasks', 'Completion Rate (%)'];
  
  const rows = crew.map(c => {
    const memberTasks = tasks.filter(t => t.crewMemberId === c.id);
    const completed = memberTasks.filter(t => t.completed).length;
    const total = memberTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 100;
    return [
      `"${c.name}"`,
      `"${c.role}"`,
      `"${c.department}"`,
      c.assignedPrograms.length,
      total,
      completed,
      total - completed,
      `${rate}%`
    ];
  });

  const csvContent = [
    `"STAFF CREW WORKLOAD & PROGRESS REPORT - KALAUTSAV 2026"`,
    `"Generated: ${new Date().toLocaleString()}"`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  downloadCSV(`KalaUtsav_Crew_Workload.csv`, csvContent);
};

// 5. PDF EXPORT: Candidate List Call Sheet for a Program
export const exportProgramCandidatesPDF = (program: Program, candidates: Candidate[], houses: House[]) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const houseMap = new Map(houses.map(h => [h.id, h.name]));
  const programCandidates = candidates.filter(c => c.registeredPrograms.includes(program.id));

  // Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('KALAUTSAV 2026 - CANDIDATE CALL SHEET', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Official Stage Roster | Department: ${program.department} | Category: ${program.category}`, 14, 21);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 27);

  // Program details card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${program.code}: ${program.title}`, 18, 46);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Venue / Stage: ${program.stage}`, 18, 52);
  doc.text(`Day ${program.day} | Time Slot: ${program.timeSlot} | Max Duration: ${program.maxDurationMins} mins`, 18, 57);
  doc.text(`Stage Coordinator: ${program.coordinatorName}`, 120, 52);
  doc.text(`Total Candidates: ${programCandidates.length}`, 120, 57);

  // Table header
  let y = 70;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('#', 17, y + 5.5);
  doc.text('Chest No', 27, y + 5.5);
  doc.text('Candidate Name', 52, y + 5.5);
  doc.text('House / Team', 105, y + 5.5);
  doc.text('Class/Sec', 145, y + 5.5);
  doc.text('Sign / Verification', 165, y + 5.5);

  y += 8;
  doc.setFont('helvetica', 'normal');

  programCandidates.forEach((c, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 7, 196, y + 7);

    doc.setTextColor(15, 23, 42);
    doc.text(String(idx + 1), 17, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(c.chestNumber, 27, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(c.name, 52, y + 5);
    doc.text(houseMap.get(c.houseId) || c.houseId, 105, y + 5);
    doc.text(c.gradeSection, 145, y + 5);
    
    // Checkbox / Signature line
    doc.setDrawColor(203, 213, 225);
    doc.rect(168, y + 1.5, 22, 4.5);

    y += 8;
  });

  // Footer notes & signatures
  const footY = Math.max(y + 15, 250);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Rules Note: Candidates must report 15 minutes before scheduled slot with chest badge pinned.', 14, footY);
  
  doc.line(14, footY + 15, 60, footY + 15);
  doc.text('Desk Clerk Signature', 14, footY + 19);

  doc.line(80, footY + 15, 130, footY + 15);
  doc.text('Stage Manager Signature', 80, footY + 19);

  doc.line(150, footY + 15, 196, footY + 15);
  doc.text('Chief Tabulator Signature', 150, footY + 19);

  doc.save(`${program.code}_Candidate_Call_Sheet.pdf`);
};

// 6. PDF EXPORT: Official Result Sheet
export const exportProgramResultPDF = (program: Program, result: ProgramResult, houses: House[]) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const houseMap = new Map(houses.map(h => [h.id, h.name]));

  // Header banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('KALAUTSAV 2026 - OFFICIAL RESULTS CERTIFICATE', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`Status: ${result.isAnnounced ? 'OFFICIALLY DECLARED & RATIFIED' : 'PROVISIONAL TABULATION'}`, 14, 21);
  doc.text(`Certified By: ${result.announcedBy || 'Board of Judges'} | ${result.announcedTimestamp || new Date().toLocaleString()}`, 14, 27);

  // Program details card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${program.code}: ${program.title}`, 18, 46);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Venue: ${program.stage} | Category: ${program.category} | Day ${program.day}`, 18, 52);
  doc.text(`Judges Panel: ${program.judges.join(', ')}`, 18, 58);

  // Table header
  let y = 70;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Rank', 17, y + 5.5);
  doc.text('Chest No', 32, y + 5.5);
  doc.text('Candidate Name', 55, y + 5.5);
  doc.text('House / Team', 110, y + 5.5);
  doc.text('Total Marks', 150, y + 5.5);
  doc.text('Grade', 172, y + 5.5);
  doc.text('Points', 186, y + 5.5);

  y += 8;
  doc.setFont('helvetica', 'normal');

  (result.scores || []).forEach((s) => {
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 7, 196, y + 7);

    doc.setTextColor(15, 23, 42);
    
    // Rank styling
    if (s.rank === 1) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9); // Gold
      doc.text('1st Place', 17, y + 5);
    } else if (s.rank === 2) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139); // Silver
      doc.text('2nd Place', 17, y + 5);
    } else if (s.rank === 3) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9); // Bronze
      doc.text('3rd Place', 17, y + 5);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('-', 17, y + 5);
    }

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(s.chestNumber, 32, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(s.candidateName, 55, y + 5);
    doc.text(houseMap.get(s.houseId) || s.houseId, 110, y + 5);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${s.totalMarks} / 100`, 150, y + 5);
    doc.text(s.grade, 172, y + 5);
    doc.text(`+${s.housePointsEarned}`, 186, y + 5);

    y += 9;
  });

  // Signatures
  const footY = Math.max(y + 20, 240);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footY + 15, 60, footY + 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Judge 1 Signature', 14, footY + 19);

  doc.line(75, footY + 15, 125, footY + 15);
  doc.text('Judge 2 Signature', 75, footY + 19);

  doc.line(140, footY + 15, 196, footY + 15);
  doc.text('Arts Fest Convener / Principal', 140, footY + 19);

  doc.save(`${program.code}_Official_Results_Certificate.pdf`);
};

// 7. PDF EXPORT: Full Festival Championship Digest & Analytics Report
export const exportConsolidatedFestReportPDF = (houses: House[], programs: Program[], results: Record<string, ProgramResult>) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Cover / Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(245, 158, 11);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNUAL INTER-HOUSE ARTS FESTIVAL', 14, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('KALAUTSAV 2026 - EXECUTIVE REPORT', 14, 21);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Consolidated Championship Standings, Event Turnout & Performance Analytics | ${new Date().toLocaleDateString()}`, 14, 29);

  // Section 1: House Championship Table
  let y = 48;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. House Championship Standings', 14, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Pos', 17, y + 5.5);
  doc.text('House Name', 27, y + 5.5);
  doc.text('Total Points', 70, y + 5.5);
  doc.text('1st', 95, y + 5.5);
  doc.text('2nd', 110, y + 5.5);
  doc.text('3rd', 125, y + 5.5);
  doc.text('A-Grades', 142, y + 5.5);
  doc.text('Captain', 165, y + 5.5);

  y += 8;
  const sortedHouses = [...houses].sort((a, b) => b.points - a.points);
  sortedHouses.forEach((h, idx) => {
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 7, 196, y + 7);

    doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(idx + 1), 17, y + 5);
    doc.text(h.name, 27, y + 5);
    
    doc.setFont('helvetica', 'bold');
    doc.text(String(h.points), 70, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(String(h.firstCount), 95, y + 5);
    doc.text(String(h.secondCount), 110, y + 5);
    doc.text(String(h.thirdCount), 125, y + 5);
    doc.text(String(h.gradeACount), 142, y + 5);
    doc.text(h.captain, 165, y + 5);

    y += 8;
  });

  // Section 2: Program Status & Participation Metrics
  y += 12;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Festival Event Completion Status', 14, y);

  y += 6;
  const announcedCount = programs.filter(p => results[p.id]?.isAnnounced).length;
  const totalPrograms = programs.length;
  const progressPct = Math.round((announcedCount / totalPrograms) * 100);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Competitions: ${totalPrograms} Events`, 18, y + 7);
  doc.text(`Announced & Ratified: ${announcedCount} Events (${progressPct}% Completed)`, 18, y + 13);
  doc.text(`Venues Active: 5 Stages`, 110, y + 7);
  doc.text(`Evaluation Protocol: Multi-Criteria Rubric (Automated Grading)`, 110, y + 13);

  // Section 3: Announced Results Summary
  y += 26;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Announced Results Summary (Toppers by Event)', 14, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Code & Program', 17, y + 5.5);
  doc.text('Winner (1st Place)', 85, y + 5.5);
  doc.text('House', 140, y + 5.5);
  doc.text('Marks', 175, y + 5.5);

  y += 8;
  const announcedPrograms = programs.filter(p => results[p.id]?.isAnnounced);
  announcedPrograms.forEach(p => {
    const res = results[p.id];
    const winner = res.scores?.find(s => s.rank === 1);
    const houseName = houses.find(h => h.id === winner?.houseId)?.name || winner?.houseId || '-';

    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 7, 196, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${p.code} ${p.title.slice(0, 28)}`, 17, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(winner ? `${winner.candidateName} (${winner.chestNumber})` : 'Under Consolidation', 85, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(houseName, 140, y + 5);
    doc.text(winner ? `${winner.totalMarks}/100` : '-', 175, y + 5);

    y += 8;
  });

  // Footer notes
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Report ratified by KalaUtsav Central Tabulation Committee and Principal Secretariat.', 14, 280);

  doc.save('KalaUtsav_Consolidated_Executive_Report.pdf');
};
