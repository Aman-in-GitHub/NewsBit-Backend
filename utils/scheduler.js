// import { main } from "../scraper.js";

// export function runAt3AM() {
//   const now = new Date();

//   const timeUntil3AM =
//     new Date(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0, 0) -
//     now;

//   const delay =
//     timeUntil3AM < 0 ? timeUntil3AM + 24 * 60 * 60 * 1000 : timeUntil3AM;

//   setTimeout(async () => {
//     try {
//       console.log("Starting daily scraping");
//       await main();
//       console.log("Daily news scraping completed");
//     } catch (error) {
//       console.error("Error occurred in scraper:", error.message);
//     } finally {
//       runAt3AM();
//     }
//   }, delay);
// }

import { main } from '../scraper.js';

export function runAt3AM() {
  const interval = 4 * 60 * 1000;

  setInterval(async () => {
    try {
      console.log('Starting periodic scraping');
      await main();
      console.log('Periodic news scraping completed');
    } catch (error) {
      console.error('Error occurred in scraper:', error.message);
    }
  }, interval);
}

runAt3AM();
