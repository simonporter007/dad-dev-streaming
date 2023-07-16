import React, { useEffect } from 'react';

export function RainEffect() {
  let increment = 0;
  const drops: React.ReactNode[] = [];
  const backDrops: React.ReactNode[] = [];

  while (increment < 100) {
    //couple random numbers to use for various randomizations
    //random number between 98 and 1
    const randoHundo = Math.floor(Math.random() * (98 - 1 + 1) + 1);
    //random number between 5 and 2
    const randoFiver = Math.floor(Math.random() * (5 - 2 + 1) + 2);
    //increment
    increment += randoFiver;

    drops.push(
      <div
        className='drop'
        style={{
          left: `${increment}%`,
          bottom: `${randoFiver + randoFiver - 1 + 100}%`,
          animationDelay: `0.${randoHundo}s`,
          animationDuration: `0.5${randoHundo}s`,
        }}
      >
        <div
          className='stem'
          style={{
            animationDelay: `0.${randoHundo}s`,
            animationDuration: `0.5${randoHundo}s`,
          }}
        ></div>
        <div
          className='splat'
          style={{
            animationDelay: `0.${randoHundo}s`,
            animationDuration: `0.5${randoHundo}s`,
          }}
        ></div>
      </div>
    );
    backDrops.push(
      <div
        className='drop'
        style={{
          right: `${increment}%`,
          bottom: `${randoFiver + randoFiver - 1 + 100}%`,
          animationDelay: `0.${randoHundo}s`,
          animationDuration: `0.5${randoHundo}s`,
        }}
      >
        <div
          className='stem'
          style={{
            animationDelay: `0.${randoHundo}s`,
            animationDuration: `0.5${randoHundo}s`,
          }}
        ></div>
        <div
          className='splat'
          style={{
            animationDelay: `0.${randoHundo}s`,
            animationDuration: `0.5${randoHundo}s`,
          }}
        ></div>
      </div>
    );
  }

  // document.querySelector('.rain.back-row')?.append(backDrops);

  console.log(drops);
  return (
    <div className='body back-row-toggle'>
      <div className='rain front-row'>{drops}</div>
      <div className='rain back-row'>{backDrops}</div>
    </div>
  );
}
