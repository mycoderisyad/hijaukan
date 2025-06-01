// **Tutorial Penggunaan**
//
// **Persyaratan:**
// 1. Pastikan Anda memiliki Node.js terinstal di sistem Anda.
// 2. Pastikan Anda memiliki akun GitHub dan sudah membuat Personal Access Token (PAT).
//
//
// **Instalasi Modul yang Diperlukan:**
// Jalankan perintah berikut untuk menginstal semua dependensi yang dibutuhkan:
// ```
// npm install jsonfile moment simple-git random axios readline-sync
// ```
//
// **Menjalankan Program:**
// Jalankan perintah berikut di terminal:
// ```
// node add.js
// ```
//
// **Cara Menggunakan:**
// 1. Saat dijalankan, program akan meminta Anda memilih antara:
//    - `1. Add Repository` → Untuk membuat dan mengupload repository ke GitHub.
//    - `2. Add Contributions` → Untuk menambahkan kontribusi dalam riwayat Git.
// 2. Jika memilih `Add Repository`, masukkan nama dasar repository dan jumlah repository yang ingin dibuat.
// 3. Jika memilih `Add Contributions`, masukkan jumlah kontribusi yang ingin ditambahkan.

import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";
import axios from "axios";
import { execSync } from "child_process";
import fs from "fs";
import readline from "readline";

const path = "./data.json";
const GITHUB_TOKEN = "";
const GITHUB_USERNAME = "";
const GITHUB_API_URL = `https://api.github.com/user/repos`;

// Function to create a repository on GitHub
async function createRepo(repoName) {
  try {
    await axios.post(
      GITHUB_API_URL,
      {
        name: repoName,
        private: false,
        description: `Repository for ${repoName}`,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );
    console.log(`Repository created on GitHub: ${repoName}`);
  } catch (error) {
    console.error(
      `Failed to create repository on GitHub: ${repoName}`,
      error.response?.data?.message || error.message
    );
  }
}

// Function to initialize and push repository
async function initializeAndPushRepo(repoName) {
  try {
    const sanitizedRepoName = repoName.replace(/\s+/g, "-");
    const repoPath = `./${sanitizedRepoName}`;
    const remoteURL = `https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${sanitizedRepoName}.git`;

    if (!fs.existsSync(repoPath)) {
      execSync(`mkdir "${repoPath}"`, { shell: true });
    }

    execSync(`git init`, { cwd: repoPath, shell: true });
    execSync(`echo "# ${repoName}" > README.md`, { cwd: repoPath, shell: true });
    execSync(`git add .`, { cwd: repoPath, shell: true });
    execSync(`git commit -m "Initial commit"`, { cwd: repoPath, shell: true });
    execSync(`git remote add origin ${remoteURL}`, { cwd: repoPath, shell: true });
    execSync(`git branch -M main`, { cwd: repoPath, shell: true });
    execSync(`git push -u origin main`, { cwd: repoPath, shell: true });

    console.log(`Successfully pushed to GitHub: ${repoName}`);
  } catch (error) {
    console.error(
      `Failed to initialize and push repository: ${repoName}`,
      error.message
    );
  }
}

// Function to create and push multiple repositories
async function createMultipleRepos(baseName, count) {
  const repositories = Array.from({ length: count }, (_, i) => `${baseName} ${i + 1}`);
  for (const repo of repositories) {
    await createRepo(repo);
    await initializeAndPushRepo(repo);
  }
}

// Function to add contributions
const makeCommits = (n) => {
  if (n === 0) return simpleGit().push();
  const x = random.int(0, 54);
  const y = random.int(0, 6);
  const date = moment().subtract(1, "y").add(1, "d").add(x, "w").add(y, "d").format();

  const data = { date: date };
  console.log(date);
  jsonfile.writeFile(path, data, () => {
    simpleGit().add([path]).commit(date, { "--date": date }, makeCommits.bind(this, --n));
  });
};

// Function to prompt user
function promptUser() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.question("Choose an option:\n1. Add Repository\n2. Add Contributions\nYour choice: ", (choice) => {
    if (choice === "1") {
      rl.question("Enter base name for repositories: ", (baseName) => {
        if (!baseName.trim()) {
          console.error("Base name cannot be empty.");
          rl.close();
          return;
        }

        rl.question("Enter the number of repositories to create: ", async (countInput) => {
          const count = parseInt(countInput, 10);
          if (isNaN(count) || count <= 0) {
            console.error("Please enter a valid number.");
            rl.close();
            return;
          }

          await createMultipleRepos(baseName.trim(), count);
          rl.close();
        });
      });
    } else if (choice === "2") {
      rl.question("Enter number of contributions to add: ", (contriCount) => {
        const count = parseInt(contriCount, 10);
        if (isNaN(count) || count <= 0) {
          console.error("Please enter a valid number.");
          rl.close();
          return;
        }

        makeCommits(count);
        rl.close();
      });
    } else {
      console.log("Invalid choice.");
      rl.close();
    }
  });
}

// Run the script
promptUser();
