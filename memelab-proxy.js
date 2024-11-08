const { HttpsProxyAgent } = require("https-proxy-agent");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const colors = require("colors");
const readline = require("readline");

const configPath = path.join(process.cwd(), "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const baseUrl = 'https://api.memeslab.xyz/'

class Memelab {
  constructor() {
    this.headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      "Content-Type": "application/json",
      Origin: "https://game.memeslab.xyz",
      Referer: "https://game.memeslab.xyz/",
      "Sec-Ch-Ua":
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      "Sec-Ch-Ua-Mobile": "?1",
      "Sec-Ch-Ua-Platform": '"Android"',
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    };
    this.line = "~".repeat(42).white;
  }

  async waitWithCountdown(seconds) {
    for (let i = seconds; i >= 0; i--) {
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(
        `===== Đã hoàn thành tất cả tài khoản, chờ ${i} giây để tiếp tục =====`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("");
  }

  log(msg, proxyIP) {
    const time = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    console.log(`[zepmoo] [${time}] > ${proxyIP} | ${msg}`.cyan);
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async title() {
    console.clear();
    console.log(`
                        ███████╗███████╗██████╗ ███╗   ███╗ ██████╗ 
                        ╚══███╔╝██╔════╝██╔══██╗████╗ ████║██╔═══██╗
                          ███╔╝ █████╗  ██████╔╝██╔████╔██║██║   ██║
                         ███╔╝  ██╔══╝  ██╔═══╝ ██║╚██╔╝██║██║   ██║
                        ███████╗███████╗██║     ██║ ╚═╝ ██║╚██████╔╝
                        ╚══════╝╚══════╝╚═╝     ╚═╝     ╚═╝ ╚═════╝ 
                        `);
    console.log(
      colors.yellow(
        "Tool này được làm bởi Zepmo. Nếu bạn thấy hay thì hãy ủng hộ mình 1 subscribe nhé!"
      )
    );
    console.log(colors.blue("Contact Telegram: @zepmoairdrop \n"));
  }

  async login(data, proxy, index, proxyIP) {
    const url = baseUrl + "auth/login?" + data
    const header = {
        ...this.headers
    }
    try {
        const res = await axios.post(url, {}, {
            headers: header,
            httpsAgent: new HttpsProxyAgent(proxy)
        })
        if (res?.data?.api_token) {
            this.log(`[Account ${index}] Login successful!`.green, proxyIP)
            return res.data.api_token
        }
        else {
            this.log(`[Account ${index}] Login failed: ${res.data.message}`.red, proxyIP)
        }
    } catch (error) {
        this.log(`[Account ${index}] Login failed: ${error.message}`.red, proxyIP)
    }
}

async info(apiToken, proxy, index, proxyIP) {
    const url = baseUrl + "claims/info"
    const header = {
        ...this.headers,
        Authorization: `Bearer ${apiToken}`
    }
    try {
        const res = await axios.get(url, {
            headers: header,
            httpsAgent: new HttpsProxyAgent(proxy)
        })
        if (res?.data?.balance) {
            this.log(`[Account ${index}] Balance: ${res.data.balance} | Daily Income: ${res.data.dailyIncome}!`.magenta, proxyIP)
            return res.data
        }
        else {
            this.log(`[Account ${index}] Get info failed: ${res.data.message}`.red, proxyIP)
        }
    } catch (error) {
        this.log(`[Account ${index}] Get info failed: ${error.message}`.red, proxyIP)
    }
}

async claimDaily(apiToken, proxy, index, proxyIP, day) {
    const url = baseUrl + "claims/process"
    const header = {
        ...this.headers,
        Authorization: `Bearer ${apiToken}`
    }
    const payload = {
        "type": "DAILY_REWARDS",
        "day": day
    }
    try {
        const res = await axios.post(url, payload, {
            headers: header,
            httpsAgent: new HttpsProxyAgent(proxy)
        })
        if (res?.data?.rewards) {
            this.log(`[Account ${index}] (+) ${res.data.rewards} | Claim daily successful!`.green, proxyIP)
            return res.data.data
        }
        else {
            this.log(`[Account ${index}] Hôm nay đã điểm danh rồi`.yellow, proxyIP)
        }
    } catch (error) {
        this.log(`[Account ${index}] Claim daily failed: ${error.message}`.red, proxyIP)
    }
}

async getTasks(token, proxy, index, proxyIP) {
    const url = baseUrl + "claims/task/list?taskGroupId="
    const header = {
        ...this.headers,
        Authorization: `Bearer ${token}`
    }
    try {
        const res = await axios.get(url, {
            headers: header,
            httpsAgent: new HttpsProxyAgent(proxy)
        })
        if (res?.data?.data) {
            return res.data.data
        }
        else {
            this.log(`[Account ${index}] Get task list failed: ${res.data.message}`.red, proxyIP)
        }
    } catch (error) {
        this.log(`[Account ${index}] Get task list failed: ${error.message}`.red, proxyIP)
    }
}

async startTask(apiToken, proxy, index, proxyIP, task) {
  const url = baseUrl + "claims/task/start"
  const header = {
      ...this.headers,
      Authorization: `Bearer ${apiToken}`
  }
  const payload = {
      // "type": "TASK",
      "key": task.key
  }
  try {
      const res = await axios.post(url, payload, {
          headers: header,
          httpsAgent: new HttpsProxyAgent(proxy)
      })
      if (res?.data) {
          this.log(`[Account ${index}] Start task ${task?.name} successful!`.blue, proxyIP)
          return true
      }
      else {
          this.log(`[Account ${index}] Start task ${task?.name} failed: ${res.data.message}`.red, proxyIP)
      }
  } catch (error) {
      this.log(`[Account ${index}] Start task ${task?.name} failed: ${error.message}`.red, proxy)
  }
}

async claimTask(apiToken, proxy, index, proxyIP, task) {
  const url = baseUrl + "claims/process"
  const header = {
      ...this.headers,
      Authorization: `Bearer ${apiToken}`
  }
  const payload = {
      "type": "TASK",
      "key": task.key
  }
  try {
      const res = await axios.post(url, payload, {
          headers: header,
          httpsAgent: new HttpsProxyAgent(proxy)
      })
      if (res?.data?.rewards) {
          this.log(`[Account ${index}] (+) ${res.data.rewards} | Claim task ${task?.name} successful!`.green, proxyIP)
          return res.data.data
      }
      else {
          this.log(`[Account ${index}] Claim task ${task?.name} failed: ${res.data.message}`.red, proxyIP)
      }
  } catch (error) {
      this.log(`[Account ${index}] Claim task ${task?.name} failed: ${error.message}`.red, proxy)
  }
}

async getCards(apiToken, proxy, index, proxyIP) {
  const url = baseUrl + "mine"
  const header = {
      ...this.headers,
      Authorization: `Bearer ${apiToken}`
  }
  try {
      const res = await axios.get(url, {
          headers: header,
          httpsAgent: new HttpsProxyAgent(proxy)
      })
      if (res?.data?.data) {
          return res.data.data
      }
      else {
          this.log(`[Account ${index}] Get cards failed: ${res.data.message}`.red, proxyIP)
      }
  } catch (error) {
      this.log(`[Account ${index}] Get cards failed: ${error.message}`.red, proxyIP)
  }
}

async upgradeCard(apiToken, proxy, index, proxyIP, card) {
  const url = baseUrl + "mine"
  const header = {
      ...this.headers,
      Authorization: `Bearer ${apiToken}`
  }
  const payload = {
      "mineItemId": card._id
  }
  try {
      const res = await axios.post(url, payload, {
          headers: header,
          httpsAgent: new HttpsProxyAgent(proxy)
      })
      if (res?.data) {
          this.log(`[Account ${index}] Upgrade card ${card?.name} successful!`.blue, proxyIP)
          return true
      }
      else {
          this.log(`[Account ${index}] Upgrade card ${card?.name} failed: ${res.data.message}`.red, proxyIP)
      }
  }
  catch (error) {
      this.log(`[Account ${index}] Upgrade card ${card?.name} failed: ${error.message}`.red, proxyIP)
  } 
}

async cardProcess(token, proxy, index, proxyIP, balance) {
  let currentBalance = balance 
    let cards = await this.getCards(token, proxy, index, proxyIP)
    cards = cards.sort((a, b) => a.levelToAmountMap[a.userLevel] - b.levelToAmountMap[b.userLevel])
    if (cards) {
        for (const card of cards) {
            if (card?.userLevel < card?.maxLevel && config.min_balance <= currentBalance && currentBalance >= card.levelToAmountMap[card.userLevel+1]) {
                const upgrade = await this.upgradeCard(token, proxy, index, proxyIP, card)
                if (upgrade) {
                  currentBalance -= card.levelToAmountMap[card.userLevel+1]
                  await this.sleep(1000)
                }
            }
        }
    }
  }

  async process(data, proxy, index) {
    const proxyIP = proxy.split("@")[1] || "local";
    const apiToken = await this.login(data, proxy, index, proxyIP)
    if (apiToken) {
        const info = await this.info(apiToken, proxy, index, proxyIP)

        const daily = info?.daily
        await this.claimDaily(apiToken, proxy, index, proxyIP, daily?.daysRewarded)
        

        const tasks = await this.getTasks(apiToken, proxy, index, proxyIP)
        if (tasks && config.is_do_task) {
            for (const task of tasks) {
              if (task?.isCompleted === false) {
                const start = await this.startTask(apiToken, proxy, index, proxyIP, task)
              }
              else if (task?.isRewarded === false) {
                await this.claimTask(apiToken, proxy, index, proxyIP, task)
                await this.sleep(1000)
              }
            }   
        }

        if (config.is_upgrade_card) {
            await this.cardProcess(apiToken, proxy, index, proxyIP, info?.balance)
        }
    }
  }


  async main() {
    await this.title();
    const dataFile = path.join(__dirname, "data.txt");
    const data = fs
      .readFileSync(dataFile, "utf8")
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean);

    const proxyFile = path.join(__dirname, "proxy.txt");
    const proxyList = fs
      .readFileSync(proxyFile, "utf8")
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean);

    if (data.length <= 0) {
      this.log("No accounts added!".red);
      process.exit();
    }

    if (proxyList.length <= 0) {
      this.log("No proxies added!".red);
      process.exit();
    }

    while (true) {
      const threads = [];
      for (const [index, tgData] of data.entries()) {
        const proxy = proxyList[index] || proxyList[index % proxyList.length];
        threads.push(this.process(tgData, proxy, index + 1));
        if (threads.length >= config.threads) {
          console.log(`Running ${threads.length} threads process...`.bgYellow);
          await Promise.all(threads);
          threads.length = 0;
        }
      }
      if (threads.length > 0) {
        console.log(`Running ${threads.length} threads process...`.bgYellow);
        await Promise.all(threads);
      }
      await this.waitWithCountdown(config.wait_time);
    }
  }
}

if (require.main === module) {
  process.on("SIGINT", () => {
    process.exit();
  });
  new Memelab().main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
