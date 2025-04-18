type CountdownProps = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

export const Countdown = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: CountdownProps) => {
  if (completed) {
    return <span>Sale ended!</span>;
  }

  return (
    <div className="flex gap-2 sm:gap-3 items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="bg-primary text-white text-xl sm:text-2xl font-bold rounded px-2 sm:px-3 py-1 min-w-[40px] sm:min-w-[50px] text-center">
          {days}
        </div>
        <span className="text-xs mt-1">Days</span>
      </div>
      <span className="text-xl sm:text-2xl font-bold text-gray-400">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-primary text-white text-xl sm:text-2xl font-bold rounded px-2 sm:px-3 py-1 min-w-[40px] sm:min-w-[50px] text-center">
          {hours}
        </div>
        <span className="text-xs mt-1">Hours</span>
      </div>
      <span className="text-xl sm:text-2xl font-bold text-gray-400">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-primary text-white text-xl sm:text-2xl font-bold rounded px-2 sm:px-3 py-1 min-w-[40px] sm:min-w-[50px] text-center">
          {minutes}
        </div>
        <span className="text-xs mt-1">Mins</span>
      </div>
      <span className="text-xl sm:text-2xl font-bold text-gray-400">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-primary text-white text-xl sm:text-2xl font-bold rounded px-2 sm:px-3 py-1 min-w-[40px] sm:min-w-[50px] text-center">
          {seconds}
        </div>
        <span className="text-xs mt-1">Secs</span>
      </div>
    </div>
  );
};
