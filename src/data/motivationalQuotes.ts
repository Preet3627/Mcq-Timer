export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  examTag: 'JEE' | 'NEET' | 'General';
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    id: 'q1',
    quote: "Success in JEE/NEET isn't about being the smartest; it's about being the most disciplined and consistent every single day.",
    author: "IIT Bombay AIR 1 Advice",
    examTag: 'JEE',
  },
  {
    id: 'q2',
    quote: "An error in practice is a blessing in disguise—it shows you exactly where to improve before the final exam.",
    author: "AIIMS Topper Guidance",
    examTag: 'NEET',
  },
  {
    id: 'q3',
    quote: "Speed without accuracy is fatal in negative marking exams. Focus on precision first, speed will follow naturally.",
    author: "QTickX Exam Strategy",
    examTag: 'General',
  },
  {
    id: 'q4',
    quote: "Every 3-minute question solved correctly in practice adds +4 marks to your dream college rank.",
    author: "Sankalp Batch Mentor",
    examTag: 'JEE',
  },
  {
    id: 'q5',
    quote: "NCERT is your Bible for Chemistry and Biology. Master every line, every graph, and every exercise.",
    author: "NEET 720/720 Strategy",
    examTag: 'NEET',
  },
  {
    id: 'q6',
    quote: "Don't measure progress by hours spent at the table, measure it by concepts mastered and speed improved.",
    author: "Ashadeep Faculty",
    examTag: 'General',
  },
  {
    id: 'q7',
    quote: "Patience and continuous problem solving turn difficult physics numericals into effortless scores.",
    author: "IPhO Gold Medalist",
    examTag: 'JEE',
  },
  {
    id: 'q8',
    quote: "Your mock test score is not your destination; it is your diagnostic map pointing to your next breakthrough.",
    author: "QTickX Analytics",
    examTag: 'General',
  }
];
