import React, { useEffect, useState } from "react";

const SECOND = 1 * 1000;
const MINUTE = 60 * SECOND;
// const HOUR = 60 * MINUTE
const defaultFocusTime = 50 * MINUTE;
const defaultBreakTime = 10 * MINUTE;
const maxPomodoroRounds = 8;

export function Timer() {
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
      setOnBreak((onBreak) => !onBreak);
      setRound((round) => {
        if (onBreak && round + 1 > maxPomodoroRounds) {
          setTimerStarted(false);
          clearInterval(interval);
          return 1;
        }
        return onBreak ? round + 1 : round;
      });
    }
  }, [seconds]);

  useEffect(() => {
    if (timerStarted && !interval) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            return !onBreak ? defaultFocusTime : defaultBreakTime;
          }
          return prev - SECOND;
        });
      }, SECOND);
    } else if (!timerStarted && interval) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerStarted]);

  return (
    <a href="#" onClick={handleTimerClick}>
      <div className="grid">
        <div className="flex text-5xl tracking-tight">
          <span className="text-white min-w-[5ch]">
            {new Date(seconds).toISOString().substring(14, 19)}
          </span>
          <span className="text-gray-300 min-w-[8ch] text-center font-bold">
            {timerStarted ? (onBreak ? "BREAK" : "FOCUS") : "PAUSED"}
          </span>
        </div>
        <span className="text-gray-300 text-center text-lg">
          {round} of {maxPomodoroRounds}
        </span>
      </div>
    </a>
  );
}
