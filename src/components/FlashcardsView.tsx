import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Plus,
  Shuffle,
  CheckCircle2,
  X,
  Trash2,
  Brain,
  Zap,
  Quote,
  Lightbulb,
  Filter,
  Check,
  RotateCw,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { MOTIVATIONAL_QUOTES, MotivationalQuote } from '../data/motivationalQuotes';
import { FlashcardItem } from '../types';

export const FlashcardsView: React.FC = () => {
  const {
    flashcards,
    addFlashcard,
    toggleFlashcardLearned,
    deleteFlashcard,
    customTimetable,
  } = useAppStore();

  const [activeSubject, setActiveSubject] = useState<string>('All');
  const [selectedQuoteIdx, setSelectedQuoteIdx] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // New Flashcard Form
  const [newSubject, setNewSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('Physics');
  const [newTopic, setNewTopic] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newType, setNewType] = useState<'formula' | 'concept' | 'shortcut'>('formula');
  const [newExamTag, setNewExamTag] = useState('');

  // Auto Shuffle Quotes every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedQuoteIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const currentQuote: MotivationalQuote = MOTIVATIONAL_QUOTES[selectedQuoteIdx];

  const handleShuffleQuote = () => {
    let next = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    if (next === selectedQuoteIdx) next = (next + 1) % MOTIVATIONAL_QUOTES.length;
    setSelectedQuoteIdx(next);
  };

  const handleCardClick = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newFront.trim() || !newBack.trim()) return;

    const newCard: FlashcardItem = {
      id: `fc-custom-${Date.now()}`,
      subject: newSubject,
      topic: newTopic.trim(),
      front: newFront.trim(),
      back: newBack.trim(),
      type: newType,
      examTag: newExamTag.trim() || 'Custom Revision',
      isLearned: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    addFlashcard(newCard);
    setNewTopic('');
    setNewFront('');
    setNewBack('');
    setNewExamTag('');
    setShowAddModal(false);
  };

  // Auto Generate Formulas based on 1-month upcoming timetable
  const handleAutoGenerateFormulas = () => {
    const upcoming = customTimetable.slice(0, 3);
    const newGeneratedCards: FlashcardItem[] = [];

    upcoming.forEach((ev, idx) => {
      if (ev.subject.includes('Physics') || ev.subject.includes('CPM')) {
        newGeneratedCards.push({
          id: `fc-auto-p-${Date.now()}-${idx}`,
          subject: 'Physics',
          topic: ev.syllabus.split(';')[0] || 'Physics Mechanics',
          front: `Formula Sheet: ${ev.code} (${ev.syllabus.substring(0, 25)}...)`,
          back: `• Work-Energy Theorem: W_net = ΔK\n• Conservation of Momentum: P_initial = P_final\n• Center of Mass: X_cm = ∑(m_i x_i) / ∑m_i`,
          type: 'formula',
          examTag: ev.code,
          isLearned: false,
          createdAt: new Date().toISOString().split('T')[0],
        });
      }

      if (ev.subject.includes('Maths') || ev.subject.includes('CPM')) {
        newGeneratedCards.push({
          id: `fc-auto-m-${Date.now()}-${idx}`,
          subject: 'Mathematics',
          topic: ev.syllabus.split(';')[0] || 'Calculus & Algebra',
          front: `Key Shortcut: ${ev.code} Integration / Calculus`,
          back: `• Integration by Parts: ∫u dv = uv - ∫v du\n• Definite Integral Property: ∫[a to b] f(x)dx = ∫[a to b] f(a+b-x)dx`,
          type: 'shortcut',
          examTag: ev.code,
          isLearned: false,
          createdAt: new Date().toISOString().split('T')[0],
        });
      }

      if (ev.subject.includes('Chemistry') || ev.subject.includes('CPM')) {
        newGeneratedCards.push({
          id: `fc-auto-c-${Date.now()}-${idx}`,
          subject: 'Chemistry',
          topic: ev.syllabus.split(';')[0] || 'Physical Chemistry',
          front: `Formula Card: ${ev.code} Equilibrium & Kinetics`,
          back: `• Arrhenius Equation: k = A e^(-Ea / RT)\n• First Order Half Life: t_1/2 = 0.693 / k\n• pH calculation: pH = pKa + log([Salt]/[Acid])`,
          type: 'formula',
          examTag: ev.code,
          isLearned: false,
          createdAt: new Date().toISOString().split('T')[0],
        });
      }
    });

    if (newGeneratedCards.length > 0) {
      newGeneratedCards.forEach((c) => addFlashcard(c));
    }
  };

  const filteredCards = flashcards.filter(
    (c) => activeSubject === 'All' || c.subject === activeSubject
  );

  const learnedCount = flashcards.filter((c) => c.isLearned).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Quote Widget */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white relative overflow-hidden shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Quote className="w-32 h-32 text-indigo-400" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Daily Aspirant Motivation • Auto-Shuffling</span>
            </span>

            <button
              type="button"
              onClick={handleShuffleQuote}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-300" />
              <span>Shuffle Quote</span>
            </button>
          </div>

          <blockquote className="text-base sm:text-lg font-bold italic leading-relaxed text-slate-100 max-w-2xl">
            "{currentQuote.quote}"
          </blockquote>

          <div className="text-xs text-indigo-300 font-bold flex items-center gap-2">
            <span>— {currentQuote.author}</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-[10px] uppercase">
              {currentQuote.examTag}
            </span>
          </div>
        </div>
      </div>

      {/* Header Controls & Auto Generator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Formula & Flashcard Vault
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              {learnedCount}/{flashcards.length} Learned
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any card to flip and test your formula recall before tests
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoGenerateFormulas}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            title="Auto-generate formulas for upcoming 1-month Ashadeep exams"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Auto-AI Formulas</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'].map((subj) => (
          <button
            key={subj}
            type="button"
            onClick={() => setActiveSubject(subj)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubject === subj
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            No formula cards found for this subject. Click "Auto-AI Formulas" to generate them!
          </div>
        ) : (
          filteredCards.map((card) => {
            const isFlipped = flippedCards[card.id];

            return (
              <div
                key={card.id}
                className={`p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between min-h-[200px] ${
                  card.isLearned
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-500/50'
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] uppercase">
                      {card.subject}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {card.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlashcardLearned(card.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        card.isLearned
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                      }`}
                      title={card.isLearned ? 'Marked as Mastered' : 'Mark as Mastered'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFlashcard(card.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Area (Front or Back) */}
                <div className="my-auto py-2">
                  {!isFlipped ? (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                        Question / Concept
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                        {card.front}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                        Formula & Detail Solution
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                        {card.back}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Flip Prompt */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold">
                  <span>Exam Tag: {card.examTag || 'JEE/NEET'}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <span>{isFlipped ? 'View Front' : 'Flip for Solution'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Create Formula Memory Card
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Subject:</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Topic / Chapter:</label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Electrostatics / Integrals"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Front (Title / Question):</label>
                <input
                  type="text"
                  required
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. Gauss Law Electric Flux Formula"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Back (Formula / Solution):</label>
                <textarea
                  required
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. Φ = Q_enclosed / ε₀"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
