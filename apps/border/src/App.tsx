import React from 'react';

function App() {
  return (
    <div className='bg-transparent grid heading-frame h-full w-screen text-white text-center place-content-center grid-cols-[90px_1fr_90px] grid-rows-[48px_repeat(2,_60px)] before:content-[""] after:content-[""] before:border-solid before:border-white before:border after:border-solid after:border-white after:border before:border-r-0 before:border-b-0 after:border-l-0 before:rounded-tl-lg after:rounded-tr-lg after:rounded-br-lg before:row-start-1 before:row-end-4 before:col-start-1 before:col-end-3 after:row-start-1 after:row-span-4 after:col-start-2 after:col-span-2'>
      <div className='flex justify-center items-center gap-4 row-start-4 col-start-1'>
        <span className='animate-ping h-[8px] w-[8px] rounded-full bg-red-700 opacity-75'></span>
        <span className="font-['Poppins'] font-light translate-y-1">
          {'LIVE'}
        </span>
      </div>
    </div>
  );
}

export default App;
