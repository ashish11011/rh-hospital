const apiKey = "rahul:Rahul@12345";

if (!apiKey) {
  throw new Error("API_KEY is missing");
}

const encodedKey = Buffer.from(apiKey, "utf8").toString("base64");
console.log(encodedKey);