import { supabase } from "../db.js";

async function findEmails(news) {
  const { data: emails } = await supabase.from("emails").select();
  const { data: sent = [] } = await supabase.from("sent_notices").select();

  const sentSet = new Set(sent.map((s) => `${s.email}|${s.url}`));

  const verifiedEmail = [];

  emails.forEach((user) => {
    const branchMatch = new RegExp(`\\b${user.branch}\\b`, "i").test(
      news.title,
    );
    const semesterMatch = new RegExp(`\\b${user.semester}\\b`, "i").test(
      news.title,
    );
    const alreadySent = sentSet.has(`${user.email}|${news.url}`);

    if (branchMatch && semesterMatch && !alreadySent) {
      verifiedEmail.push(user);
    }
  });

  return verifiedEmail;
}

export default findEmails;
