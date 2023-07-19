import React, { useCallback, useEffect, useMemo } from 'react';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { useAnimate } from 'framer-motion';

const containerHeight = 570 - 16; //height of overlay + padding top + bottom

export function TaskList() {
  const [scope, animate] = useAnimate();
  const { data: allTasks = [], isFetching } = useGetAllTasks();

  const tDate = new Date();
  tDate.setHours(0, 0, 0, 0);

  const tasks = useMemo(
    () => allTasks?.filter((task) => task.date && new Date(task.date) > tDate),
    [allTasks]
  );

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
      if (scope.current.scrollHeight > containerHeight) {
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
            <div className='flex flex-col justify-center'>
              <span
                className={`${
                  task?.completed ? 'line-through text-gray-400' : 'text-xl'
                }`}
              >
                {task?.username}
              </span>
              <span
                className={`${
                  task?.completed
                    ? 'line-through text-gray-400'
                    : 'text-gray-300   text-lg'
                }`}
              >
                {task?.id}
              </span>
            </div>
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
