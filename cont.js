// npm install moment simple-git random jsonfile readline axios
import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";
import readline from "readline";

const path = "./data.json";
const git = simpleGit();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const getRandomDate = (startDate, endDate) => {
  const diffDays = endDate.diff(startDate, "days");
  const randomDays = random.int(0, diffDays);
  return startDate.clone().add(randomDays, "days").format("YYYY-MM-DD HH:mm:ss");
};

const markCommit = async (date) => {
  const data = { date };

  try {
    await jsonfile.writeFile(path, data);
    await git.add(path);
    await git.commit(`Commit on ${date}`, { "--date": date });
    console.log(`Commit made for date: ${date}`);
  } catch (error) {
    console.error(`Error making commit for date ${date}:`, error);
  }
};

const makeCommits = async (n, startDate, endDate) => {
  for (let i = 0; i < n; i++) {
    const date = getRandomDate(startDate, endDate);
    await markCommit(date);
    await delay(1); // Delay
  }

  try {
    await git.push("origin", "main");
    console.log("All commits pushed successfully!");
  } catch (error) {
    console.error("Error pushing commits:", error);
  }
};

const main = async () => {
  try {
    const startInput = await askQuestion("Start commit (format: MM-YYYY): ");
    const endInput = await askQuestion("End commit (format: MM-YYYY): ");
    const commitCount = await askQuestion("Number of commits: ");
    const now = moment();

    const startDate = moment(startInput, "MM-YYYY");
    let endDate = moment(endInput, "MM-YYYY").endOf("month");

    if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
      console.error("Invalid date range. Please check your input.");
      rl.close();
      process.exit(1);
    }

    // Batasi endDate agar tidak melebihi tanggal saat ini
    if (endDate.isAfter(now)) {
      endDate = now;
      console.log(`End date adjusted to current date: ${endDate.format("DD-MM-YYYY")}`);
    }

    console.log(`Making ${commitCount} commits between ${startDate.format("MMMM YYYY")} and ${endDate.format("DD-MM-YYYY")}`);
    await makeCommits(parseInt(commitCount), startDate, endDate);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    rl.close();
  }
};

main();
