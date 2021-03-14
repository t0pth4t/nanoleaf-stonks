import * as config from "./config.json";
import fetch from "node-fetch";
import { Response } from "node-fetch";
let prevPrice: number = 0;
let curPrice: number = 0;
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

const getPrice = async (ticker) => {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${ticker}&to_currency=USD&apikey=${config.apiKey}`
  );
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.json()}`);
  }
  return await response.json();
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const run = async () => {
  while (true) {
    try {
      //   const { auth_token } = await getToken();
      const auth_token = config.auth_token;
      const {
        state: { on: value },
      } = await getInfo(auth_token);
      if (!value) {
        await togglePower(auth_token, true);
      }
      //   console.log(JSON.stringify(info));
      //   await togglePower(auth_token, false);

      await setEffect(auth_token, "Jack O Lantern");

      const response = await getPrice("DOGE");
      curPrice = parseFloat(response["5. Exchange Rate"]);
      if (prevPrice === 0) {
        prevPrice = curPrice;
      }
      if (curPrice > prevPrice) {
        await setEffect(auth_token, "Green");
      } else if (curPrice < prevPrice) {
        await setEffect(auth_token, "Reds");
      }
      prevPrice = curPrice;
      await sleep(30000);
    } catch (err) {
      console.error(err);
    }
  }
};

run();
