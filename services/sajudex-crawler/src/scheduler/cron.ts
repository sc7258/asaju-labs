import cron from "node-cron";

export function startCrawlerSchedule(
  cronExpression: string,
  run: () => Promise<void>,
) {
  const task = () => {
    void run().catch((error) => {
      console.error("Scheduled crawler run failed:", error);
    });
  };

  // 1. 즉각 1회 실행
  task();

  // 2. 이후 정해진 시간에 스케줄링
  return cron.schedule(cronExpression, task);
}
