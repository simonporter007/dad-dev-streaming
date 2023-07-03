import React, { useEffect, useState } from 'react';

const SECOND = 1 * 1000;
const MINUTE = 60 * SECOND;
// const HOUR = 60 * MINUTE
const defaultFocusTime = 50 * MINUTE;
const defaultBreakTime = 10 * MINUTE;

export function PomodoroTimer() {
  const [timerStarted, setTimerStarted] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [seconds, setSeconds] = useState(defaultFocusTime);
  const [round, setRound] = useState(1);
  let interval: number;

  function handleTimerClick() {
    setTimerStarted((prev) => !prev);
  }

  useEffect(() => {
    if (seconds === 0) {
      setRound((round) => {
        return onBreak ? round + 1 : round;
      });
      setOnBreak((onBreak) => !onBreak);
    }
  }, [seconds]);

  useEffect(() => {
    if (timerStarted && !interval) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            return onBreak ? defaultBreakTime : defaultFocusTime 
          }
          return prev - SECOND;
        });
      }, SECOND);
    } else if (!timerStarted && interval) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerStarted, onBreak]);

  return (
    <a href='#' onClick={handleTimerClick}>
      {onBreak ? (
        <div className='grid h-full w-screen text-white text-center place-content-center'>
          <span className="font-['Bungee'] text-8xl ">
            {timerStarted
              ? new Date(seconds).toISOString().substring(14, 19)
              : 'PAUSED'}
          </span>
        </div>
      ) : (
        <div className='grid justify-end items-end h-full'>
          <div className='grid p-4 text-white text-center'>
            <span className="font-['Bungee'] text-6xl ">
              {timerStarted
                ? new Date(seconds).toISOString().substring(14, 19)
                : 'PAUSED'}
            </span>
            <span className="font-bold text-4xl font-['Portico_Outline']">
              POMODORO#{round}
            </span>
          </div>
        </div>
      )}
    </a>
  );
}
