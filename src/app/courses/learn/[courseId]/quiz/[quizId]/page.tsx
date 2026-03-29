'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Flag,
  AlertCircle,
  Trophy,
  RotateCcw,
  Home,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'text_answer';
  question: string;
  options?: string[];
  correctAnswer?: number | boolean;
  explanation?: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number;
  allowRetakes: boolean;
  showCorrectAnswers: boolean;
  questions: Question[];
}

// Mock quiz data
const quizData: Quiz = {
  id: 'q1',
  title: 'Module 1: Fundamentals Quiz',
  description: 'Test your understanding of basic weaving concepts and terminology.',
  timeLimit: 15,
  passingScore: 70,
  allowRetakes: true,
  showCorrectAnswers: true,
  questions: [
    {
      id: '1',
      type: 'multiple_choice',
      question: 'What is the traditional Navajo name for the weaving loom?',
      options: ['Ts\'idiil', 'Naa\'ada', 'Be\'ésh', 'Tł\'ó'],
      correctAnswer: 0,
      explanation: 'Ts\'idiil is the traditional Navajo word for the vertical loom used in weaving.',
      points: 10
    },
    {
      id: '2',
      type: 'true_false',
      question: 'The warp threads run horizontally on the loom.',
      correctAnswer: false,
      explanation: 'Warp threads run vertically on the loom. Weft threads run horizontally.',
      points: 10
    },
    {
      id: '3',
      type: 'multiple_choice',
      question: 'Which natural material is traditionally used for the cream/white color in Navajo rugs?',
      options: ['Onion skin', 'Walnut hulls', 'Un-dyed wool', 'Clay'],
      correctAnswer: 2,
      explanation: 'Traditional Navajo weavers use un-dyed, natural white wool for cream colors.',
      points: 10
    },
    {
      id: '4',
      type: 'text_answer',
      question: 'Name the three main types of traditional Navajo rug patterns.',
      explanation: 'The three main types are: Geometric, Pictorial, and Landscape/Optical.',
      points: 20
    },
    {
      id: '5',
      type: 'multiple_choice',
      question: 'What does the term "Saddle Blanket" refer to in Navajo weaving?',
      options: [
        'A blanket used under horse saddles',
        'A small decorative piece',
        'A type of knot',
        'The first weaving a student makes'
      ],
      correctAnswer: 0,
      explanation: 'Saddle blankets were traditionally woven to be placed under horse saddles for comfort and decoration.',
      points: 10
    }
  ]
};

export default function QuizPage() {
  const params = useParams<{ courseId: string; quizId: string }>();
  const courseId = String(params?.courseId || '');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | boolean | string>>({});
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit * 60);
  const [quizState, setQuizState] = useState<'taking' | 'reviewing' | 'completed'>('taking');
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalPoints = quizData.questions.reduce((sum, q) => sum + q.points, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (quizState !== 'taking') return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: number | boolean | string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < quizData.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const submitQuiz = () => {
    let calculatedScore = 0;
    quizData.questions.forEach(q => {
      const answer = answers[q.id];
      if (q.type === 'multiple_choice' && answer === q.correctAnswer) {
        calculatedScore += q.points;
      } else if (q.type === 'true_false' && answer === q.correctAnswer) {
        calculatedScore += q.points;
      } else if (q.type === 'text_answer' && typeof answer === 'string' && answer.trim()) {
        // Text answers need manual review - give partial credit for now
        calculatedScore += q.points * 0.5;
      }
    });
    setScore(calculatedScore);
    setQuizState('completed');
  };

  const isPassed = (score / totalPoints) * 100 >= quizData.passingScore;

  // Quiz Completed View
  if (quizState === 'completed') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-8">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isPassed ? 'bg-green-500/20' : 'bg-[#DC143C]/20'
            }`}>
              {isPassed ? (
                <Trophy size={40} className="text-green-500" />
              ) : (
                <AlertCircle size={40} className="text-[#DC143C]" />
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {isPassed ? 'Congratulations!' : 'Quiz Not Passed'}
            </h1>
            <p className="text-gray-400 mb-6">
              {isPassed 
                ? 'You have successfully completed the quiz.' 
                : `You need ${quizData.passingScore}% to pass. Keep learning and try again!`}
            </p>

            <div className="bg-[#0a0a0a] rounded-xl p-6 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#d4af37]">{score}</p>
                  <p className="text-sm text-gray-400">Points Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{totalPoints}</p>
                  <p className="text-sm text-gray-400">Total Points</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${isPassed ? 'text-green-500' : 'text-[#DC143C]'}`}>
                    {Math.round((score / totalPoints) * 100)}%
                  </p>
                  <p className="text-sm text-gray-400">Score</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {quizData.showCorrectAnswers && (
                <button 
                  onClick={() => setQuizState('reviewing')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/20 transition-colors"
                >
                  <BookOpen size={18} />
                  Review Answers
                </button>
              )}
              {!isPassed && quizData.allowRetakes && (
                <button 
                  onClick={() => {
                    setQuizState('taking');
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setTimeRemaining(quizData.timeLimit * 60);
                    setScore(0);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-[#141414] border border-[#d4af37]/30 text-gray-300 rounded-lg hover:border-[#d4af37] transition-colors"
                >
                  <RotateCcw size={18} />
                  Retake Quiz
                </button>
              )}
              <Link 
                href={`/courses/learn/${courseId}`}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
              >
                <Home size={18} />
                Back to Course
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold">{quizData.title}</h1>
            <p className="text-gray-400 text-sm">{quizData.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 60 ? 'bg-[#DC143C]/20 text-[#DC143C]' : 'bg-[#0a0a0a] text-gray-300'
            }`}>
              <Clock size={18} />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
            <button 
              onClick={() => submitQuiz()}
              className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all text-sm"
            >
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-[#141414] border-b border-[#d4af37]/10">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
            <span className="text-sm text-gray-400">{answeredCount} answered</span>
          </div>
          <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-6">
          {/* Question Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <span className="text-sm text-[#d4af37] mb-2 block">Question {currentQuestionIndex + 1}</span>
              <h2 className="text-xl text-white font-medium">{currentQuestion.question}</h2>
              <span className="text-sm text-gray-500 mt-2 block">{currentQuestion.points} points</span>
            </div>
            <button 
              onClick={() => toggleFlag(currentQuestion.id)}
              className={`p-2 rounded-lg transition-colors ${
                flaggedQuestions.includes(currentQuestion.id)
                  ? 'bg-[#DC143C]/20 text-[#DC143C]'
                  : 'text-gray-400 hover:text-[#DC143C]'
              }`}
            >
              <Flag size={20} className={flaggedQuestions.includes(currentQuestion.id) ? 'fill-[#DC143C]' : ''} />
            </button>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  answers[currentQuestion.id] === index
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-[#d4af37]/20 hover:border-[#d4af37]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion.id] === index
                      ? 'border-[#d4af37]'
                      : 'border-gray-500'
                  }`}>
                    {answers[currentQuestion.id] === index && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                    )}
                  </div>
                  <span className="text-white">{option}</span>
                </div>
              </button>
            ))}

            {currentQuestion.type === 'true_false' && (
              <div className="flex gap-4">
                {[true, false].map((value) => (
                  <button
                    key={value.toString()}
                    onClick={() => handleAnswer(value)}
                    className={`flex-1 p-4 rounded-lg border transition-all ${
                      answers[currentQuestion.id] === value
                        ? 'border-[#d4af37] bg-[#d4af37]/10'
                        : 'border-[#d4af37]/20 hover:border-[#d4af37]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === value
                          ? 'border-[#d4af37]'
                          : 'border-gray-500'
                      }`}>
                        {answers[currentQuestion.id] === value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                        )}
                      </div>
                      <span className="text-white">{value ? 'True' : 'False'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'text_answer' && (
              <textarea
                value={typeof answers[currentQuestion.id] === 'string' ? answers[currentQuestion.id] as string : ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#d4af37]/10">
            <button
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            <div className="flex gap-2">
              {quizData.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-[#d4af37] text-black'
                      : answers[quizData.questions[index].id] !== undefined
                        ? 'bg-[#d4af37]/20 text-[#d4af37]'
                        : flaggedQuestions.includes(quizData.questions[index].id)
                          ? 'bg-[#DC143C]/20 text-[#DC143C]'
                          : 'bg-[#0a0a0a] text-gray-500 hover:text-white'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => goToQuestion(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === quizData.questions.length - 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
