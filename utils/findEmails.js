import { supabase } from "../db.js";

async function findEmails(news) {
  const { data: emails } = await supabase.from("emails").select();
  const { data: sent = [] } = await supabase.from("sent_notices").select();

  const sentSet = new Set(sent.map((s) => `${s.email}|${s.url}`));

  const verifiedEmail = [];

  emails.forEach((user) => {
    const alreadySent = sentSet.has(`${user.email}|${news.url}`);

    if (alreadySent) {
      return;
    }

    const matchedSelection = user.selections.find((selection) => {
      const branchMatch = new RegExp(`\\b${selection.branch}\\b`, "i").test(
        news.title,
      );

      const semesterMatch = new RegExp(`\\b${selection.semester}\\b`, "i").test(
        news.title,
      );

      return branchMatch && semesterMatch;
    });

    if (matchedSelection) {
      verifiedEmail.push({
        ...user,
        branch: matchedSelection.branch,
        semester: matchedSelection.semester,
      });
    }
  });

  return verifiedEmail;
}

export default findEmails;
