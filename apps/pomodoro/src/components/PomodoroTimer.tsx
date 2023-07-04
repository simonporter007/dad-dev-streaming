import React, { useEffect, useState } from 'react';
import { useSound } from 'use-sound';
import pingSfx from '../public/ping.mp3';
import newRoundSfx from '../public/newRound.mp3';
import { useWebsocketConnection } from '../hooks/useWebsocketConnection';

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
  const [messageHistory, setMessageHistory] = useState<
    WebSocketEventMap['message'][] | null
  >([]);
  const lastMessage = useWebsocketConnection();

  const [playPing] = useSound(pingSfx, {
    playbackRate: 0.7,
    volume: 0.3,
    interrupt: true,
  });
  const [playNewRound] = useSound(newRoundSfx, {
    playbackRate: 0.7,
    volume: 0.2,
    interrupt: true,
  });
  let interval: number;

  function handleTimerClick() {
    setTimerStarted((prev) => !prev);
  }

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) =>
        prev ? [...prev, lastMessage] : [lastMessage]
      );
    }
  }, [lastMessage, setMessageHistory]);

  useEffect(() => {
    if (seconds === 0) {
      setRound((round) => {
        if (onBreak) {
          playNewRound();
          return round + 1;
        }
        playPing();
        return round;
      });
      setOnBreak((onBreak) => !onBreak);
    }
  }, [seconds]);

  useEffect(() => {
    if (timerStarted && !interval) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            return onBreak ? defaultBreakTime : defaultFocusTime;
          }
          return prev - SECOND;
        });
      }, SECOND);
    } else if (!timerStarted && interval) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerStarted, onBreak]);

  console.log({ messageHistory });

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
