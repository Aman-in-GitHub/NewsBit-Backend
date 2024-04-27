import fs from "fs";
import { CheerioCrawler } from "crawlee";
import { supabase } from "./db.js";
import createEmail from "./utils/createEmail.js";

const DATA = [];

function dateToSeconds(dateString) {
  const formattedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");

  const date = new Date(formattedDateString);

  const seconds = date.getTime() / 1000;

  return seconds;
}

async function scrapeNews() {
  let startUrls = [];

  let pagesSetToScrape = 0;
  let totalPagesToScrape = 100;

  const urls = ["https://iost.tu.edu.np/notices"];

  for (const url of urls) {
    startUrls.push({
      url: url,
      label: "START",
    });
  }

  const crawler = new CheerioCrawler({
    minConcurrency: 1,
    maxRequestRetries: 10,
    maxConcurrency: 1,
    requestHandlerTimeoutSecs: 60,
  });

  crawler.router.addHandler("START", async ({ request, $ }) => {
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

      await crawler.addRequests([
        {
          url: url,
          label: "DETAIL",
        },
      ]);

      pagesSetToScrape++;
    }

    let next = $('a.page-link[rel="next"]');

    if (next.length > 0) {
      console.log("Next page " + next.attr("href"));
      await crawler.addRequests([
        {
          url: next.attr("href"),
          label: "START",
        },
      ]);
    }
  });

  crawler.router.addHandler("DETAIL", async ({ request, $ }) => {
    console.log("Scraping Detail URL: " + request.url);
    const title = $(".detail-page-inner h4.title").text();
    const pdfUrl = $("td.text-center a[download]").attr("href");
    const date = $("span#nep_date").text();

    const results = {
      index: DATA.length + 1,
      title: title,
      date: dateToSeconds(date),
      pdfUrl: pdfUrl,
      url: request.url,
    };

    console.log("RESULTS", results);

    DATA.push(results);

    return results;
  });

  await crawler.run(startUrls);
}

export async function main() {
  try {
    await scrapeNews();

    console.log("Scraping Completed:", DATA.length);

    const { data, error } = await supabase.from("news").select();

    if (error) {
      console.log("Error occurred during fetching news:", error.message);
      return;
    }

    if (data.length > 0) {
      const previousFirstNews = data.find((n) => n.index === 1);
      const currentFirstNews = DATA.find((n) => n.index === 1);

      if (previousFirstNews.url === currentFirstNews.url) {
        console.log("No new news found");
        return;
      }
    }

    DATA.forEach(async (news) => {
      const { error } = await supabase.from("news").upsert({
        index: news.index,
        title: news.title,
        date: news.date,
        pdfUrl: news.pdfUrl,
        url: news.url,
      });

      if (error) {
        console.log("Error occurred during upsert:", error.message);
      }
    });

    DATA.forEach((news) => {
      const found = data.find((n) => n.url === news.url);

      if (!found) {
        console.log("New news found:", news.url);
        createEmail(news);
      }
    });

    console.log("News has been scraped successfully.");
  } catch (error) {
    console.log("Error Scraping The News:", error);
  } finally {
    try {
      fs.rmdirSync("./storage", { recursive: true });
      console.log("Storage folder deleted.");
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("Storage folder does not exist.");
      } else {
        console.log("Error Scraping The News:", error);
      }
    }
  }
}
