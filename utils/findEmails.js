import { supabase } from "../db.js";

async function findEmails(news) {
  console.log("Finding emails");

  const { data, error } = await supabase.from("emails").select();

  let verifiedEmail = [];

  if (error) {
    console.log("Error occurred during fetching emails:", error.message);
    return;
  }

  const title = news.title;

  data.forEach((user) => {
    if (title.includes(user.branch) && title.includes(` ${user.semester} `)) {
      verifiedEmail.push(user);
    }
  });

  return verifiedEmail;
}

export default findEmails;
