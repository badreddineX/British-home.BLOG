const host = "britishhomeinterior.co.uk";
const key = "9595dbbe694c4c258d2ff56465dac2f7";
const keyLocation = `https://${host}/${key}.txt`;

const urlList = [
  "https://britishhomeinterior.co.uk/",
  "https://britishhomeinterior.co.uk/about/",
  "https://britishhomeinterior.co.uk/blog/",
  "https://britishhomeinterior.co.uk/blog/autumn-home-decor-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/bedroom-colour-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/bedroom-decor-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/bedroom-makeover-uk/",
  "https://britishhomeinterior.co.uk/blog/budget-home-makeover-uk/",
  "https://britishhomeinterior.co.uk/blog/christmas-home-decor-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/cosy-bedroom-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/cosy-home-decor-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/cottagecore-bedroom-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/cottagecore-home-decor-uk/",
  "https://britishhomeinterior.co.uk/blog/dark-moody-home-decor-uk/",
  "https://britishhomeinterior.co.uk/blog/hallway-decor-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/home-decor-inspiration-uk/",
  "https://britishhomeinterior.co.uk/blog/home-interior-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/how-to-style-a-living-room-uk/",
  "https://britishhomeinterior.co.uk/blog/kitchen-decor-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/kitchen-on-a-budget-uk/",
  "https://britishhomeinterior.co.uk/blog/living-room-budget-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/living-room-colour-schemes-uk/",
  "https://britishhomeinterior.co.uk/blog/living-room-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/maximalist-home-decor-uk/",
  "https://britishhomeinterior.co.uk/blog/maximalist-living-room-decor-uk/",
  "https://britishhomeinterior.co.uk/blog/modern-home-interior-uk/",
  "https://britishhomeinterior.co.uk/blog/rented-flat-makeover-uk/",
  "https://britishhomeinterior.co.uk/blog/rented-home-decor-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/small-living-room-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/small-living-room-layout-ideas/",
  "https://britishhomeinterior.co.uk/blog/spring-home-refresh-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/victorian-terrace-interior-ideas-uk/",
  "https://britishhomeinterior.co.uk/blog/winter-cosy-home-ideas-uk/",
  "https://britishhomeinterior.co.uk/privacy-policy/",
  "https://britishhomeinterior.co.uk/terms-of-use/",
  "https://britishhomeinterior.co.uk/thank-you/",
];

async function main() {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });
  console.log("Status:", res.status);
  console.log(await res.text());
}

main();
