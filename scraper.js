import { CheerioCrawler, RequestQueue } from "crawlee";
import { supabase } from "./db.js";
import createEmail from "./utils/createEmail.js";
import fs from "fs";

function dateToSeconds(dateString) {
  if (!dateString || typeof dateString !== "string") {
    console.log("Invalid date input:", dateString);
    return null;
  }

  const formattedDateString = dateString
    .trim()
    .replace(/(\d+)(st|nd|rd|th)/i, "$1");
  const date = new Date(formattedDateString);

  if (isNaN(date.getTime())) {
    console.log("Failed to parse date:", dateString);
    return null;
  }

  return Math.floor(date.getTime() / 1000);
}

async function scrapeNews() {
  const DATA = [];
  const startUrls = [];
  let pagesSetToScrape = 0;
  const totalPagesToScrape = 100;
  const urls = ["https://iost.tu.edu.np/notices"];

  for (const url of urls) {
    startUrls.push({ url: url, label: "START" });
  }

  const requestQueue = await RequestQueue.open();

  const crawler = new CheerioCrawler({
    requestQueue,
    minConcurrency: 1,
    maxConcurrency: 1,
    maxRequestRetries: 10,
    useSessionPool: false,
    requestHandlerTimeoutSecs: 60,
    requestHandler: async ({ request, $ }) => {
      if (request.userData.label === "START") {
        console.log(`Processing Listing URL: ${request.url}`);

        const urls = $(".recent-post-wrapper a");

        for (let i = 0; i < urls.length; i++) {
          if (pagesSetToScrape >= totalPagesToScrape) {
            console.log("Completed Listing URLs");
            return;
          }

          let url = urls.eq(i).attr("href");
          url = new URL(url, request.url).href;
          console.log("Detail url " + url);

          await requestQueue.addRequest({ url, userData: { label: "DETAIL" } });
          pagesSetToScrape++;
        }

        const next = $('a.page-link[rel="next"]');

        if (next.length > 0) {
          const nextUrl = new URL(next.attr("href"), request.url).href;
          console.log("Next page " + nextUrl);
          await requestQueue.addRequest({
            url: nextUrl,
            userData: { label: "START" },
          });
        }
      } else if (request.userData.label === "DETAIL") {
        console.log("Scraping Detail URL: " + request.url);

        const title = $(".detail-page-inner h4.title").text();
        const pdfUrl = $("td.text-center a[download]").attr("href");
        const date = $("span.nep_date").first().text();

        const results = {
          title,
          date: dateToSeconds(date),
          pdfUrl,
          url: request.url,
        };

        console.log("Scraped Notice:", results.title);

        DATA.push(results);
      }
    },
  });

  await crawler.run(startUrls);

  await requestQueue.drop();

  return DATA;
}

export async function main() {
  try {
    const DATA = await scrapeNews();

    const { data, error } = await supabase.from("news").select();

    if (error) {
      console.error("Error occurred during fetching news:", error.message);
      return;
    }

    const existingUrls = new Set(data.map((n) => n.url));

    const newItems = DATA.filter((news) => !existingUrls.has(news.url));

    if (newItems.length === 0) {
      console.log("No new news found");
      return;
    }

    for (const news of newItems) {
      const { error } = await supabase.from("news").upsert(
        {
          title: news.title,
          date: news.date,
          pdfUrl: news.pdfUrl,
          url: news.url,
        },
        { onConflict: "url" },
      );

      if (error) {
        console.error("Upsert error:", error.message);
      }
    }

    for (const news of newItems) {
      console.log("New news found:", news.url);
      await createEmail(news);
    }

    const { data: limitRow } = await supabase
      .from("news")
      .select("id")
      .order("id", { ascending: false })
      .range(100, 100)
      .single();

    if (limitRow) {
      const { error: deleteError } = await supabase
        .from("news")
        .delete()
        .lte("id", limitRow.id);

      if (deleteError) {
        console.log("Cleanup error:", deleteError.message);
      }
    }

    console.log("News has been scraped successfully.");
  } catch (error) {
    console.error("Error Scraping The News:", error);
  } finally {
    if (fs.existsSync("./storage")) {
      fs.rm("./storage", { recursive: true, force: true }, (err) => {
        if (err) console.error("Error deleting directory:", err);
        else console.log("Directory deleted.");
      });
    }
  }
}

export function scheduler() {
  const interval = 24 * 60 * 60 * 1000;

  setInterval(async () => {
    try {
      console.log("Starting periodic scraping");
      await main();

      console.log("Periodic news scraping completed");
    } catch (error) {
      console.error("Error occurred in scraper:", error.message);
    }
  }, interval);
}
