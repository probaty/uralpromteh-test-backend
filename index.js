const app = require("express")();
const PORT = 8080;

const rp = require("request-promise");
const requestOptions = {
  method: "GET",
  uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
  // uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=1&aux=logo",
  qs: {
    start: "1",
    limit: "30",
    convert: "USD",
  },
  headers: {
    "X-CMC_PRO_API_KEY": "4d7a3144-4f34-40e4-869b-1bbdc8db7535",
  },
  json: true,
  gzip: true,
};

app.get("/coins", async (req, res) => {
  const data = await fetchCoins();
  res.status(200).send(data);
});

app.listen(PORT, async () => {
  console.log("server started");
});

async function fetchCoins() {
  let data = {};
  await rp(requestOptions)
    .then((response) => {
      data = response.data;
    })
    .catch((err) => {
      console.log("API call error:", err.message);
    });

  data = data.map((el) => {
    return {
      id: el.id,
      name: el.name,
      symbol: el.symbol,
      price: el.quote.USD.price,
      change_1h: el.quote.USD.percent_change_1h,
      change_24h: el.quote.USD.percent_change_24h,
      market_cap: el.quote.USD.market_cap,
      last_updated: el.quote.USD.last_updated,
    };
  });

  const coinsId = data.map((el) => el.id).join(",");

  await rp({
    method: "GET",
    uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info",
    qs: {
      id: coinsId,
      aux: "logo",
    },
    headers: {
      "X-CMC_PRO_API_KEY": "4d7a3144-4f34-40e4-869b-1bbdc8db7535",
    },
    json: true,
    gzip: true,
  })
    .then((response) => {
      data = data.map((el) => {
        return { ...el, logo: response.data[`${el.id}`].logo };
      });
    })
    .catch((err) => {
      console.log("API call error:", err.message);
    });

  return data;
}
