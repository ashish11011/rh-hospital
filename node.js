const apiKey = "17FE74E3EC748DD97172184A207C12";

if (!apiKey) {
  throw new Error("API_KEY is missing");
}

const encodedKey = Buffer.from(apiKey, "utf8").toString("base64");
console.log(encodedKey);