import React, { useCallback, useEffect } from 'react';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { useAnimate } from 'framer-motion';

const containerHeight = 570 - 16; //height of overlay + padding top + bottom

export function TaskList() {
  const [scope, animate] = useAnimate();
  const { data: tasks = [], isFetching } = useGetAllTasks();
  const animateList = useCallback(
    () =>
      animate(
        scope.current,
        {
          transform: [
            `translateY(0px)`,
            `translateY(-${scope.current.scrollHeight - containerHeight}px)`,
            `translateY(0px)`,
          ],
        },
        {
          duration: 15,
          autoplay: false,
          ease: 'easeInOut',
        }
      ),
    []
  );

  useEffect(() => {
    if (!isFetching) {
      if (tasks?.length > 10) {
        animateList().play();
      }
    }
  }, [tasks, isFetching]);

  return (
    <div
      className={`grid p-2 font-['Poppins'] font-light text-3xl h-fit`}
      ref={scope}
    >
      <span className='flex gap-2 border-b border-white border-solid p-4 justify-center items-center'>
        {'📝 Total Tasks Today:'}
        <span className='text-green-300 font-bold'>
          {tasks?.filter((task) => task?.completed)?.length}
        </span>
        <span className='text-xl'>{' / '}</span>
        <span className='font-bold'>{tasks?.length}</span>
      </span>

      {tasks?.map((task) => {
        return (
          <div
            key={task.id}
            className='grid grid-cols-[28px_150px_1fr] gap-2 pt-4 text-2xl'
          >
            <span className=''>{task?.completed ? '✅' : ''}</span>
            <span
              className={`${
                task?.completed ? 'line-through text-gray-400' : ''
              }`}
            >
              {task?.username}
            </span>
            <span
              className={`${
                task?.completed ? 'line-through  text-gray-400' : ''
              }`}
            >
              {task?.task}
            </span>
          </div>
        );
      })}
    </div>
  );
}
