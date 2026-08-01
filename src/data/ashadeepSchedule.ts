import { AshadeepExamEvent } from '../types';

export interface ChapterProgress {
  chNo: string;
  name: string;
  lecBoard: number;
  boardEndDate: string;
  jeeEndDate: string;
  lecJee: number;
}

export const ASHADEEP_PASSWORD = import.meta.env.VITE_ASHADEEP_PASSWORD || 'Ashadeep@2026';

export const ASHADEEP_HEADER = {
  title: 'ASHADEEP JEE | NEET | FOUNDATION LEGACY OF EXCELLENCE',
  subtitle: 'Rank bhi... Selection bhi...',
  year: '2026-27 (ENGLISH-GUJARATI MEDIUM)',
  batch: 'Sankalp Batch (12 Science Aspirants)',
  mission: 'MISSION 1000 IITians, NITians & IIITians',
  totalLectures: 841,
  physicsLectures: 261,
  mathsLectures: 320,
  chemLectures: 260,
  totalExams: 155,
  kotaTests: 12,
  weeklyTests: 58,
  unitTests: 30,
  aitsTests: 20,
  fstTests: 18,
};

export const PHYSICS_CHAPTERS: ChapterProgress[] = [
  { chNo: '01', name: 'Electric charges & Fields', lecBoard: 19, boardEndDate: '2026-04-17', jeeEndDate: '2026-04-22', lecJee: 12 },
  { chNo: '02', name: 'Electrostatic potential & Capacitance', lecBoard: 13, boardEndDate: '2026-05-06', jeeEndDate: '2026-05-12', lecJee: 13 },
  { chNo: '03', name: 'Current Electricity', lecBoard: 13, boardEndDate: '2026-06-03', jeeEndDate: '2026-06-19', lecJee: 16 },
  { chNo: '04', name: 'Moving charges & Magnetism', lecBoard: 12, boardEndDate: '2026-06-19', jeeEndDate: '2026-07-03', lecJee: 8 },
  { chNo: '05', name: 'Magnetism and Matter', lecBoard: 8, boardEndDate: '2026-07-01', jeeEndDate: '2026-07-15', lecJee: 6 },
  { chNo: '06', name: 'EM Induction', lecBoard: 10, boardEndDate: '2026-07-18', jeeEndDate: '2026-07-24', lecJee: 6 },
  { chNo: '07', name: 'Alternating Current', lecBoard: 9, boardEndDate: '2026-07-28', jeeEndDate: '2026-08-01', lecJee: 5 },
  { chNo: '08', name: 'EM waves', lecBoard: 5, boardEndDate: '2026-08-04', jeeEndDate: '2026-08-08', lecJee: 4 },
  { chNo: '09', name: 'Ray optics & Optical Instruments', lecBoard: 19, boardEndDate: '2026-09-02', jeeEndDate: '2026-09-12', lecJee: 18 },
  { chNo: '10', name: 'Wave optics', lecBoard: 9, boardEndDate: '2026-09-17', jeeEndDate: '2026-09-26', lecJee: 8 },
  { chNo: '14', name: 'Semiconductor Electronics', lecBoard: 10, boardEndDate: '2026-10-02', jeeEndDate: '2026-10-09', lecJee: 7 },
  { chNo: '11', name: 'Dual Nature of Radiation & Matter', lecBoard: 7, boardEndDate: '2026-10-13', jeeEndDate: '2026-10-15', lecJee: 4 },
  { chNo: '12', name: 'Atoms', lecBoard: 6, boardEndDate: '2026-10-19', jeeEndDate: '2026-10-22', lecJee: 4 },
  { chNo: '13', name: 'Nuclei', lecBoard: 6, boardEndDate: '2026-10-27', jeeEndDate: '2026-10-27', lecJee: 4 },
];

export const MATHS_CHAPTERS: ChapterProgress[] = [
  { chNo: '01', name: 'Relation & Function', lecBoard: 16, boardEndDate: '2026-04-07', jeeEndDate: '2026-04-30', lecJee: 16 },
  { chNo: '02', name: 'Inverse Trigonometric Function', lecBoard: 10, boardEndDate: '2026-04-16', jeeEndDate: '2026-05-13', lecJee: 7 },
  { chNo: '03', name: 'Matrices', lecBoard: 11, boardEndDate: '2026-04-28', jeeEndDate: '2026-06-05', lecJee: 7 },
  { chNo: '04', name: 'Determinants', lecBoard: 16, boardEndDate: '2026-05-13', jeeEndDate: '2026-06-17', lecJee: 5 },
  { chNo: '11-Lim', name: 'Limits (Std-11)', lecBoard: 0, boardEndDate: '2026-07-02', jeeEndDate: '2026-07-02', lecJee: 9 },
  { chNo: '05', name: 'Continuity & Differentiability', lecBoard: 20, boardEndDate: '2026-06-12', jeeEndDate: '2026-07-25', lecJee: 14 },
  { chNo: '06', name: 'Application of Derivatives', lecBoard: 26, boardEndDate: '2026-07-09', jeeEndDate: '2026-08-13', lecJee: 9 },
  { chNo: '07', name: 'Indefinite Integration', lecBoard: 38, boardEndDate: '2026-08-17', jeeEndDate: '2026-08-31', lecJee: 8 },
  { chNo: '07-Def', name: 'Definite Integration', lecBoard: 0, boardEndDate: '2026-09-12', jeeEndDate: '2026-09-12', lecJee: 7 },
  { chNo: '08', name: 'Application of Integrals', lecBoard: 5, boardEndDate: '2026-08-21', jeeEndDate: '2026-09-19', lecJee: 4 },
  { chNo: '09', name: 'Differential Equations', lecBoard: 16, boardEndDate: '2026-09-10', jeeEndDate: '2026-10-03', lecJee: 7 },
  { chNo: '10', name: 'Vector Algebra', lecBoard: 12, boardEndDate: '2026-09-22', jeeEndDate: '2026-10-16', lecJee: 7 },
  { chNo: '11', name: '3D Geometry', lecBoard: 10, boardEndDate: '2026-10-02', jeeEndDate: '2026-10-23', lecJee: 5 },
  { chNo: '12', name: 'Linear Programming', lecBoard: 5, boardEndDate: '2026-10-08', jeeEndDate: '2026-10-08', lecJee: 0 },
  { chNo: '13', name: 'Probability', lecBoard: 21, boardEndDate: '2026-10-27', jeeEndDate: '2026-10-27', lecJee: 7 },
];

export const CHEM_CHAPTERS: ChapterProgress[] = [
  { chNo: '01', name: 'Solutions', lecBoard: 19, boardEndDate: '2026-04-17', jeeEndDate: '2026-04-22', lecJee: 9 },
  { chNo: '02', name: 'Electrochemistry', lecBoard: 18, boardEndDate: '2026-05-08', jeeEndDate: '2026-05-13', lecJee: 13 },
  { chNo: '06', name: 'Haloalkanes & Haloarenes', lecBoard: 15, boardEndDate: '2026-06-12', jeeEndDate: '2026-06-16', lecJee: 13 },
  { chNo: '07', name: 'Alcohols, Phenols & Ethers', lecBoard: 16, boardEndDate: '2026-07-04', jeeEndDate: '2026-07-09', lecJee: 14 },
  { chNo: '03', name: 'Chemical Kinetics', lecBoard: 17, boardEndDate: '2026-07-29', jeeEndDate: '2026-07-30', lecJee: 12 },
  { chNo: '08', name: 'Aldehydes, Ketones & Carboxylic Acids', lecBoard: 16, boardEndDate: '2026-08-21', jeeEndDate: '2026-08-25', lecJee: 16 },
  { chNo: '04', name: 'd and f-Block Elements', lecBoard: 11, boardEndDate: '2026-09-09', jeeEndDate: '2026-09-09', lecJee: 7 },
  { chNo: '05', name: 'Coordination Compounds', lecBoard: 12, boardEndDate: '2026-09-23', jeeEndDate: '2026-09-24', lecJee: 9 },
  { chNo: '09', name: 'Amine Compounds', lecBoard: 10, boardEndDate: '2026-10-10', jeeEndDate: '2026-10-13', lecJee: 8 },
  { chNo: '10', name: 'Biomolecules', lecBoard: 9, boardEndDate: '2026-10-24', jeeEndDate: '2026-10-24', lecJee: 6 },
  { chNo: '12', name: 'Practical Chemistry', lecBoard: 0, boardEndDate: '2026-10-27', jeeEndDate: '2026-10-27', lecJee: 3 },
  { chNo: '11', name: 'The p-Block Elements', lecBoard: 0, boardEndDate: '2026-10-27', jeeEndDate: '2026-10-27', lecJee: 7 },
];

export const OFFICIAL_ASHADEEP_EXAM_SCHEDULE: AshadeepExamEvent[] = [
  // JMWT 01 - 13
  { id: 'ash-01', code: 'JMWT-01', type: 'Weekly Test', subject: 'Maths', syllabus: '05. Complex Number (Std-11)', date: '2026-04-07', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-02', code: 'JMWT-02', type: 'Weekly Test', subject: 'Physics', syllabus: '09. Fluid Mechanics (Std-11)', date: '2026-04-09', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-03', code: 'JMWT-03', type: 'Weekly Test', subject: 'Chemistry', syllabus: '05. Thermodynamics (Std-11)', date: '2026-04-14', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-04', code: 'JMWT-04', type: 'Weekly Test', subject: 'Maths', syllabus: '11. Conic Sections (Std-11)', date: '2026-04-16', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-05', code: 'JMKOTA-01', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-01 to JMWT-04 Full Cumulative Review', date: '2026-04-19', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-06', code: 'JMWT-05', type: 'Weekly Test', subject: 'Physics', syllabus: '13. Oscillations (Std-11)', date: '2026-04-21', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-07', code: 'JMWT-06', type: 'Weekly Test', subject: 'Chemistry', syllabus: '09. Hydrocarbons (Std-11)', date: '2026-04-23', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-08', code: 'JMWT-07', type: 'Weekly Test', subject: 'Maths', syllabus: '10. Straight lines (Std-11)', date: '2026-04-28', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-09', code: 'JMWT-08', type: 'Weekly Test', subject: 'Physics', syllabus: '14. Waves (Std-11)', date: '2026-04-30', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-10', code: 'JMKOTA-02', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-05 to JMWT-08', date: '2026-05-03', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-11', code: 'JMWT-09', type: 'Weekly Test', subject: 'Chemistry', syllabus: '01. Solutions (Std-12)', date: '2026-05-05', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-12', code: 'JMWT-10', type: 'Weekly Test', subject: 'Physics', syllabus: '01. Electric Charges and Field (Std-12)', date: '2026-05-07', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-13', code: 'JMWT-11', type: 'Weekly Test', subject: 'Maths', syllabus: '01. Relation & Function (Std-12)', date: '2026-05-12', startTime: '09:00', endTime: '10:30' },
  
  // Post Summer Vacation
  { id: 'ash-14', code: 'JMWT-12', type: 'Weekly Test', subject: 'Chemistry', syllabus: '02. Electrochemistry (Std-12)', date: '2026-05-26', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-15', code: 'JMWT-13', type: 'Weekly Test', subject: 'Maths', syllabus: '02. Inverse Trigonometric Function (Std-12)', date: '2026-05-28', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-16', code: 'JMKOTA-03', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-09 to JMWT-13', date: '2026-05-31', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-17', code: 'JMWT-14', type: 'Weekly Test', subject: 'Physics', syllabus: '02. Electrostatic potential and capacitance (Std-12)', date: '2026-06-02', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-18', code: 'JMWT-15', type: 'Weekly Test', subject: 'Chemistry', syllabus: '02. Structure of Atom (Std-11)', date: '2026-06-04', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-19', code: 'JMWT-16', type: 'Weekly Test', subject: 'Maths', syllabus: '04. Complex Number & Quadratic (Std-11)', date: '2026-06-09', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-20', code: 'JMWT-17', type: 'Weekly Test', subject: 'Physics', syllabus: '12. Kinetic Theory of Gases (Std-11)', date: '2026-06-11', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-21', code: 'JMKOTA-04', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-14 to JMWT-17', date: '2026-06-14', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-22', code: 'JMWT-18', type: 'Weekly Test', subject: 'Chemistry', syllabus: '04. Chemical Bonding & Molecular Structure (Std-11)', date: '2026-06-16', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-23', code: 'JMWT-19', type: 'Weekly Test', subject: 'Maths', syllabus: '03. Matrices (Std-12)', date: '2026-06-18', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-24', code: 'JMWT-20', type: 'Weekly Test', subject: 'Physics', syllabus: '11. Thermodynamics (Std-11)', date: '2026-06-23', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-25', code: 'JMWT-21', type: 'Weekly Test', subject: 'Chemistry', syllabus: '06. Haloalkanes and Haloarenes (Std-12)', date: '2026-06-25', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-26', code: 'JMKOTA-05', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-18 to JMWT-21', date: '2026-06-28', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-27', code: 'JMWT-22', type: 'Weekly Test', subject: 'Maths', syllabus: '04. Determinants (Std-12)', date: '2026-06-30', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-28', code: 'JMWT-23', type: 'Weekly Test', subject: 'Physics', syllabus: '05. Work, Energy & Power (Std-11)', date: '2026-07-02', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-29', code: 'JMWT-24', type: 'Weekly Test', subject: 'Chemistry', syllabus: '08. G.O.C (Std-11)', date: '2026-07-07', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-30', code: 'JMWT-25', type: 'Weekly Test', subject: 'Physics', syllabus: '03. Current Electricity (Std-12)', date: '2026-07-09', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-31', code: 'JMKOTA-06', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-22 to JMWT-25', date: '2026-07-12', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-32', code: 'JMWT-26', type: 'Weekly Test', subject: 'Maths', syllabus: '12. Limit (Std-11)', date: '2026-07-14', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-33', code: 'JMWT-27', type: 'Weekly Test', subject: 'Chemistry', syllabus: '07. Alcohols, Phenols and Ethers (Std-12)', date: '2026-07-16', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-34', code: 'JMWT-28', type: 'Weekly Test', subject: 'Physics', syllabus: '04. Moving charges & Magnetism (Std-12)', date: '2026-07-21', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-35', code: 'JMWT-29', type: 'Weekly Test', subject: 'Maths', syllabus: '05. Continuity & Differentiability (Std-12)', date: '2026-07-23', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-36', code: 'JMKOTA-07', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-26 to JMWT-29', date: '2026-07-26', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-37', code: 'JMWT-30', type: 'Weekly Test', subject: 'Physics', syllabus: '05. Magnetism and Matter (Std-12)', date: '2026-07-28', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-38', code: 'JMWT-31', type: 'Weekly Test', subject: 'Chemistry', syllabus: '06. Equilibrium & 07. Redox reactions (Std-11)', date: '2026-07-30', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-39', code: 'JMWT-32', type: 'Weekly Test', subject: 'Maths', syllabus: '05. Method of Differentiation (Std-12)', date: '2026-08-04', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-40', code: 'JMWT-33', type: 'Weekly Test', subject: 'Physics', syllabus: '06. Electromagnetic Induction (Std-12)', date: '2026-08-06', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-41', code: 'JMKOTA-08', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-30 to JMWT-33', date: '2026-08-09', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-42', code: 'JMWT-34', type: 'Weekly Test', subject: 'Physics', syllabus: '07. Alternating Current (Std-12)', date: '2026-08-11', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-43', code: 'JMWT-35', type: 'Weekly Test', subject: 'Chemistry', syllabus: '03. Chemical Kinetics (Std-12)', date: '2026-08-13', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-44', code: 'JMWT-36', type: 'Weekly Test', subject: 'Physics', syllabus: '06. Systems of Particles & Rotational Motion (Std-11)', date: '2026-08-18', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-45', code: 'JMWT-37', type: 'Weekly Test', subject: 'Maths', syllabus: '06. Application Of Derivatives (Std-12)', date: '2026-08-20', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-46', code: 'JMKOTA-09', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-34 to JMWT-37', date: '2026-08-23', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-47', code: 'JMWT-38', type: 'Weekly Test', subject: 'Physics', syllabus: '08. Electromagnetic waves (Std-12)', date: '2026-08-25', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-48', code: 'JMWT-39', type: 'Weekly Test', subject: 'Maths', syllabus: '08. Sequences & Series, 09. Straight Lines (Std-11)', date: '2026-08-27', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-49', code: 'JMWT-40', type: 'Weekly Test', subject: 'Physics', syllabus: '04. Laws of Motion, 07. Gravitation (Std-11)', date: '2026-09-01', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-50', code: 'JMWT-41', type: 'Weekly Test', subject: 'Maths', syllabus: '06. Permutations & Comb., 07. Binomial Theorem (Std-11)', date: '2026-09-03', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-51', code: 'JMWT-42', type: 'Weekly Test', subject: 'Chemistry', syllabus: '08. Aldehydes, Ketones and Carboxylic Acid (Std-12)', date: '2026-09-08', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-52', code: 'JMWT-43', type: 'Weekly Test', subject: 'Maths', syllabus: '07. Indefinite Integration (Std-12)', date: '2026-09-10', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-53', code: 'JMKOTA-10', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-38 to JMWT-43', date: '2026-09-13', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-54', code: 'JMWT-44', type: 'Weekly Test', subject: 'Physics', syllabus: '02. Motion in Straight Line, 03. Motion in Plane (Std-11)', date: '2026-09-15', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-55', code: 'JMWT-45', type: 'Weekly Test', subject: 'Chemistry', syllabus: '04. The d and f-Block Elements (Std-12)', date: '2026-09-17', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-56', code: 'JMWT-46', type: 'Weekly Test', subject: 'Maths', syllabus: '07. Definite Integration (Std-12)', date: '2026-09-22', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-57', code: 'JMWT-47', type: 'Weekly Test', subject: 'Physics', syllabus: '09. Ray optics & optical instruments (Std-12)', date: '2026-09-24', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-58', code: 'JMKOTA-11', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-44 to JMWT-47', date: '2026-09-27', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-59', code: 'JMWT-48', type: 'Weekly Test', subject: 'Maths', syllabus: '08. Application of Integral (Std-12)', date: '2026-09-29', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-60', code: 'JMWT-49', type: 'Weekly Test', subject: 'Chemistry', syllabus: '05. Complex Compounds (Std-12)', date: '2026-10-01', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-61', code: 'JMWT-50', type: 'Weekly Test', subject: 'Physics', syllabus: '10. Wave optics (Std-12)', date: '2026-10-06', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-62', code: 'JMWT-51', type: 'Weekly Test', subject: 'Maths', syllabus: '09. Differential Equation (Std-12)', date: '2026-10-08', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-63', code: 'JMKOTA-12', type: 'Kota Test', subject: 'CPM', syllabus: 'JMWT-48 to JMWT-51', date: '2026-10-11', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-64', code: 'JMWT-52', type: 'Weekly Test', subject: 'Physics', syllabus: '14. Semiconductor Electronics (Std-12)', date: '2026-10-13', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-65', code: 'JMWT-53', type: 'Weekly Test', subject: 'Maths', syllabus: '10. Vector Algebra (Std-12)', date: '2026-10-15', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-66', code: 'JMWT-54', type: 'Weekly Test', subject: 'Chemistry', syllabus: '09. Amine Compounds (Std-12)', date: '2026-10-17', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-67', code: 'JMWT-55', type: 'Weekly Test', subject: 'Maths', syllabus: '11. 3D Geometry, 06. Application of Derivatives (Std-12)', date: '2026-10-19', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-68', code: 'JMWT-56', type: 'Weekly Test', subject: 'Physics', syllabus: '11. Dual Nature of Radiation and Matter (Std-12)', date: '2026-10-23', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-69', code: 'JMWT-57', type: 'Weekly Test', subject: 'Maths', syllabus: '12. Linear Programming & 07. Integration (Std-12)', date: '2026-10-24', startTime: '09:00', endTime: '10:30' },
  { id: 'ash-70', code: 'JMWT-58', type: 'Weekly Test', subject: 'Chemistry', syllabus: '10. Biomolecules (Std-12)', date: '2026-10-26', startTime: '09:00', endTime: '10:30' },

  // Revision Round Tests (JMUT-01 to JMUT-30)
  { id: 'ash-rrt-01', code: 'JMUT-01', type: 'Unit Test / RRT', subject: 'Chemistry', syllabus: '1. Basic Concepts of Chemistry, 7. Redox Reactions', date: '2026-11-19', startTime: '09:00', endTime: '11:00' },
  { id: 'ash-rrt-02', code: 'JMUT-02', type: 'Unit Test / RRT', subject: 'Physics', syllabus: '1. Units & Measurement, 2. Motion in Straight Line/Plane', date: '2026-11-20', startTime: '09:00', endTime: '11:00' },
  { id: 'ash-rrt-03', code: 'JMUT-03', type: 'Unit Test / RRT', subject: 'Maths', syllabus: 'Basic Maths, 3. Trigonometric Functions, 13. Statistics', date: '2026-11-21', startTime: '09:00', endTime: '11:00' },
  { id: 'ash-aits-01', code: 'AITS-01', type: 'AITS', subject: 'CPM', syllabus: 'JMUT-01 to JMUT-03 Cumulative Class 11 Review', date: '2026-11-23', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-rrt-04', code: 'JMUT-04', type: 'Unit Test / RRT', subject: 'Chemistry', syllabus: '2. Structure of Atom, 3. Periodic Table', date: '2026-11-24', startTime: '09:00', endTime: '11:00' },
  { id: 'ash-rrt-05', code: 'JMUT-05', type: 'Unit Test / RRT', subject: 'Physics', syllabus: '4. Laws of Motion, 5. Work Energy & Power', date: '2026-11-25', startTime: '09:00', endTime: '11:00' },
  { id: 'ash-rrt-06', code: 'JMUT-06', type: 'Unit Test / RRT', subject: 'Maths', syllabus: '8. Sequence & Series, Quadratic Equations', date: '2026-11-26', startTime: '09:00', endTime: '11:00' },
  { id: 'ash-aits-02', code: 'AITS-02', type: 'AITS', subject: 'CPM', syllabus: 'JMUT-04 to JMUT-06 Class 11 Review', date: '2026-11-27', startTime: '09:00', endTime: '12:00' },
  
  // AITS & FSTs
  { id: 'ash-aits-03', code: 'AITS-03', type: 'AITS', subject: 'CPM', syllabus: 'JMUT-07 to JMUT-09 Class 11 Review', date: '2026-12-01', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-aits-11', code: 'AITS-11', type: 'AITS', subject: 'CPM', syllabus: 'Full Syllabus Mock Test 1', date: '2027-01-03', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-aits-20', code: 'AITS-20', type: 'AITS', subject: 'CPM', syllabus: 'Full Syllabus Grand Final Mock', date: '2027-01-21', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-fst-01', code: 'FST-01', type: 'Full Test', subject: 'Chemistry', syllabus: 'Full Chemistry Syllabus Paper 1', date: '2027-02-01', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-fst-02', code: 'FST-02', type: 'Full Test', subject: 'Maths', syllabus: 'Full Mathematics Syllabus Paper 1', date: '2027-02-03', startTime: '09:00', endTime: '12:00' },
  { id: 'ash-fst-03', code: 'FST-03', type: 'Full Test', subject: 'Physics', syllabus: 'Full Physics Syllabus Paper 1', date: '2027-02-05', startTime: '09:00', endTime: '12:00' },
];

export function getOriginalAshadeepTimetable(): AshadeepExamEvent[] {
  return JSON.parse(JSON.stringify(OFFICIAL_ASHADEEP_EXAM_SCHEDULE));
}
