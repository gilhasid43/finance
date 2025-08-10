import React, { useState, useEffect } from 'react';
import { ExpenseEntry } from '@/components/expense-entry';
import { useExpenses } from '@/store/expenses';
import { Card } from '@/components/ui/card';

const prosperityMantras = [
  "אני פתוח לקבל שפע בכל הצורות הטובות עבורי.",
  "השפע זורם אליי בקלות ובשמחה.",
  "אני בוחר לראות הזדמנויות בכל יום.",
  "אני ראוי לשפע בכל תחומי חיי.",
  "השפע מגיע אליי בדרכים צפויות ובלתי צפויות.",
  "כל יום מביא איתו מתנות חדשות.",
  "אני משחרר פחדים וחוסר, ומזמין אהבה ושפע.",
  "אני מוקף באפשרויות אינסופיות.",
  "אני בוחר להאמין שיש מספיק לכולם, כולל לי.",
  "הכסף והשפע הם כלים להגשמת מטרותיי.",
  "אני נפתח לקבלת כל הטוב שהיקום מציע.",
  "אני מודה על השפע שכבר יש לי.",
  "אני מהווה מגנט להזדמנויות ולשפע.",
  "אני חי מתוך תחושת שפע כבר עכשיו.",
  "כל מחשבה טובה שאני מטפח מזמינה עוד שפע.",
  "אני מרגיש בנוח לקבל כמו שאני נותן.",
  "אני מושך אנשים, מקומות וחוויות מלאי שפע לחיי.",
  "אני סומך על היקום שיכוון אותי לשפע הנכון לי.",
  "אני בוחר להתרכז בשפע, לא במחסור.",
  "השפע שלי הולך וגדל בכל יום שעובר."
];

const bubbleColors = [
  'linear-gradient(135deg, #F5D565, #FFB347)',
  'linear-gradient(135deg, #B7C5FF, #A8B5FF)',
  'linear-gradient(135deg, #BEE8D6, #A8D5C4)',
  'linear-gradient(135deg, #F9B3D1, #F5A3C7)',
  'linear-gradient(135deg, #D9C1F0, #C5A8E8)',
  'linear-gradient(135deg, #FFC8A2, #FFB088)',
  'linear-gradient(135deg, #A8E6CF, #88D8C0)',
  'linear-gradient(135deg, #FFB7B2, #FF8A80)',
  'linear-gradient(135deg, #BBDEFB, #90CAF9)',
  'linear-gradient(135deg, #F8BBD9, #F48FB1)'
];

const bubbleShapes = [
  '50%',
  '25px',
  '50% 50% 50% 50% / 60% 60% 40% 40%',
  '30% 70% 70% 30% / 30% 30% 70% 70%',
  '50% 20% / 20% 50%',
  '60% 40% 30% 70% / 60% 30% 70% 40%',
  '25% 75% 75% 25% / 25% 25% 75% 75%',
  '40% 60% 60% 40% / 40% 40% 60% 60%',
  '0% 100% 0% 100% / 0% 100% 0% 100%',
  '100% 0% 100% 0% / 100% 0% 100% 0%',
  '50% 50% 0% 100% / 50% 50% 0% 100%',
  '0% 100% 50% 50% / 0% 100% 50% 50%',
  '20px 60px 20px 60px',
  '60px 20px 60px 20px',
  '40px 10px 40px 10px',
  '10px 40px 10px 40px'
];

interface BubbleData {
  mantra: string;
  color: string;
  shape: string;
  position: { top: number; left: number };
  size: number;
  animationDelay: number;
}

const Home: React.FC = () => {
  const { remainingAmount, totalSpent } = useExpenses();
  const handleExpenseAdded = () => {};
  
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);

  useEffect(() => {
    // Randomly select 3 mantras and create unique bubbles
    const shuffledMantras = [...prosperityMantras].sort(() => 0.5 - Math.random()).slice(0, 3);
    const shuffledColors = [...bubbleColors].sort(() => 0.5 - Math.random());
    const shuffledShapes = [...bubbleShapes].sort(() => 0.5 - Math.random());
    
    // Create distinct positions for each bubble
    const positions = [
      { top: 5, left: 10 },    // Top left
      { top: 15, left: 75 },   // Top right  
      { top: 60, left: 5 },    // Bottom left
    ];
    
    const newBubbles: BubbleData[] = shuffledMantras.map((mantra, index) => ({
      mantra,
      color: shuffledColors[index],
      shape: shuffledShapes[index],
      position: positions[index],
      size: Math.random() * 40 + 120, // 120px to 160px
      animationDelay: Math.random() * 4
    }));
    
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="min-h-screen pb-28 bg-pattern flex flex-col relative">
      {/* Floating speech bubbles with prosperity mantras */}
      {bubbles.map((bubble, index) => (
        <div 
          key={index} 
          className="speech-bubble"
          style={{
            background: bubble.color,
            borderRadius: bubble.shape,
            top: `${bubble.position.top}%`,
            left: `${bubble.position.left}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDelay: `${bubble.animationDelay}s`,
            transform: `rotate(${index * 15}deg)`
          }}
        >
          {bubble.mantra}
        </div>
      ))}

      {/* Content */}
      <div className="container pt-12 space-y-6 flex-1 flex items-center content-area">
        <div className="w-full space-y-4">
          <ExpenseEntry
            onExpenseAdded={handleExpenseAdded}
            remainingAmount={remainingAmount}
            totalSpent={totalSpent}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;