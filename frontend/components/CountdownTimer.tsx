'use client';

import { useEffect, useState } from 'react';

interface ICountdownTimerProps {
  targetDate: string | Date;
  onComplete?: () => void;
  label?: string;
  className?: string;
}

export default function CountdownTimer({ 
  targetDate, 
  onComplete, 
  label = 'Kalan Süre',
  className = '' 
}: ICountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        if (onComplete) {
          onComplete();
        }
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isPast: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (!timeLeft) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (timeLeft.isPast) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-gray-600 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-2">Başladı!</p>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'Gün' },
    { value: timeLeft.hours, label: 'Saat' },
    { value: timeLeft.minutes, label: 'Dakika' },
    { value: timeLeft.seconds, label: 'Saniye' },
  ];

  return (
    <div className={className}>
      <p className="text-sm text-gray-600 font-medium mb-3 text-center">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {timeUnits.map((unit, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200"
          >
            <div className="text-2xl font-bold text-blue-900">
              {unit.value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-blue-700 mt-1 font-medium">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


