import * as config from "./config.json";
import fetch from "node-fetch";
import { Response } from "node-fetch";
let prevPrice: number = 0;
let curPrice: number = 0;
let useTokenOne = true;
const getToken = async () => {
  const requestOptions = {
    method: "POST",
  };

  const response: Response = await fetch(
    `http://${config.ipAddress}/api/v1/new`,
    { method: "POST" }
  );
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.json()}`);
  }
  return await response.json();
};

const getInfo = async (auth_token) => {
  const response = await fetch(
    `http://${config.ipAddress}/api/v1/${auth_token}/`
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.json()}`);
  }
  return await response.json();
};

const togglePower = async (auth_token: string, on: boolean) => {
  const response = await fetch(
    `http://${config.ipAddress}/api/v1/${auth_token}/state`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        on: {
          value: on,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.json()}`);
  }
  return await response.text();
};

const setEffect = async (auth_token: string, effect: string) => {
  const response = await fetch(
    `http://${config.ipAddress}/api/v1/${auth_token}/effects`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        select: effect,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }
  return await response.text();
};

const getPrice = async (ticker, useTokenOne) => {
  const apiKey = useTokenOne ? config.apiKey : config.apiKey2;
  const response = await fetch(
    `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${ticker}&to_currency=USD&apikey=${apiKey}`
  );
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.json()}`);
  }
  return await response.json();
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const stockLights = async (auth_token) => {
  useTokenOne = !useTokenOne;
  const symbols = ["DOGE", "BTC", "ETH"];
  const requests = symbols.map((sym) => getPrice(sym, useTokenOne));
  const responses = await Promise.all(requests);
  console.log(responses);
  curPrice = responses
    .map((r) =>
      parseFloat(r["Realtime Currency Exchange Rate"]["5. Exchange Rate"])
    )
    .reduce((acc, price) => {
      acc += price;
      return acc;
    }, 0);

  console.info(`Most Recent Price Is: ${curPrice}`);
  if (prevPrice === 0) {
    prevPrice = curPrice;
  }
  console.info(`Previous Price Is: ${prevPrice}`);
  if (curPrice > prevPrice) {
    console.info("Setting to: Green");
    await setEffect(auth_token, "Green");
  } else if (curPrice < prevPrice) {
    console.info("Setting to: Red");
    await setEffect(auth_token, "Reds");
  }
  prevPrice = curPrice;
};

const run = async () => {
  const auth_token = config.auth_token;
  const info = await getInfo(auth_token);
  console.log(JSON.stringify(info));
  let {
    state: {
      on: { value },
    },
  } = info;
  console.info(`Power is: ${value ? "on" : "off"}`);
  if (!value) {
    console.info("Hello Smithers, you're quite good at turning me on");
    await togglePower(auth_token, true);
  }
  while (true) {
    try {
      const currentHour = new Date().getHours();
      if (currentHour >= 9 && currentHour <= 18) {
        await stockLights(auth_token);
      } else if (value) {
        console.info("Thats enough stonks for today");
        await setEffect(auth_token, "moonlight");
        await togglePower(auth_token, false);
        value = !value;
      }

      await sleep(120000);
    } catch (err) {
      console.error(err);
    }
  }
};
console.info("Started!");
run();
