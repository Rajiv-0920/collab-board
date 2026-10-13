import { Sun, Zap, Moon, MoonStar } from 'lucide-react';

const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';

  return 'Good evening';
};

export const getStunningGreeting = (name = '') => {
  const date = new Date();
  const hour = date.getHours();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

  const displayName = name ? `, ${name}` : '';

  // Morning (5 AM - 12 PM)
  if (hour >= 5 && hour < 12) {
    return {
      greeting: getRandomItem([
        `Good morning${displayName}`,
        `Rise and shine${displayName}`,
        `Top of the morning${displayName}`,
        `Ready for today${displayName}?`,
      ]),
      subtext: getRandomItem([
        `Happy ${dayName}! Ready to conquer your goals today?`,
        `Fresh start to your day. Let's make it productive.`,
        `Hope your day gets off to a great start!`,
        `Here is an overview of your current workspace.`,
      ]),
      badgeText: getRandomItem([
        'Morning Focus',
        'Early Start',
        "Today's Goals",
      ]),
      Icon: Sun,
    };
  }

  // Afternoon (12 PM - 5 PM)
  if (hour >= 12 && hour < 17) {
    return {
      greeting: getRandomItem([
        `Good afternoon${displayName}`,
        `Welcome back${displayName}`,
        `Midday momentum${displayName}`,
        `Hope your day is going well${displayName}`,
      ]),
      subtext: getRandomItem([
        `Keep up the great momentum on your boards!`,
        `Midday check-in. Time to review your progress.`,
        `Hope your ${dayName} is going smoothly so far.`,
        `Here is what needs your attention right now.`,
      ]),
      badgeText: getRandomItem([
        'Midday Flow',
        'Afternoon Sync',
        'Stay Focused',
      ]),
      Icon: Zap,
    };
  }

  // Evening (5 PM - 10 PM)
  if (hour >= 17 && hour < 22) {
    return {
      greeting: getRandomItem([
        `Good evening${displayName}`,
        `Welcome back${displayName}`,
        `Winding down${displayName}?`,
        `Wrapping up for today${displayName}?`,
      ]),
      subtext: getRandomItem([
        `Great job on your progress today!`,
        `Finishing strong or setting up for tomorrow?`,
        `Hope you had a productive ${dayName}.`,
        `Time to check off the last few tasks.`,
      ]),
      badgeText: getRandomItem([
        'Evening Wrap-up',
        'Daily Review',
        'Wind Down',
      ]),
      Icon: Moon,
    };
  }

  // Late Night (10 PM - 5 AM)
  return {
    greeting: getRandomItem([
      `Night Owl Mode${displayName}`,
      `Working late${displayName}?`,
      `Quiet hours productivity${displayName}`,
      `Burning the midnight oil${displayName}`,
    ]),
    subtext: getRandomItem([
      `Remember to take breaks and rest soon.`,
      `Getting ahead for tomorrow? Don't push too hard.`,
      `Peaceful night for focused work.`,
      `Workspace is ready whenever you are.`,
    ]),
    badgeText: getRandomItem([
      'Late Night Session',
      'Night Owl',
      'Quiet Hours',
    ]),
    Icon: MoonStar,
  };
};
