import tmi from 'tmi.js';
import crypto from 'crypto';
import { deleteTask, getTasksByUser, insertTask } from '../dbinstance';
import { Task } from '../../db/schema';

function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  return `${hours === 0 ? '' : hours < 10 ? `0${hours}h` : `${hours}h`}${
    minutes === 0 ? '' : minutes < 10 ? `0${minutes}m` : `${minutes}m`
  }${seconds === 0 ? '' : seconds < 10 ? `0${seconds}` : `${seconds}s`}`;
}

export async function taskCommand({
  client,
  args,
  command,
  subCommand,
  channel,
  username,
}: {
  client: tmi.Client;
  args: string[];
  command: string;
  subCommand?: string;
  channel: string;
  username: string;
}) {
  if (command === 'task') {
    const tDate = new Date();
    tDate.setHours(0, 0, 0, 0);
    const userTasks = getTasksByUser(username);
    const userTasksToday = userTasks?.filter(
      (task) => task.date && new Date(task.date) > tDate
    );
    /* !task */
    if (!subCommand || subCommand === 'help') {
      await client.say(
        channel,
        `📝 [@${username}]: Current subCommands: add, remove, list, clear, stats, done. Set a task for yourself. !task add <some important todo>`
      );
    } else if (subCommand === 'add') {
      const [...task] = args;
      const parsedTask = task.join(' ');
      if (!parsedTask) {
        await client.say(
          channel,
          `📝 [@${username}]: To set a task use the command: !task add <task>. e.g. !task add fill the dishwasher`
        );
      }
      const id = crypto.randomBytes(3).toString('hex');
      const newTask = {
        id,
        username,
        task: parsedTask,
        completed: false,
        date: new Date(),
      } as Task;
      try {
        insertTask(newTask);
        await client.say(channel, `📝 [@${username}]: Task added (id: ${id})!`);
      } catch (err) {
        console.log(err);
        await client.say(
          channel,
          `📝 [@${username}]: Sorry, an error occurred. Please try again later.`
        );
      }
    } else if (subCommand === 'done') {
      const [taskId] = args;
      if (!taskId) {
        const tasksToBeDone = userTasksToday?.filter((task) => !task.completed);
        insertTask({
          ...tasksToBeDone?.[0],
          completed: true,
          completedAt: new Date(),
        });
        await client.say(
          channel,
          `📝 [@${username}]: Great job! Task [${tasksToBeDone?.[0]?.id}] completed.`
        );
      } else {
        const taskToBeDone = userTasksToday?.find(
          (task) => task.id && task.id === taskId
        );
        if (taskToBeDone) {
          insertTask({
            ...taskToBeDone,
            completed: true,
            completedAt: new Date(),
          });
          await client.say(
            channel,
            `📝 [@${username}]: Great job! Task [${taskToBeDone?.id}] completed.`
          );
        } else {
          await client.say(
            channel,
            `📝 [@${username}]: I'm sorry, I failed to find that task. Are you sure the id is correct?`
          );
        }
      }
    } else if (subCommand === 'list') {
      if (userTasksToday?.length === 0) {
        await client.say(
          channel,
          `📝 [@${username}]: You currently have no tasks.`
        );
        return;
      }

      await client.say(channel, `📝 [@${username}]: Today's tasks are:`);
      userTasksToday?.forEach(async (task) => {
        await client.say(
          channel,
          `  ${task?.completed ? '✅' : ''}  [${task?.id}]: "${task?.task}"`
        );
      });
    } else if (subCommand === 'remove') {
      const [taskId] = args;
      const taskToDelete = userTasksToday?.find((task) => task?.id === taskId);
      if (!taskToDelete) {
        await client.say(
          channel,
          `📝 [@${username}]: I'm sorry, I failed to find that task. Are you sure the id is correct? !task remove <taskId>`
        );
        return;
      }
      try {
        deleteTask(taskId);
        await client.say(channel, `📝 [@${username}]: Task deleted.`);
      } catch (err) {
        console.log({ err });
        await client.say(
          channel,
          `📝 [@${username}]: I'm sorry, I failed to delete that task. Are you sure the id is correct?`
        );
      }
    } else if (subCommand === 'clear') {
      const [...confirm] = args;
      if (userTasksToday?.length === 0) {
        await client.say(
          channel,
          `📝 [@${username}]: You have no tasks to clear.`
        );
        return;
      } else if (confirm?.join(' ')?.toLowerCase() !== `i'm sure`) {
        await client.say(
          channel,
          `📝 [@${username}]: ⚠️ This will remove all of today's tasks! Type "!task clear i'm sure" - if you're sure.`
        );
        return;
      }
      userTasks?.forEach((task) => deleteTask(task.id));
      await client.say(
        channel,
        `📝 [@${username}]: all tasks have been removed.`
      );
    } else if (subCommand === 'stats') {
      const todaysTasksToBeDone = (userTasksToday || [])?.filter(
        (task) => !task?.completed
      )?.length;
      const totalTasks = (userTasks || [])?.length;
      let totalTime = 0;
      const totalCompletedTasks = (userTasksToday || [])
        ?.filter((task) => task.completed)
        ?.map((task) =>
          task?.completedAt && task?.date
            ? task?.completedAt?.getTime() - task?.date?.getTime()
            : 0
        );
      totalCompletedTasks?.forEach((time) => (totalTime += time));
      const avgTimeToComplete =
        totalCompletedTasks.length > 0
          ? totalTime / totalCompletedTasks?.length
          : 0;
      await client.say(
        channel,
        `📝 [@${username}]: You have completed ${
          totalCompletedTasks?.length
        } tasks today, with ${todaysTasksToBeDone} to go. In total, you've tracked ${totalTasks} task${
          totalTasks === 1 ? '' : 's'
        } in total! ${
          totalCompletedTasks?.length > 0
            ? `You've taken on avg ${msToTime(avgTimeToComplete)} per task`
            : ''
        }. Way to go! 🥳`
      );
    }
  }
}
