import { CheerioCrawler, RequestQueue } from 'crawlee';
import { supabase } from './db.js';
import createEmail from './utils/createEmail.js';
import fs from 'fs';

function dateToSeconds(dateString) {
  const formattedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
  const date = new Date(formattedDateString);
  const seconds = date.getTime() / 1000;
  return seconds;
}

async function scrapeNews() {
  const DATA = [];
  const startUrls = [];
  let pagesSetToScrape = 0;
  const totalPagesToScrape = 5;
  const urls = ['https://iost.tu.edu.np/notices'];

  for (const url of urls) {
    startUrls.push({ url: url, label: 'START' });
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
      if (request.userData.label === 'START') {
        console.log(`Processing Listing URL: ${request.url}`);

        const urls = $('.recent-post-wrapper a');
        for (let i = 0; i < urls.length; i++) {
          if (pagesSetToScrape >= totalPagesToScrape) {
            console.log('Completed Listing URLs');
            return;
          }

          let url = urls.eq(i).attr('href');
          url = new URL(url, request.url).href;
          console.log('Detail url ' + url);

          await requestQueue.addRequest({ url, userData: { label: 'DETAIL' } });
          pagesSetToScrape++;
        }

        const next = $('a.page-link[rel="next"]');
        if (next.length > 0) {
          const nextUrl = new URL(next.attr('href'), request.url).href;
          console.log('Next page ' + nextUrl);
          await requestQueue.addRequest({
            url: nextUrl,
            userData: { label: 'START' }
          });
        }
      } else if (request.userData.label === 'DETAIL') {
        console.log('Scraping Detail URL: ' + request.url);
        const title = $('.detail-page-inner h4.title').text();
        const pdfUrl = $('td.text-center a[download]').attr('href');
        const date = $('span#nep_date').text();

        const results = {
          index: DATA.length + 1,
          title,
          date: dateToSeconds(date),
          pdfUrl,
          url: request.url
        };

        console.log('RESULTS', results.title);
        DATA.push(results);
      }
    }
  });

  await crawler.run(startUrls);

  await requestQueue.drop();

  return DATA;
}

export async function main() {
  try {
    const DATA = await scrapeNews();

    const { data, error } = await supabase.from('news').select();

    if (error) {
      console.log('Error occurred during fetching news:', error.message);
      return;
    }

    if (data.length > 0) {
      const previousFirstNews = data.find((n) => n.index === 1);
      const currentFirstNews = DATA.find((n) => n.index === 1);
      if (previousFirstNews.url === currentFirstNews.url) {
        console.log('No new news found');
        return;
      }
    }

    DATA.forEach(async (news) => {
      const { error } = await supabase.from('news').upsert({
        index: news.index,
        title: news.title,
        date: news.date,
        pdfUrl: news.pdfUrl,
        url: news.url
      });
      if (error) {
        console.log('Error occurred during upsert:', error.message);
      }
    });

    DATA.forEach(async (news) => {
      const found = data.find((n) => n.url === news.url);

      if (!found) {
        console.log('New news found:', news.url);
        await createEmail(news);
      }
    });

    console.log('News has been scraped successfully.');
  } catch (error) {
    console.log('Error Scraping The News:', error);
  } finally {
    if (fs.existsSync('./storage')) {
      fs.rm('./storage', { recursive: true, force: true }, (err) => {
        if (err) {
          console.error('Error deleting directory:', err);
        } else {
          console.log('Directory and its contents deleted.');
        }
      });
    } else {
      console.log('Storage directory does not exist.');
    }
  }
}

export function scheduler() {
  const interval = 24 * 60 * 60 * 1000;

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
