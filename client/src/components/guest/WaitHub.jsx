import React, { useState, useEffect } from 'react';
import { useRestaurant, QUIZ_QUESTIONS, inr, mmss } from '../../context/RestaurantContext';

export default function WaitHub() {
  const { state, guestTable, copiedWifi, setCopiedWifi, quiz, setQuiz } = useRestaurant();

  const points = state.loyalty || 0;
  const goal = 200;
  const progressPercent = Math.min(100, Math.round((points / goal) * 100));

  const tableKey = 'T' + guestTable;
  const activeOrders = (state.orders || []).filter(
    (o) => o.table === tableKey && !o.cleared && o.status !== 'PAID'
  );
  const latestOrder = activeOrders.length ? activeOrders[activeOrders.length - 1] : null;

  // Live timer for cooking orders
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prepTimeSec = latestOrder
    ? Math.max(
        ...latestOrder.items.map((i) => {
          const dish = (state.menu || []).find((d) => d.id === i.id);
          return dish ? dish.prep : 10;
        })
      ) * 60
    : 600;

  const getRemSeconds = () => {
    if (!latestOrder || latestOrder.status !== 'COOKING') return 0;
    const speed = state.speed || 1;
    const elapsed = Math.max(0, ((now - (latestOrder.cookStart || now)) / 1000) * speed);
    return Math.max(0, prepTimeSec - elapsed);
  };

  const remSec = getRemSeconds();
  const isOrderReady = latestOrder?.status === 'READY' || latestOrder?.status === 'SERVED';

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
    <div className="flex flex-col gap-4 max-w-xl mx-auto pb-6">
      {/* 1. Live Kitchen Order Tracker (Visible when active order exists) */}
      {latestOrder ? (
        <div className="bg-white border-2 border-[#EAE4DC] rounded-3xl p-5 shadow-md select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3 mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#B83A14] bg-[#FDEEE7] px-2.5 py-0.5 rounded-full">
                LIVE KOT • #{latestOrder.id}
              </span>
              <h3 className="text-base font-black text-[#1A1A1A] mt-1">
                Table {guestTable} Order Status
              </h3>
            </div>
            <span className="text-sm font-black text-[#1A1A1A]">
              {inr(latestOrder.total)}
            </span>
          </div>

          {/* Stepper (Ordered -> Confirmed -> Cooking -> Ready) */}
          <div className="flex items-center justify-between mb-4 px-1">
            {[
              { num: 1, label: 'Order Sent', done: true },
              {
                num: 2,
                label: 'Staff Confirmed',
                done: latestOrder.status !== 'PENDING_APPROVAL',
                now: latestOrder.status === 'PENDING_APPROVAL',
              },
              {
                num: 3,
                label: 'Kitchen Cooking',
                done: isOrderReady,
                now: latestOrder.status === 'COOKING',
              },
              {
                num: 4,
                label: 'Food Ready',
                done: isOrderReady,
                now: latestOrder.status === 'READY',
              },
            ].map((step, idx) => (
              <div key={idx} className="flex-1 text-center relative">
                {idx > 0 && (
                  <div
                    className={`absolute top-3.5 -left-1/2 right-1/2 h-0.5 transition-colors ${
                      step.done ? 'bg-[#22C55E]' : 'bg-[#EAE4DC]'
                    }`}
                  />
                )}
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-black relative z-10 transition shadow-xs ${
                    step.done
                      ? 'bg-[#22C55E] text-white'
                      : step.now
                      ? 'bg-[#EA580C] text-white animate-bounce'
                      : 'bg-[#EEE9E2] text-[#8D8780]'
                  }`}
                >
                  {step.done ? '✓' : step.num}
                </div>
                <span className="text-[10px] font-extrabold text-[#1A1A1A] block mt-1 leading-tight">
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Status Message Cards */}
          {latestOrder.status === 'PENDING_APPROVAL' && (
            <div className="bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] rounded-2xl p-3.5 text-center text-xs font-extrabold animate-pulse">
              ⏳ Waiting for staff to confirm your order…
              <p className="text-[11px] font-medium text-[#9A3412] mt-0.5">
                Our captain is reviewing your items and will dispatch them to the kitchen shortly.
              </p>
            </div>
          )}

          {latestOrder.status === 'COOKING' && (
            <div className="bg-[#FFF1EB] border border-[#FFD2BD] rounded-2xl p-4 text-center">
              <div className="text-3xl mb-1">🔥</div>
              <b className="text-sm font-black text-[#C2410C] block">
                Our chefs are cooking your food!
              </b>
              <p className="text-xs text-[#9A3412] mt-0.5">
                Estimated time remaining:{' '}
                <span className="font-mono font-black text-sm text-[#EA580C]">
                  {remSec > 0 ? mmss(remSec) : 'Finishing touches…'}
                </span>
              </p>
            </div>
          )}

          {latestOrder.status === 'READY' && (
            <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl p-4 text-center">
              <div className="text-3xl mb-1">🎉</div>
              <b className="text-sm font-black text-[#15803D] block">
                Your food is cooked &amp; ready!
              </b>
              <p className="text-xs text-[#166534] mt-0.5">
                Our captain is bringing it directly to Table {guestTable}. Enjoy your meal!
              </p>
            </div>
          )}

          {latestOrder.status === 'SERVED' && (
            <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl p-3.5 text-center text-xs font-black text-[#15803D]">
              🍽️ Food Served · Enjoy your dining experience!
            </div>
          )}

          {/* Items Summary in tracker */}
          <div className="mt-3.5 pt-3 border-t border-[#EAE4DC] flex flex-wrap gap-1.5">
            {latestOrder.items.map((item, idx) => (
              <span
                key={idx}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-[#FAF8F5] text-[#1A1A1A] border border-[#EAE4DC]"
              >
                {item.qty}× {item.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#EAE4DC] rounded-3xl p-5 text-center shadow-xs">
          <span className="text-3xl block mb-1">🍽️</span>
          <h4 className="font-black text-sm text-[#1A1A1A]">No Active Order Yet</h4>
          <p className="text-xs text-[#8D8780] mt-0.5">
            Explore the Menu tab and add your favorite delicacies to track live cooking here!
          </p>
        </div>
      )}

      {/* 2. One-Tap Wi-Fi */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-4 shadow-xs">
        <h3 className="font-extrabold text-sm mb-3 flex items-center gap-1.5">
          <span>📶</span> High-Speed Dining Wi-Fi
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FDEEE7] text-2xl flex items-center justify-center flex-none">
            📶
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-[#6B655E] block font-medium">Network</span>
            <code className="font-mono font-bold text-xs text-[#1A1A1A]">Zaika_Guest</code>
            <span className="text-[11px] text-[#6B655E] block mt-1 font-medium">Password</span>
            <code className="font-mono font-bold text-xs text-[#1A1A1A]">zaika2026</code>
          </div>
          <button
            onClick={handleCopyWifi}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex-none cursor-pointer ${
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

      {/* 3. Loyalty Rewards */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-4 shadow-xs">
        <h3 className="font-extrabold text-sm mb-2 flex items-center gap-1.5">
          <span>🎁</span> Zaika Club Loyalty
        </h3>
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#6B655E]">Earn 1 point per ₹10 spent</span>
          <b className="font-extrabold text-[#1A1A1A]">
            {points} / {goal} pts
          </b>
        </div>
        <div className="h-2.5 rounded-full bg-[#EEE9E2] overflow-hidden my-2.5">
          <div
            className="h-full bg-gradient-to-r from-[#B83A14] to-[#EA580C] rounded-full transition-all duration-500"
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

      {/* 4. Trivia Quiz While You Wait */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-extrabold text-sm flex items-center gap-1.5">
            <span>🌶️</span> Royal Indori Spice Quiz
          </h3>
          <span className="text-xs text-[#6B655E] font-medium">
            Question {quiz.i + 1} of {QUIZ_QUESTIONS.length}
          </span>
        </div>

        {!quiz.done ? (
          <div>
            <p className="text-xs font-bold text-[#1A1A1A] my-2 leading-snug">
              {currentQ.q}
            </p>
            <div className="flex flex-col gap-1.5 mt-3">
              {currentQ.o.map((option, idx) => {
                const isPicked = quiz.pick === idx;
                const isCorrect = idx === currentQ.a;
                let btnStyle = 'bg-[#FAF8F5] border-[#EAE4DC] text-[#1A1A1A] hover:bg-[#F3EFEA]';

                if (quiz.pick !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D] font-bold';
                  } else if (isPicked) {
                    btnStyle = 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B] font-bold';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizPick(idx)}
                    disabled={quiz.pick !== null}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {quiz.pick !== null && isCorrect && <span>✓</span>}
                    {quiz.pick !== null && isPicked && !isCorrect && <span>✗</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="text-3xl block mb-1">🏆</span>
            <b className="text-sm font-black text-[#1A1A1A]">Quiz Complete!</b>
            <p className="text-xs text-[#6B655E] mt-1">
              You scored {quiz.s[0]} points!
            </p>
            <button
              onClick={resetQuiz}
              className="mt-3 bg-[#B83A14] text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
