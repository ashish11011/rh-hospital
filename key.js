const apiKey = "AD70A13B08748AA8D9EC4622D1DDD1"; // Replace with your actual API key

const encodedApiKey = Buffer.from(apiKey, "utf8").toString("base64");
console.log(encodedApiKey);