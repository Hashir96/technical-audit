const puppeteer = require('puppeteer-extra')
const {executablePath} = require('puppeteer')
const prompt = require("prompt-sync")({ sigint: true });
const fs = require("fs");
const SiteURL = prompt("Please enter the website URL (with the HTTPS protocol): ");

// Get domain name
  const parsedUrl = new URL(SiteURL);
  const parsedUrlh = parsedUrl.hostname;

puppeteer.launch({
    executablePath: executablePath(),
    headless: "new",
}).then(async browser => {

async function seoaudit(){
  console.log("Please wait")
  try {
    const page = await browser.newPage();
    await page.setViewport({width: 1366, height: 768});
     await page.goto(SiteURL, { timeout: 60000 });
     await page.waitForTimeout(1000);
     
     // Check title length
  const title = await page.title();
  const pagetitle = `Title: ${title}`;
  const titlelength = "\n"+`Title length: ${title.length}`;

  // Check meta description length
  const metaDescription = await page.$eval(
    'meta[name="description"]',
    (element) => element.content
  );
  const metadesc = "\n\n"+`Meta description: ${metaDescription}`;
  const metalength = "\n"+`Meta description length: ${metaDescription.length}`;

  // Check header usage
  const headers = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) =>
    elements.map((element) => ({
      tagName: element.tagName,
      text: element.innerText,
    }))
  );
  const pageheaders = `Headings: ${JSON.stringify(headers, null, 2)}`;

  // Check alt attribute usage on images
  const images = await page.$$eval('img', (elements) =>
    elements.map((element) => ({
      src: element.src,
      alt: element.alt,
    }))
  );
  const pageimages = "\n\n-----------------------------------------------------\n\n"+`Images: ${JSON.stringify(images, null, 2)}`;

// Remove characters from URL for file naming
const URLreplace = SiteURL.replace(':',"")
const URLName = URLreplace.split('/').join("");
  const fileName = "siteaudit-"+URLName+".txt"

  // Check if file exists  
  if (fs.existsSync(fileName)){
    fs.writeFileSync(fileName,"", err => {if (err){console.log(err);}})
  }

  // // ...
  fs.appendFileSync(fileName, pagetitle, err => {if (err){console.log(err);}});
  fs.appendFileSync(fileName, titlelength, err => {if (err){console.log(err);}});
  fs.appendFileSync(fileName, metadesc, err => {if (err){console.log(err);}});
  fs.appendFileSync(fileName, metalength, err => {if (err){console.log(err);}});

  //Sitemap+Robots test
const sitemap = await page.goto("https://"+parsedUrlh+"/sitemap.xml");
await page.waitForTimeout(1000);
const sitemapstatusCode = sitemap.status();

const sitemapcheck = sitemapstatusCode;

if (sitemapcheck == '200') {
  const xmlsitemap = await page.evaluate(el => el.innerText, await page.$x('//*[contains(text(), "User-agent")]'));
  const sitemapT = "\n\nURL:"+ page.url()+"\nStatus Code: "+ sitemapstatusCode+"\nSitemap exists";
  fs.appendFileSync(fileName, sitemapT, err => {if (err){console.log(err);}});
}
else{
    const sitemapT = "\n\nURL:"+ page.url()+"\nStatus Code: "+ sitemapstatusCode+"\nXML Sitemap does not exist"
    fs.appendFileSync(fileName, sitemapT, err => {if (err){console.log(err);}});
}

  // ...
    const response = await page.goto("https://"+parsedUrlh+"/robots.txt");
    await page.waitForTimeout(1000);
    const statusCode = response.status();
  
  const check = statusCode;

    if (check == '200') {
      const robotstxt = await page.evaluate(el => el.innerText, await page.$x('//*[contains(text(), "User-agent")]'))
      const robotsT = "\n\nURL:"+ page.url()+"\nStatus Code: "+ statusCode+"\nRobots.txt exists\n\n"
      fs.appendFileSync(fileName, robotsT, err => {if (err){console.log(err);}});
    }
    else{
    const robotsT = "\n\nRobots.txt does not exist"+"\nStatus Code: "+ statusCode+"\nURL:"+ page.url()
    fs.appendFileSync(fileName, robotsT, err => {if (err){console.log(err);}});
    }

      // ...
  fs.appendFileSync(fileName, pageheaders, err => {if (err){console.log(err);}});
  fs.appendFileSync(fileName, pageimages, err => {if (err){console.log(err);}});
  
    console.log('\nSuccess, please find the text file containing the results\n');

  } catch (e) {
    console.log("Error"+e)

  } finally {
    await browser.close();
    console.log('\nPress any key to exit');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
  }

  await browser.close();
};

seoaudit();

});