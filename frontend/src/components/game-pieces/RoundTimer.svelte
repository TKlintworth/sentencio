<script>
  import { onMount, onDestroy } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let initialTime = 60; // initial time in seconds
  export let onTimeUp = () => {}; // callback when time is up

  let timeLeft = tweened(initialTime, {
    duration: 1000,
    easing: cubicOut
  });

  let interval;
  let isRunning = false;

  export function start() {
    isRunning = true;
    interval = setInterval(() => {
      if ($timeLeft > 0) {
        timeLeft.update(t => t - 1);
      } else {
        stop();
        onTimeUp();
      }
    }, 1000);
  }

  export function stop() {
    isRunning = false;
    if (interval) clearInterval(interval);
  }

  export function reset(newTime = initialTime) {
    stop();
    timeLeft.set(newTime);
  }

  onDestroy(() => {
    stop();
  });

  $: isUrgent = $timeLeft <= 10;
  $: progress = ($timeLeft / initialTime) * 100;
</script>

<div class="timer-container">
  <div class="timer-display" class:urgent={isUrgent}>
    <span class="time-value">{Math.ceil($timeLeft)}</span>
    <span class="time-label">seconds</span>
  </div>

  <div class="timer-bar">
    <div
      class="timer-fill"
      class:urgent={isUrgent}
      style="width: {progress}%"
    ></div>
  </div>
</div>

<style>
  .timer-container {
    padding: 1rem;
    text-align: center;
  }

  .timer-display {
    font-size: 2rem;
    font-weight: bold;
    color: #4d9c4b;
    transition: color 0.3s ease;
  }

  .timer-display.urgent {
    color: #e5582a;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .time-label {
    font-size: 1rem;
    display: block;
    margin-top: 0.25rem;
  }

  .timer-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 1rem;
  }

  .timer-fill {
    height: 100%;
    background: #4d9c4b;
    transition: width 1s linear, background-color 0.3s ease;
  }

  .timer-fill.urgent {
    background: #e5582a;
  }
</style>