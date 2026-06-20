import cron from "node-cron";

export function startCrawlerSchedule(
  cronExpression: string,
  run: () => Promise<void>,
) {
  return cron.schedule(cronExpression, () => {
    void run().catch((error) => {
      console.error("Scheduled crawler run failed:", error);
    });
  });
}
