import React from 'react';
import { useRestaurant, QUIZ_QUESTIONS } from '../../context/RestaurantContext';

export default function WaitHub() {
  const { state, copiedWifi, setCopiedWifi, quiz, setQuiz } = useRestaurant();

  const points = state.loyalty || 0;
  const goal = 200;
  const progressPercent = Math.min(100, Math.round((points / goal) * 100));

  const handleCopyWifi = () => {
    try {
      navigator.clipboard.writeText('zaika2026').then(
        () => {
          setCopiedWifi('ok');
          setTimeout(() => setCopiedWifi(null), 2500);
        },
        () => {
          setCopiedWifi('fail');
          setTimeout(() => setCopiedWifi(null), 3000);
        }
      );
    } catch (e) {
      setCopiedWifi('fail');
      setTimeout(() => setCopiedWifi(null), 3000);
    }
  };

  const handleQuizPick = (optionIndex) => {
    if (quiz.pick !== null || quiz.done) return;

    const currentQuestion = QUIZ_QUESTIONS[quiz.i];
    const isCorrect = optionIndex === currentQuestion.a;
    const nextScores = [...quiz.s];
    if (isCorrect) {
      nextScores[quiz.turn] += 1;
    }

    setQuiz({ ...quiz, pick: optionIndex, s: nextScores });

    setTimeout(() => {
      if (quiz.i >= QUIZ_QUESTIONS.length - 1) {
        setQuiz((prev) => ({ ...prev, done: true }));
      } else {
        setQuiz((prev) => ({
          ...prev,
          i: prev.i + 1,
          turn: 1 - prev.turn,
          pick: null,
        }));
      }
    }, 1100);
  };

  const resetQuiz = () => {
    setQuiz({ i: 0, s: [0, 0], turn: 0, pick: null, done: false });
  };

  const currentQ = QUIZ_QUESTIONS[quiz.i];

  return (
    <div className="flex flex-col gap-4">
      {/* 1. One-Tap Wi-Fi */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-4 shadow-sm">
        <h3 className="font-extrabold text-sm mb-3 flex items-center gap-1.5">
          <span>📶</span> One-tap Wi-Fi
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFF1EB] text-2xl flex items-center justify-center">
            📶
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-[#6B655E] block">Network</span>
            <code className="font-mono font-bold text-xs text-[#1A1A1A]">Zaika_Guest</code>
            <span className="text-[11px] text-[#6B655E] block mt-1">Password</span>
            <code className="font-mono font-bold text-xs text-[#1A1A1A]">zaika2026</code>
          </div>
          <button
            onClick={handleCopyWifi}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              copiedWifi === 'ok'
                ? 'bg-[#22C55E] text-white'
                : 'bg-[#1A1A1A] hover:bg-[#333] text-white'
            }`}
          >
            {copiedWifi === 'ok' ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        {copiedWifi === 'fail' && (
          <p className="text-xs text-[#6B655E] mt-2">
            Clipboard copy unavailable. Please enter the password shown above.
          </p>
        )}
      </div>

      {/* 2. Loyalty Rewards */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-4 shadow-sm">
        <h3 className="font-extrabold text-sm mb-2 flex items-center gap-1.5">
          <span>🎁</span> Loyalty Rewards
        </h3>
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#6B655E]">Earn 1 point per ₹10 spent</span>
          <b className="font-extrabold text-[#1A1A1A]">
            {points} / {goal} pts
          </b>
        </div>
        <div className="h-2.5 rounded-full bg-[#EEE9E2] overflow-hidden my-2.5">
          <div
            className="h-full bg-gradient-to-r from-[#F25C2A] to-[#ffa066] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-[#6B655E]">
          {points >= goal ? (
            <span className="text-[#15803D] font-bold">🎉 Free Mango Lassi unlocked!</span>
          ) : (
            <>
              {goal - points} points to a <b className="text-[#1A1A1A]">free Mango Lassi</b>
            </>
          )}
        </p>
      </div>

      {/* 3. Spice Quiz (Aman vs Riya) */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-4 shadow-sm">
        <h3 className="font-extrabold text-sm mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>🌶️</span> Spice Quiz
          </span>
          <span className="text-xs font-medium text-[#6B655E]">Aman vs Riya</span>
        </h3>

        {quiz.done ? (
          <div className="text-center py-6">
            <span className="text-4xl block mb-2">🏆</span>
            <b className="text-base text-[#1A1A1A] block">
              {quiz.s[0] === quiz.s[1]
                ? "It's a tie!"
                : quiz.s[0] > quiz.s[1]
                ? 'Aman wins!'
                : 'Riya wins!'}
            </b>
            <p className="text-xs text-[#6B655E] mt-1">
              Aman {quiz.s[0]} – {quiz.s[1]} Riya
            </p>
            <button
              onClick={resetQuiz}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#F1EEE9] text-[#1A1A1A] hover:bg-[#EAE4DC] transition"
            >
              Play again
            </button>
          </div>
        ) : (
          <div>
            {/* Player Turn Bar */}
            <div className="flex gap-2.5 mb-3">
              <div
                className={`flex-1 p-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                  quiz.turn === 0 ? 'border-[#F25C2A] bg-[#FFF6F1]' : 'border-[#EAE4DC] bg-white'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-[#F25C2A] text-white flex items-center justify-center text-[10px]">
                  A
                </span>
                <span>Aman</span>
                <em className="ml-auto not-italic text-sm text-[#F25C2A]">{quiz.s[0]}</em>
              </div>

              <div
                className={`flex-1 p-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                  quiz.turn === 1 ? 'border-[#5B7CFF] bg-[#F4F7FF]' : 'border-[#EAE4DC] bg-white'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-[#5B7CFF] text-white flex items-center justify-center text-[10px]">
                  R
                </span>
                <span>Riya</span>
                <em className="ml-auto not-italic text-sm text-[#5B7CFF]">{quiz.s[1]}</em>
              </div>
            </div>

            <div className="text-[11px] text-[#6B655E] font-medium">
              Question {quiz.i + 1} of {QUIZ_QUESTIONS.length} · {quiz.turn === 0 ? "Aman's" : "Riya's"} turn
            </div>
            <b className="block text-sm text-[#1A1A1A] my-2 leading-snug">
              {currentQ.q}
            </b>

            {/* Answer Options */}
            <div className="grid gap-2">
              {currentQ.o.map((opt, idx) => {
                let btnStyle = 'border-[#EAE4DC] bg-white hover:border-[#F25C2A]';
                if (quiz.pick !== null) {
                  if (idx === currentQ.a) {
                    btnStyle = 'bg-[#E8F9EE] border-[#22C55E] text-[#15803D] font-bold';
                  } else if (idx === quiz.pick) {
                    btnStyle = 'bg-[#FEECEC] border-[#EF4444] text-[#B91C1C]';
                  }
                }

                return (
                  <button
                    key={opt}
                    disabled={quiz.pick !== null}
                    onClick={() => handleQuizPick(idx)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
