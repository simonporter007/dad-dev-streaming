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
  const [onBreak, setOnBreak] = useState(true);
  const [seconds, setSeconds] = useState(defaultBreakTime);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState<string>();
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
      try {
        const parsedMessage = JSON.parse(lastMessage.data) as {
          command: string;
          message: string;
        };
        if (parsedMessage?.command === 'pause') {
          setTimerStarted(false);
        } else if (parsedMessage?.command === 'resume') {
          setTimerStarted(true);
        } else if (parsedMessage?.command === 'say') {
          setMessage(parsedMessage?.message);
          setTimeout(() => setMessage(''), 10 * SECOND);
        }
      } catch (err) {
        // not JSON message, ignore
        return;
      }
    }
  }, [lastMessage, setMessage, setTimerStarted]);

  useEffect(() => {
    if (seconds === 0) {
      setRound((round) => {
        if (onBreak) {
          return round + 1;
        }
        return round;
      });
      setOnBreak((onBreak) => !onBreak);
    } else if (onBreak && seconds === 6 * SECOND) {
      playNewRound();
      setTimeout(() => playNewRound(), 3.5 * SECOND);
    } else if (!onBreak && seconds === 2 * SECOND) {
      playPing();
      setTimeout(() => playPing(), 1.5 * SECOND);
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

  /*
  box-shadow: 0 3px 6px rgba(0,0,0,0.4);
	&:before,
	&:after {
		content: "";
		border: 1px solid white;
	}
	&:before {
		grid-row: 1 / 5;
    grid-column: 1 / 3;
		border-right: none;
		border-bottom: none;
		border-radius: 16px 0px;
	}	
	&:after {
		grid-row: 1 / span 5;
    grid-column: 2 / span 2;
		border-left: none;
		border-radius: 0px 16px 16px 0px;
	}
}
  */
  return (
    <>
      <a href='#' onClick={handleTimerClick}>
        <div className='grid heading-frame h-full w-screen text-white text-center place-content-center grid-cols-[90px_max-content_90px] grid-rows-[32px_repeat(5,_max-content)] before:content-[""] after:content-[""] before:border-solid before:border-white before:border after:border-solid after:border-white after:border before:border-r-0 before:border-b-0 after:border-l-0 before:rounded-tl-lg after:rounded-tr-lg after:rounded-br-lg before:row-start-1 before:row-end-5 before:col-start-1 before:col-end-3 after:row-start-1 after:row-span-5 after:col-start-2 after:col-span-2'>
          <span className="font-['Bungee'] text-8xl row-start-2 col-start-2">
            {new Date(seconds).toISOString().substring(14, 19)}
          </span>
          <div className='flex gap-4 justify-center row-start-3 col-start-2'>
            <span
              className={`font-bold text-4xl ${
                timerStarted && !onBreak
                  ? "font-['Portico_Regular']"
                  : "font-['Portico_Outline']"
              }`}
            >
              FOCUS
            </span>
            <span
              className={`font-bold text-4xl ${
                timerStarted && onBreak
                  ? "font-['Portico_Regular']"
                  : "font-['Portico_Outline']"
              }`}
            >
              BREAK
            </span>
            <span
              className={`font-bold text-4xl ${
                timerStarted
                  ? "font-['Portico_Outline']"
                  : "font-['Portico_Regular']"
              }`}
            >
              PAUSED
            </span>
          </div>
          <span className="font-bold text-4xl font-['Portico_Outline'] row-start-4 col-start-2">
            #{round}
          </span>
          <div className='flex justify-center row-start-5 col-start-1 pr-2 pt-2'>
            <span className="font-['Poppins'] font-light">{'POMO'}</span>
          </div>
        </div>
      </a>
      <div className='grid place-content-center text-center pt-8'>
        <span
          key={message}
          className="fade-in-out max-w-[800px] font-['Bungee'] text-3xl"
        >
          {message}
        </span>
      </div>
    </>
  );
}
