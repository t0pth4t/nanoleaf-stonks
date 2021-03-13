import * as config from "./config.json";
import fetch from "node-fetch";
import { Response } from "node-fetch";
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

const run = async () => {
  //   const { auth_token } = await getToken();
  const auth_token = config.auth_token;
  //   const info = await getInfo(auth_token);
  //   console.log(JSON.stringify(info));
  //   await togglePower(auth_token, false);
  //   await togglePower(auth_token, true);
  await setEffect(auth_token, "Green");
};

run();
