const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const tk = require("@danielgutierrez/tiktokdownloaders");
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const queryString = require('querystring');
const { URLSearchParams } = require('url');
const { TiktokDownloader } = require("@tobyg74/tiktok-api-dl")
const url = require('url');
const atob = require('atob');
const { JSDOM } = require('jsdom');
const port = 3000;

app.get("/", (req, res) => {
  res.send("official ethos api, lol. made by shehajeez on discord!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

async function decodeTokenData(token) {
    let data = token.split(".")[1];
    data = Buffer.from(data, 'base64').toString();
    return JSON.parse(data);
}

app.get('/api/codex/bypass', async (req, res) => {
    const sessionToken = req.query.token;
    const stage = parseInt(req.query.stage);

    if (!sessionToken || isNaN(stage) || stage < 1 || stage > 3) {
        return res.status(400).json({ bypassed: 'stage parameter required, ethos cant complete all at once cuz of vercel timing out lol' });
    }

    try {
        let response = await fetch('https://api.codex.lol/v1/stage/stages', {
            method: 'GET',
            headers: {
                'Android-Session': sessionToken
            }
        });
        let data = await response.json();

        if (!data.success) {
            throw new Error("Failed to get stages");
        }

        const stages = data.authenticated ? [] : data.stages;
        const validatedTokens = [];

        let stageData = stages[stage - 1];
        if (!stageData) {
            return res.status(404).json({ error: 'Stage not found' });
        }

        let stageId = stageData.uuid;

        response = await fetch('https://api.codex.lol/v1/stage/initiate', {
            method: 'POST',
            headers: {
                'Android-Session': sessionToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stageId })
        });
        data = await response.json();

        if (!data.success) {
            throw new Error("Failed to initiate stage");
        }

        let initToken = data.token;

        await new Promise(resolve => setTimeout(resolve, 6000)); // Simulating sleep for 6 seconds

        let tokenData = await decodeTokenData(initToken);
        let referrer;

        if (tokenData.link.includes('loot-links')) {
            referrer = 'https://loot-links.com/';
        } else if (tokenData.link.includes('loot-link')) {
            referrer = 'https://loot-link.com/';
        } else {
            referrer = 'https://linkvertise.com/';
        }

        response = await fetch('https://api.codex.lol/v1/stage/validate', {
            method: 'POST',
            headers: {
                'Android-Session': sessionToken,
                'Content-Type': 'application/json',
                'Task-Referrer': referrer
            },
            body: JSON.stringify({ token: initToken })
        });
        data = await response.json();

        if (!data.success) {
            throw new Error("Failed to validate stage");
        }

        let validatedToken = data.token;
        validatedTokens.push({ uuid: stageId, token: validatedToken });
        console.log(`${stageId} validated`);

        let stageMessage = `Ethos completed Stage ${stage} successfully`;

        res.status(200).json({ bypassed: stageMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/codexxxx/bypass', async (req, res) => {
    const link = req.query.link;
    if (!link) {
        return res.status(400).send('ethos detected codex link is missing');
    }

    // Extracting session token from the link query parameter
    const sessionToken = new URL(link).searchParams.get("token");
    if (!sessionToken) {
        return res.status(400).send('Token parameter is missing in the link');
    }

    async function getStages(session) {
        let response = await fetch('https://api.codex.lol/v1/stage/stages', {
            method: 'GET',
            headers: {
                'Android-Session': session
            }
        });
        let data = await response.json();

        if (data.success) {
            if (data.authenticated) {
                return [];
            }
            return data.stages;
        } else {
            throw new Error("Failed to get stages");
        }
    }

    async function initiateStage(session, stageId) {
        let response = await fetch('https://api.codex.lol/v1/stage/initiate', {
            method: 'POST',
            headers: {
                'Android-Session': session,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stageId })
        });
        let data = await response.json();

        if (data.success) {
            return data.token;
        } else {
            throw new Error("Failed to initiate stage");
        }
    }

    async function validateStage(session, token, referrer) {
        let response = await fetch('https://api.codex.lol/v1/stage/validate', {
            method: 'POST',
            headers: {
                'Android-Session': session,
                'Content-Type': 'application/json',
                'Task-Referrer': referrer
            },
            body: JSON.stringify({ token })
        });
        let data = await response.json();

        if (data.success) {
            return data.token;
        } else {
            throw new Error("Failed to validate stage");
        }
    }

    async function authenticate(session, validatedTokens) {
        let response = await fetch('https://api.codex.lol/v1/stage/authenticate', {
            method: 'POST',
            headers: {
                'Android-Session': session,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tokens: validatedTokens })
        });
        let data = await response.json();

        if (data.success) {
            return true;
        } else {
            throw new Error("Failed to authenticate");
        }
    }

    function decodeTokenData(token) {
        let data = token.split(".")[1];
        data = Buffer.from(data, 'base64').toString();
        return JSON.parse(data);
    }

    try {
        let stages = await getStages(sessionToken);
        let validatedTokens = [];

        for (let stage of stages) {
            let stageId = stage.uuid;
            let initToken = await initiateStage(sessionToken, stageId);

            // Simulating sleep for 6 seconds
            await new Promise(resolve => setTimeout(resolve, 6000));

            let tokenData = decodeTokenData(initToken);
            let referrer;

            if (tokenData.link.includes('loot-links')) {
                referrer = 'https://loot-links.com/';
            } else if (tokenData.link.includes('loot-link')) {
                referrer = 'https://loot-link.com/';
            } else {
                referrer = 'https://linkvertise.com/';
            }

            let validatedToken = await validateStage(sessionToken, initToken, referrer);
            validatedTokens.push({ uuid: stageId, token: validatedToken });
            console.log(`${stageId} validated`);

            // Simulating sleep for 1.5 seconds
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        if (await authenticate(sessionToken, validatedTokens)) {
            console.log('Bypass success :3');
            // Simulating sleep for 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));
          res.json({ bypassed: 'Ethos bypassed Codex successfully and has authenticated you.' });
            return;
        }
        res.send('Authentication failed');
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/api/tinylinkonl/bypass', (req, res) => {
  const link = req.query.link;

  if (!link) {
    return res.status(400).json({ error: 'Missing link query parameter' });
  }

  https.get(link, (response) => {
    if (response.statusCode === 301) {
      const bypassedLink = response.headers.location;
      return res.json({ bypassed: bypassedLink });
    } else {
      return res.status(400).json({ error: 'Not a redirect link' });
    }
  }).on('error', (err) => {
    return res.status(500).json({ error: 'Failed to fetch URL', details: err.message });
  });
});

app.get('/api/sub4unlockcom/bypass', async (req, res) => {
  const link = req.query.link;
  if (!link) {
    return res.status(400).json({ error: 'Missing link parameter' });
  }

  try {
    // Fetch HTML content from the URL
    const response = await axios.get(link);
    const html = response.data;
    if (!html) {
      return res.status(500).json({ error: 'Failed to fetch HTML' });
    }

    // Extract document.write content from the HTML
    const $ = cheerio.load(html);
    const documentWriteContent = $('#funh').val();
    if (!documentWriteContent) {
      return res.status(500).json({ error: 'Failed to extract document.write content' });
    }

    // Decode the document.write content and extract src attribute
    const decodedContent = unescape(documentWriteContent);
    const match = decodedContent.match(/src\s*=\s*"([^"]+)"/);
    if (!match || !match[1]) {
      return res.status(500).json({ error: 'Failed to decode document.write content or extract src attribute' });
    }

    // Replace /FL.php with /FLD.php in the src attribute
    const src = match[1].replace('/FL.php', '/FLD.php');

    // Visit the URL and extract window.open link
    const response2 = await axios.get(src);
    const html2 = response2.data;
    if (!html2) {
      return res.status(500).json({ error: 'Failed to fetch HTML for bypassed link' });
    }

    const $2 = cheerio.load(html2);
    const scriptContent = $2('script[type="text/javascript"]').html();
    const match2 = scriptContent.match(/window\.open\('([^']+)'\)/);
    if (!match2 || !match2[1]) {
      return res.status(500).json({ error: 'Failed to extract window.open link' });
    }

    // Return the bypassed link
    return res.json({ bypassed: match2[1] });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sub2unlocknet/bypass', async (req, res) => {
  try {
    // Extract the link parameter from the query string
    const link = req.query.link;

    if (!link) {
      return res.status(400).json({ error: 'link param required' });
    }

    // Make an HTTP GET request to the specified URL
    const response = await axios.get(link);

    // Load the HTML content of the response into Cheerio
    const $ = cheerio.load(response.data);

    // Extract the content of the div with id "theLinkID"
    const bypassedContent = $('#theLinkID').text().trim();

    // Return the bypassed content as a JSON response
    res.json({ bypassed: bypassedContent });
  } catch (error) {
    // If an error occurs, return an error message
    res.status(500).json({ error: 'error while bypassing' });
  }
});

app.get('/api/sub1s/bypass', async (req, res) => {
    try {
        const link = req.query.link;

        if (!link) {
            return res.status(400).json({ error: 'Link parameter is required' });
        }

        const response = await axios.get(link);
        const html = response.data;
        const $ = cheerio.load(html);

        // Find the script tag with type="text/javascript"
        const scriptContent = $('script[type="text/javascript"]').html();

        // Extract only the part containing setTimeout
        const setTimeoutScript = scriptContent.match(/setTimeout\(\(\) => {[\s\S]*?}, 3000\);/);

        // Extract the line with $('a[id="link"]').attr('href', '/l/FL6367722263I2');
        const hrefLineMatch = setTimeoutScript[0].match(/\$\('a\[id="link"\]'\)\.attr\('href', '([^']+)'\);/);
        const href = hrefLineMatch ? hrefLineMatch[1] : null;

        // Prepend "https://sub1s.com" to the href
        const resultLink = "https://sub1s.com" + href;

        // Follow the result link
        const resultResponse = await axios.get(resultLink);
        const resultHtml = resultResponse.data;
        const result$ = cheerio.load(resultHtml);

        // Extract the data-href attribute of the element with classes "unlock-step-link" and "getlink"
        const dataHref = result$('a.unlock-step-link.getlink').attr('data-href');

        res.json({ bypassed: dataHref });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/isgd/bypass', (req, res) => {
  const link = req.query.link;

  if (!link) {
    return res.status(400).json({ error: 'Missing link query parameter' });
  }

  https.get(link, (response) => {
    if (response.statusCode === 301) {
      const bypassedLink = response.headers.location;
      return res.json({ bypassed: bypassedLink });
    } else {
      return res.status(400).json({ error: 'Not a redirect link' });
    }
  }).on('error', (err) => {
    return res.status(500).json({ error: 'Failed to fetch URL', details: err.message });
  });
});

app.get('/api/rebrandlyy/bypass', (req, res) => {
  const link = req.query.link;

  if (!link) {
    return res.status(400).json({ error: 'Missing link query parameter' });
  }

  https.get(link, (response) => {
    if (response.statusCode === 301) {
      const bypassedLink = response.headers.location;
      return res.json({ bypassed: bypassedLink });
    } else {
      return res.status(400).json({ error: 'Not a redirect link' });
    }
  }).on('error', (err) => {
    return res.status(500).json({ error: 'Failed to fetch URL', details: err.message });
  });
});

app.get('/api/tinyurl/bypass', (req, res) => {
  const link = req.query.link;

  if (!link) {
    return res.status(400).json({ error: 'Missing link query parameter' });
  }

  https.get(link, (response) => {
    if (response.statusCode === 301) {
      const bypassedLink = response.headers.location;
      return res.json({ bypassed: bypassedLink });
    } else {
      return res.status(400).json({ error: 'Not a redirect link' });
    }
  }).on('error', (err) => {
    return res.status(500).json({ error: 'Failed to fetch URL', details: err.message });
  });
});


app.get('/api/vgd/bypass', async (req, res) => {
    try {
        // Extract the link parameter from the query string
        const link = req.query.link;

        // Fetch the HTML content of the provided link
        const response = await axios.get(link);

        // Load the HTML content into cheerio for easy DOM manipulation
        const $ = cheerio.load(response.data);

        // Find the <a> element with class "biglink" and get its href attribute
        const bypassedLink = $('a.biglink').attr('href');

        // Send the bypassed link as JSON response
        res.json({ bypassed: bypassedLink });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error:', error);
        res.status(500).json({ error: 'error' });
    }
});

app.get('/api/codewriter', async (req, res) => {
  try {
    const { msg } = req.query;

    // Check if msg parameter is provided
    if (!msg) {
      return res.status(400).json({ error: 'Message parameter is required' });
    }

    // Make POST request to Chad GPT API
    const response = await fetch('https://www.chad-gpt.ai/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://www.chad-gpt.ai/',
        'Origin': 'https://www.chad-gpt.ai/'
      },
      body: JSON.stringify({ prompt: "Your name is Ethos Code, you were created by Shehajeez. You may only write code and nothing else, if the user asks for something else say something along the lines of: I exist to write code, you may also respond to coding / code related questions and other stuff related to code. You shall now respond to this message:" + msg }),
    });

    if (!response.ok) {
      throw new Error('failed to fetch response');
    }

    // Send the response body as JSON with "message" field
    const responseBody = await response.text();
    res.json({ message: responseBody });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/assistant', async (req, res) => {
  try {
    const { msg } = req.query;

    // Check if msg parameter is provided
    if (!msg) {
      return res.status(400).json({ error: 'Message parameter is required' });
    }

    // Make POST request to Chad GPT API
    const response = await fetch('https://www.chad-gpt.ai/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://www.chad-gpt.ai/',
        'Origin': 'https://www.chad-gpt.ai/'
      },
      body: JSON.stringify({ prompt: "Your name is EthosAI, you were created by Shehajeez and now you shall give a response to this message" + msg }),
    });

    if (!response.ok) {
      throw new Error('failed to fetch response');
    }

    // Send the response body as JSON with "message" field
    const responseBody = await response.text();
    res.json({ message: responseBody });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/valyse/bypass', async (req, res) => {
  try {
    const startTime = Date.now(); // Record start time

    const { link } = req.query;
    if (!link) {
      return res.status(400).json({ error: 'Missing link parameter' });
    }

    // Extract device_id from the link
    const deviceId = link.split('device_id=')[1];
    if (!deviceId) {
      return res.status(400).json({ error: 'Invalid link parameter format' });
    }

    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'DNT': '1',  // Do Not Track Request Header
      'Connection': 'close',
      'Referer': 'https://linkvertise.com'
    };

    const urls = [
      `https://valyse.best/verification?device_id=${deviceId}`,
      'https://valyse.best/verification?checkpoint=2',
      'https://valyse.best/verification?completed=true'
    ];

    const getContent = async (url) => {
      try {
        const response = await axios.get(url, { headers });
        return response.data;
      } catch (error) {
        console.error('Error fetching content:', error);
        return null;
      }
    };

    const promises = urls.map(url => getContent(url));
    const responses = await Promise.all(promises);

    const html = responses[responses.length - 1];
    const dom = new JSDOM(html);
    const text = dom.window.document.querySelector('p.flex.items-center.gap-2.text-gray-500').textContent.trim();

    const endTime = Date.now(); // Record end time
    const timeElapsed = endTime - startTime; // Calculate elapsed time

    // Convert milliseconds to a human-readable format
    const timeElapsedFormatted = formatTime(timeElapsed);

    res.json({ 
      bypassed: "Ethos has bypassed and completed your Valyse Keysystem successfully",
      time_elapsed: timeElapsedFormatted // Include time_elapsed field
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to format milliseconds to a human-readable format
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hours`;
  }
  const days = Math.floor(hours / 24);
  return `${days} days`;
}

app.get('/api/discord/user/lookup', async (req, res) => {
    try {
        const url = 'https://api.discord.name/graphql';

        const data = {
            operationName: 'Discord',
            query: `
                query Discord($userId: String!) {
                    discord {
                        lookup(userId: $userId) {
                            user {
                                id
                                type
                                username
                                displayName
                                accountAge
                                createdAt
                                creationTimestamp
                                badges {
                                    title
                                    description
                                    url
                                    __typename
                                }
                                profileAppearance {
                                    accentColor
                                    avatar {
                                        url
                                        __typename
                                    }
                                    avatarDecoration
                                    banner {
                                        url
                                        __typename
                                    }
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                }
            `,
            variables: {
                userId: req.query.id
            }
        };

        const response = await axios.post(url, data);

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error:', error.response.status, error.response.data);
        res.status(error.response.status).json({ error: error.response.data });
    }
});

app.get('/api/bothosting', (req, res) => {
  const token = req.query.token;

  const options = {
    method: 'POST',
    headers: {
      'Referer': 'https://bot-hosting.net/panel/earn',
      'Origin': 'https://bot-hosting.net',
      'Content-Type': 'application/json',
      'Authorization': token
    }
  };

  fetch('https://bot-hosting.net/api/freeCoins', options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.get('/api/roblox/delta/keysystem/bypass', async (req, res) => {
    try {
        const { link } = req.query;
        const id = extractIdFromLink(link);

        if (!id) {
            return res.status(400).json({ message: 'Invalid link.' });
        }

        const headers = {
            'Content-Type': 'application/json',
            'Referer': 'https://gateway.platoboost.com'
        };

        // Sending a POST request
        const postResponse = await fetch(`https://api-gateway.platoboost.com/v1/sessions/auth/8/${id}`, {
            method: 'POST',
            headers: headers,
            // Add any body data here if needed
        });

        // Assuming the POST request is successful
        if (postResponse.ok) {
            // Sending a GET request
            const getResponse = await fetch(`https://api-gateway.platoboost.com/v1/authenticators/8/${id}`, {
                method: 'GET',
                headers: headers,
            });

            // Assuming the GET request is successful
            if (getResponse.ok) {
                const data = await getResponse.json();
                // Extracting key and sending response
                const bypassed = { bypassed: data.key };
                res.json(bypassed);
            } else {
                res.status(getResponse.status).json({ message: 'Failed to fetch data from authenticators endpoint' });
            }
        } else {
            res.status(postResponse.status).json({ message: 'Failed to authenticate session' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Function to extract ID from the link
function extractIdFromLink(link) {
    // You can implement your logic to extract the ID from the link here
    // For example, if the link is in the format 'https://example.com?id=123', you can extract it as:
    const url = new URL(link);
    return url.searchParams.get('id');
}




function getStatusMessage(statusCode) {
    switch (statusCode) {
        case 200:
            return 'API is online';
        case 404:
            return 'Not found';
        case 500:
            return 'Internal Server Error ';
        default:
            return 'Unknown (Maybe offline?)'; // For any other status code
    }
}

app.get('/api/linkvertise/bypass/status', async (req, res) => {
    try {
        const response = await axios.get('https://dlr-linkvertise-api.vercel.app/api/linkvertise?url=https://linkvertise.com/48193/krnlc4', {
            headers: {
                'Referer': 'https://delorean.pages.dev',
                'Origin': 'https://delorean.pages.dev'
            },
            validateStatus: false // Disable axios's default behavior of throwing for non-2xx responses
        });

        const statusMessage = getStatusMessage(response.status);
        const getbypassed =  response.data.result
      

        res.json({ status: statusMessage, statusCode: response.status, result: getbypassed });
    } catch (error) {
        // Handle error if request fails
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API route
app.get('/api/linkvertise/bypasss/status', async (req, res) => {
    try {
        const response = await axios.get('https://dlr-api-w.vercel.app', {
            headers: {
                'Referer': 'https://delorean.pages.dev',
                'Origin': 'https://delorean.pages.dev'
            },
            validateStatus: false // Disable axios's default behavior of throwing for non-2xx responses
        });

        const statusMessage = getStatusMessage(response.status);

        res.json({ status: statusMessage, statusCode: response.status });
    } catch (error) {
        // Handle error if request fails
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const supportedadstuff = [
    "Linkvertise (may sometimes not work)",
    "Linkvertise Dynamic",
    "Rekonise",
    "MBoost",
    "Boost.ink",
    "Sub2Get",
    "Sub2Unlock.com",
    "SocialWolvez",
    "Work.ink (may sometimes not work)",
    "v.gd",
    "tinyurl.com",
    "rebrand.ly",
    "is.gd",
    "sub2unlock.net",
    "sub4unlock.com",
    "tinylink.onl"
];

app.get('/api/adlinks/supported', (req, res) => {
    res.json(supportedadstuff);
});

app.get('/api/linkvertise/bypass', (req, res) => {
  const link = req.query.link;

  if (!link) {
    return res.status(400).json({ error: 'no link param provided' });
  }

  const linkvertiseApiUrl = `https://delorean-free-api.woozym.workers.dev/api/linkvertise?url=${encodeURIComponent(link)}`;

  https.get(linkvertiseApiUrl, (linkvertiseApiResponse) => {
    let data = '';

    linkvertiseApiResponse.on('data', (chunk) => {
      data += chunk;
    });

    linkvertiseApiResponse.on('end', () => {
      try {
        const bypassedLink = JSON.parse(data).result;
        // Check if the result contains the specified message
        if (bypassedLink.includes("This url is already in our system, please wait while the first instance got bypassed")) {
          return res.json({ bypassed: "Ethos is trying to bypass this link, please retry bypassing!" });
        } else if (bypassedLink.includes("The api is getting an INSANE Overload (like 500 requests per second), please retry your bypass in 10 mins")) {
          return res.json({ bypassed: "Ethos has returned an overload of the API. Please try again in about 10 minutes." });
        }
        res.json({ bypassed: bypassedLink });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }).on('error', (error) => {
    console.error('Error sending linkvertise request:', error);
    res.status(500).json({ error: 'Internal server error' });
  });
});

app.get('/api/linkvertise/bypassssssss', async (req, res) => {
    try {
        // Extracting the link parameter from the query string
        const { link } = req.query;

        // Checking if the link parameter is present
        if (!link) {
            return res.status(400).json({ error: 'Link parameter is required' });
        }

        // Setting up headers including Referer
        const headers = {
            Referer: 'https://delorean.pages.dev'
        };

        // Sending a request to the linkvertise bypass API with custom headers
        const response = await axios.get(`https://dlr-linkvertise-api.vercel.app/api/linkvertise?url=${encodeURIComponent(link)}`, {
            headers
        });

        // Extracting the bypassed field from the response
        const bypassed = response.data.result;

        // Sending the bypassed field in the response
        res.json({ bypassed });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/linkvertise/bypasssssssss', (req, res) => {
  const link = req.query.link;

  if (!link) {
    return res.status(400).json({ error: 'no link param wtf' });
  }

  const dlrApiUrl = 'https://dlr-api-w.vercel.app';
  const dlrApiHeaders = {
    'Authorization': 'Bearer Delorean_T90151130355702199092780928792828907U',
    'Origin': 'delorean.pages.dev',
    'Referer': 'delorean.pages.dev/bypass'
  };

  const dlrApiOptions = {
    method: 'GET',
    headers: dlrApiHeaders
  };

  // First request to dlr-api-w.vercel.app
  const dlrApiReq = https.request(dlrApiUrl, dlrApiOptions, (dlrApiResponse) => {
    let data = '';

    // A chunk of data has been received.
    dlrApiResponse.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received.
    dlrApiResponse.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        const apiUrl = "https://dlr-api.woozym.workers.dev/"

        // Second request to the extracted apiUrl
        const bypassUrl = `${apiUrl}/?url=${encodeURIComponent(link)}`;
        const bypassOptions = {
          method: 'GET',
          headers: dlrApiHeaders
        };

        const bypassReq = https.request(bypassUrl, bypassOptions, (bypassResponse) => {
          let bypassData = '';

          // A chunk of data has been received.
          bypassResponse.on('data', (chunk) => {
            bypassData += chunk;
          });

          // The whole response has been received.
          bypassResponse.on('end', () => {
            try {
              const bypassJsonData = JSON.parse(bypassData);
              const bypassedLink = bypassJsonData.result;
              res.json({ bypassed: bypassedLink });
            } catch (error) {
              console.error('Error parsing JSON:', error);
              res.status(500).json({ error: 'Internal server error' });
            }
          });
        });

        bypassReq.on('error', (error) => {
          console.error('Error sending bypass request:', error);
          res.status(500).json({ error: 'Internal server error' });
        });

        // End the bypass request
        bypassReq.end();

      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });

  dlrApiReq.on('error', (error) => {
    console.error('Error sending dlr-api-w request:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

  // End the dlr-api-w request
  dlrApiReq.end();
});



app.get('/api/pickuplines', async (req, res) => {
    try {
        // Fetch data from the external API
        const response = await axios.get('https://api.jcwyt.com/pickup');

        // Extract the pickup line from the response
        let pickupLine = response.data;

        // Remove {author} and {answer} from the pickup line
        pickupLine = pickupLine.replace(/\{author\}/g, '').replace(/\{answer\}/g, ' ');

        // Send the modified pickup line in the response
        res.json({ pickup: pickupLine });
    } catch (error) {
        // Handle errors
        console.error('Error fetching pickup line:', error);
        res.status(500).json({ error: 'Failed to fetch pickup line' });
    }
});

app.get('/api/ip', async (req, res) => {
  try {
    // Extract IP address from x-forwarded-for header and take the first part
    const ipAddress = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress;

    // Construct JSON response with the IP address
    const jsonResponse = {
      ip: ipAddress
    };

    // Send the JSON response back to the client
    res.json(jsonResponse);
  } catch (error) {
    // If there's an error, send an error response
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/ip/info', async (req, res) => {
  try {
    // Extract IP address from x-forwarded-for header and take the first part
    let ipAddress = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress;

    let apiUrl = 'http://ip-api.com/json/';

    // Check if IP parameter is provided, if yes, construct the API URL accordingly
    if (req.query.ip) {
      ipAddress = req.query.ip;
    }

    apiUrl += ipAddress;

    // Fetch data from the constructed API URL
    const response = await axios.get(apiUrl);

    // Modify the response data
    const modifiedData = {
      ip: response.data.query,
      countrycode: response.data.countryCode,
      regionname: response.data.regionName,
      ...response.data
    };
    delete modifiedData.status;
    delete modifiedData.query;
    delete modifiedData.countryCode;
    delete modifiedData.regionName

    // Send the modified response data back to the client
    res.json(modifiedData);
  } catch (error) {
    // If there's an error, send an error response
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/adlinks/bypass', async (req, res) => {
    try {
        const url = req.query.url; // Extract URL parameter from query string

        // Define regex patterns for different URL formats
        const linkvertisePattern = /^https:\/\/linkvertise\.com\/\d+\/\d+\.\d+\/dynamic/;
        const linkvertise2Pattern = /^https:\/\/linkvertise\.com\/\d+\/\w+/;
        const mboostPattern = /^https:\/\/mboost\.me\/a\/\w+/;
        const sub2unlockPattern = /^https:\/\/sub2unlock\.com\/\w+/;
        const rekonisePattern = /^https:\/\/rekonise\.com\/\w+/;
        const letsboostPattern = /^https:\/\/letsboost\.net\/\w+/;
        const sub2getPattern = /^https:\/\/sub2get\.com\/link\?l=\d{4,}$/;
        const socialwolvezPattern = /^https?:\/\/(?:socialwolvez\.com\/app\/l\/|scwz\.me\/)/;
        const boostinkPattern = /^https:\/\/boost\.ink\/\w+/;
        const lootlinksPattern = /^https?:\/\/(?:loot-link\.com\/|loot-links\.com\/|lootlinks\.co\/|lootdest\.info\/|lootdest\.org\/|links-loot\.com\/|linksloot\.net\/|lootlink\.org\/).*/;
        const platoboostdeltaPattern = /^https:\/\/gateway\.platoboost\.com\/a\/8\?id=\w+/;
        const workinkPattern = /^https:\/\/work\.ink\/\w+\/\w+/; // "workink" regex pattern
        const valysePattern = /^https:\/\/valyse\.best\/verification\?device_id=/;
      const vgdPattern = /^https:\/\/v\.gd\/[A-Za-z0-9]+/;
      const rebrandlyRegex = /^https?:\/\/rebrand\.ly\/[\w\d]+$/i;
      const tinyUrlRegex = /^https?:\/\/tinyurl\.com\/[\w\d]+$/i;
      const isGdRegex = /^https?:\/\/is\.gd\/[\w\d]+$/i;
      const sub1sregex = /^https?:\/\/sub1s\.com\/[A-Z]{2}\d{10}[A-Z]{2}$/i;
      const sub2unlocknet = /^https:\/\/sub2unlock\.net\/[a-zA-Z0-9]+$/;
      const sub4unlockcom = /https:\/\/sub4unlock\.com\/ZFL2\/\?\$=1038556/;
      const tinylinkonl = /https:\/\/tinylink\.onl\/[A-Za-z0-9]+/;
      const codex = /^https?:\/\/(?:mobile\.codex\.lol)(?:\/\S*)?(?:\?token=[\w.-]+)?$/;





        // Match the URL against the patterns
        if (linkvertisePattern.test(url)) {
            // Send request to the corresponding API route for Linkvertise
            const response = await axios.get(`https://ethos-testing.vercel.app/api/linkvertise/dynamic?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (linkvertise2Pattern.test(url)) {
            // Send request to the corresponding API route for Linkvertise 2
            const response = await axios.get(`https://ethos-testing.vercel.app/api/linkvertise/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (mboostPattern.test(url)) {
            // Send request to the corresponding API route for mboost
            const response = await axios.get(`https://ethos-testing.vercel.app/api/mboost/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (sub2unlockPattern.test(url)) {
            // Send request to the corresponding API route for sub2unlock
            const response = await axios.get(`https://ethos-testing.vercel.app/api/sub2unlock/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (rekonisePattern.test(url)) {
            // Send request to the corresponding API route for rekonise
            const response = await axios.get(`https://ethos-testing.vercel.app/api/rekonise/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (letsboostPattern.test(url)) {
            // Send request to the corresponding API route for letsboost
            const response = await axios.get(`https://ethos-testing.vercel.app/api/letsboost/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (sub2getPattern.test(url)) {
            // Send request to the corresponding API route for sub2get
            const response = await axios.get(`https://ethos-testing.vercel.app/api/sub2get/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (socialwolvezPattern.test(url)) {
            // Send request to the corresponding API route for socialwolvez
            const response = await axios.get(`https://ethos-testing.vercel.app/api/socialwolvez/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (boostinkPattern.test(url)) {
            // Send request to the corresponding API route for boostink
            const response = await axios.get(`https://ethos-testing.vercel.app/api/boostink/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (lootlinksPattern.test(url)) {
            // Send request to the corresponding API route for lootlinks
            const response = await axios.get(`https://ethos-testing.vercel.app/api/test/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (platoboostdeltaPattern.test(url)) {
            // Send request to the corresponding API route for platoboost
            const response = await axios.get(`https://ethos-testing.vercel.app/api/roblox/delta/keysystem/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (workinkPattern.test(url)) {
            // Send request to the corresponding API route for workink
            const response = await axios.get(`https://ethos-testing.vercel.app/api/linkvertise/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else if (valysePattern.test(url)) {
            // Send request to the corresponding API route for valyse
            const response = await axios.get(`https://ethos-testing.vercel.app/api/valyse/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
          } else if (vgdPattern.test(url)) {
            // Send request to the corresponding API route for valyse
            const response = await axios.get(`https://ethos-testing.vercel.app/api/vgd/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
          } else if (rebrandlyRegex.test(url)) {
            // Send request to the corresponding API route for valyse
            const response = await axios.get(`https://ethos-testing.vercel.app/api/rebrandlyy/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
          } else if (tinyUrlRegex.test(url)) {
            // Send request to the corresponding API route for valyse
            const response = await axios.get(`https://ethos-testing.vercel.app/api/tinyurl/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
          } else if (isGdRegex.test(url)) {
            // Send request to the corresponding API route for valyse
            const response = await axios.get(`https://ethos-testing.vercel.app/api/isgd/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
          } else if (sub1sregex.test(url)) {
            // Send request to the corresponding API route for valyse
            const response = await axios.get(`https://ethos-testing.vercel.app/api/sub1s/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
          } else if (sub2unlocknet.test(url)) {
            // Send request to the corresponding API route for valyse
            const response = await axios.get(`https://ethos-testing.vercel.app/api/sub2unlocknet/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
          } else if (sub4unlockcom.test(url)) {
            // Send request to the corresponding API route for valyse
            const response = await axios.get(`https://ethos-testing.vercel.app/api/sub4unlockcom/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
          } else if (tinylinkonl.test(url)) {
            // Send request to the corresponding API route for valyse
            const response = await axios.get(`https://ethos-testing.vercel.app/api/tinylinkonl/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
          } else if (codex.test(url)) {
            // Send request to the corresponding API route for valyse
            const response = await axios.get(`https://ethos-testing.vercel.app/api/codexxxx/bypass?link=${encodeURIComponent(url)}`);
            // Return the response received from the API route
            res.json(response.data);
        } else {
            // If URL pattern not recognized, return an error response
            res.status(400).json({ error: 'error, contact shehajeez on discord with your link parameter' });
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error:', error);
        res.status(500).json({ error: 'internal error lol contact shehajeez on discord' });
    }
});

        

app.get('/api/userscript/ethos.js', (req, res) => {
    const filePath = path.join(__dirname, 'userscript.js');

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // If file doesn't exist, send 404 Not Found status
            return res.status(404).json({ error: 'File not found' });
        }

        // Read the file content
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                // If there is an error reading the file, send 500 Internal Server Error status
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Send the file content as response
            res.send(data);
        });
    });
});

app.get('/api/letsboost/bypass', async (req, res) => {
    try {
        const { link } = req.query;

        // Fetch HTML content of the provided link
        const response = await axios.get(link);
        const html = response.data;

        // Load HTML content into cheerio for easy manipulation
        const $ = cheerio.load(html);

        // Find the script tag containing the JSON data
        const scriptTag = $('script').filter(function () {
            return $(this).text().includes('stepDat');
        }).first();

        // Extract JSON data from the script tag
        const jsonData = scriptTag.text().match(/\[.*?\]/s)[0];

        // Parse JSON data
        const parsedData = JSON.parse(jsonData);

        // Find the URL field next to "Continue"
        let url;
        parsedData.forEach(step => {
            if (step.optname === 'Continue') {
                url = step.url;
            }
        });

        // Send the URL in the response
        res.json({ bypassed: url });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to handle /api/boostink/bypass?link=LINK
app.get('/api/boostink/bypass', async (req, res) => {
  try {
    const link = req.query.link;
    if (!link) {
      return res.status(400).json({ error: 'Link parameter is missing' });
    }

    // Fetch HTML content from the provided link
    const response = await axios.get(link);
    const html = response.data;

    // Load HTML content into Cheerio for easy manipulation
    const $ = cheerio.load(html);

    // Search for the script tag containing bufpsvdhmjybvgfncqfa attribute
    const scriptTag = $('script[bufpsvdhmjybvgfncqfa]');

    if (!scriptTag || !scriptTag.attr('bufpsvdhmjybvgfncqfa')) {
      return res.status(404).json({ error: 'Value not found' });
    }

    // Get the value of bufpsvdhmjybvgfncqfa attribute
    const bufpsvdhmjybvgfncqfaValue = scriptTag.attr('bufpsvdhmjybvgfncqfa');

    // Make a GET request to decode the value
    const decodeResponse = await axios.get(`https://ethos-base64.vercel.app/base64/decode/${bufpsvdhmjybvgfncqfaValue}`);

    // Extract decoded JSON from the response
    const decodedJson = decodeResponse.data.decoded;

    // Return the decoded JSON as "bypassed" field
    res.json({ bypassed: decodedJson });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sub2get/bypass', async (req, res) => {
    try {
        const link = req.query.link;

        if (!link) {
            return res.status(400).json({ error: 'Link parameter is missing' });
        }

        // Fetch the page content
        const response = await axios.get(link);
        const html = response.data;

        // Load HTML content using Cheerio
        const $ = cheerio.load(html);

        // Find the <a> element with the id "updateHiddenUnlocks" and get its href attribute
        const bypassedHref = $('a#updateHiddenUnlocks').attr('href');

        if (!bypassedHref) {
            return res.status(404).json({ error: 'error' });
        }

        // Return the bypassed href as JSON
        res.json({ bypassed: bypassedHref });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/socialwolvez/bypass', async (req, res) => {
    // Extract the link from the query parameters
    const link = req.query.link;

    if (!link) {
        return res.status(400).json({ error: "Link parameter is missing" });
    }

    // Extract random stuff from the link
    let randomStuff;
    if (link.includes('socialwolvez.com/app/l/')) {
        randomStuff = link.split('socialwolvez.com/app/l/')[1];
    } else if (link.includes('scwz.me/')) {
        randomStuff = link.split('scwz.me/')[1];
    } else {
        return res.status(400).json({ error: "Invalid link format" });
    }

    try {
        // Make a request to the provided URL
        const response = await axios.get(`https://us-central1-social-infra-prod.cloudfunctions.net/linksService/link/guid/${randomStuff}`);

        // Extract only the URL from the response JSON
        const url = response.data.link.url;

        // Return the extracted URL as bypassed
        res.json({ bypassed: url });
    } catch (error) {
        console.error("Error fetching URL:", error);
        res.status(500).json({ error: "Error fetching URL" });
    }
});

app.get("/api/tiktok", async (req, res) => {
  try {
    const tiktoku = req.query.link;

    if (!tiktoku) {
      return res.status(400).json({ error: "no tiktok link provided" });
    }

    // Assuming tiktoku is the TikTok video URL
    TiktokDownloader(tiktoku, {
      version: "v2" // version: "v1" | "v2" | "v3"
    }).then((result) => {
      // Extract video and audio links from the result object
      const videoLink = result.result.video;
      const audioLink = result.result.music;

      // Create modified response object
      const modifiedr = {
        video: videoLink,
        audio: audioLink
      };

      // Send the modified response
      return res.json(modifiedr);
    }).catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/sub2unlock/bypass', async (req, res) => {
    const link = req.query.link;

    // Check if the link parameter is provided
    if (!link) {
        return res.status(400).json({ error: 'link is missing.' });
    }

    // Extracting the base URL without the random stuff at the end
    const parsedUrl = new URL(link);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    // Constructing the modified URL
    const modifiedUrl = `${baseUrl}/link/unlock${parsedUrl.pathname}`;

    try {
        // Fetch the HTML content of the modified URL
        const response = await axios.get(modifiedUrl);
        const html = response.data;

        // Load the HTML content into cheerio
        const $ = cheerio.load(html);

        // Extract the href of the <a> element with class "unlock-step-link getlink"
        const bypassed = $('a.unlock-step-link.getlink').attr('href');

        // Check if the href is found
        if (!bypassed) {
            return res.status(404).json({ error: 'Unlock link not found.' });
        }

        // Return the bypassed link as JSON
        res.json({msg: "this only works for sub2unlock.com links!", bypassed });
    } catch (error) {
        // Handle errors
        console.error('Error fetching or parsing HTML:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


app.get('/api/mboost/bypass', async (req, res) => {
    try {
        // Extract the link parameter from the query string
        const link = req.query.link;

        // Make a GET request to the mboost.me link
        const response = await axios.get(link);

        // Load the HTML content of the response into Cheerio
        const $ = cheerio.load(response.data);

        // Find the script element with id "__NEXT_DATA__"
        const nextDataScript = $('#__NEXT_DATA__');

        // Check if the script element exists
        if (nextDataScript.length) {
            // Extract the JSON content from the script
            const jsonContent = nextDataScript.html().trim();

            // Parse the JSON content
            const jsonData = JSON.parse(jsonContent);

            // Check if the JSON contains props and pageProps
            if (jsonData.props && jsonData.props.pageProps) {
                // Extract the targeturl from the data
                const targetUrl = jsonData.props.pageProps.data.targeturl;

                // Send the targetUrl as JSON response
                res.json({ bypassed: targetUrl });
            } else {
                throw new Error("error");
            }
        } else {
            throw new Error("error");
        }
    } catch (error) {
        // If any error occurs, send an error response
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/rekonise/bypass', async (req, res) => {
    try {
        const link = req.query.link;
        if (!link) {
            return res.status(400).json({ error: 'Link parameter is missing.' });
        }

        // Extract the slug from the link
        const slug = link.split('/').pop();

        // Construct the URL for the API request
        const apiUrl = `https://api.rekonise.com/social-unlocks/${slug}`;

        // Make a GET request to the Rekonise API
        const response = await axios.get(apiUrl);

        // Extract the url from the response
        const url = response.data.url;
        const title = response.data.title
        const views = response.data.views

        // Send the url as JSON
        res.json({ title: title, views: views, bypassed: url });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/greasyfork/install', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'ID parameter is missing' });
    }

    const response = await axios.get(`https://greasyfork.org/${id}`);
    const html = response.data;
    const $ = cheerio.load(html);
    const installLink = $('a.install-link').attr('href');

    if (!installLink) {
      return res.status(404).json({ error: 'Install link not found' });
    }

    // Decode the URL to remove percent encoding
    const decodedInstallLink = decodeURIComponent(installLink);

    res.json({ installlink: decodedInstallLink, msg: "Tampermonkey / Greasemonkey is required as the install link is an instant download link." });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/greasyfork/search', async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is missing.' });
        }

        const url = `https://greasyfork.org/en/scripts?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url);

        const $ = cheerio.load(response.data);
        const scripts = [];

        $('.script-link').each((index, element) => {
            const title = $(element).text().trim();
            const link = $(element).attr('href');
            scripts.push({ title, link });
        });

        $('.script-meta-block').each((index, element) => {
            let author = $(element).find('.script-list-author span').text().trim();
            author = author.replace('Author', '').trim();
            scripts[index].author = author;

            let dailyInstalls = $(element).find('.script-list-daily-installs').text().trim();
            dailyInstalls = dailyInstalls.replace('Daily installs', '').trim();
            scripts[index].dailyinstalls = dailyInstalls;

            let totalInstalls = $(element).find('.script-list-total-installs').text().trim();
            totalInstalls = totalInstalls.replace('Total installs', '').trim();
            scripts[index].totalinstalls = totalInstalls;

            const relativeTimeCreated = $(element).find('.script-list-created-date relative-time').attr('datetime');
            if (relativeTimeCreated) {
                const createdDate = new Date(relativeTimeCreated);
                const day = String(createdDate.getDate()).padStart(2, '0');
                const month = String(createdDate.getMonth() + 1).padStart(2, '0');
                const year = createdDate.getFullYear();
                const formattedCreatedDate = `${day}/${month}/${year}`;

                scripts[index].created = formattedCreatedDate;
            }

            const relativeTimeUpdated = $(element).find('.script-list-updated-date relative-time').attr('datetime');
            if (relativeTimeUpdated) {
                const updatedDate = new Date(relativeTimeUpdated);
                const day = String(updatedDate.getDate()).padStart(2, '0');
                const month = String(updatedDate.getMonth() + 1).padStart(2, '0');
                const year = updatedDate.getFullYear();
                const formattedUpdatedDate = `${day}/${month}/${year}`;

                scripts[index].updated = formattedUpdatedDate;
            }
        });

        $('.script-description.description').each((index, element) => {
            const description = $(element).text().trim();
            scripts[index].description = description;
        });

        res.json(scripts);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/api/roblox/valyse/checkpoints', async (req, res) => {
    try {
        const { device_id } = req.query;

        let createDeviceResponse;

        // Check if the device already exists
        try {
            createDeviceResponse = await axios.get(`https://api.valyse.best/api/create-device?device_id=${device_id}`);
            if (createDeviceResponse.data.message === 'device_already_exists') {
                console.log('Device already exists. Skipping creation.');
            }
        } catch (createDeviceError) {
            console.error('couldnt create device with that id since device already exists:', createDeviceError.response ? createDeviceError.response.data : createDeviceError.message);
        }

        // Make GET requests to both checkpoints
        const [checkpoint1Response, checkpoint2Response] = await Promise.all([
            axios.get(`https://api.valyse.best/checkpoint/1?device_id=${device_id}`),
            axios.get(`https://api.valyse.best/checkpoint/2?device_id=${device_id}`)
        ]);

        // Simulate a delay (0.5 seconds)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Function to get the final URL after redirection
        const getFinalUrl = async (response) => {
            try {
                const finalUrlResponse = await axios.head(response.request.res.responseUrl);
                return finalUrlResponse.request.res.responseUrl;
            } catch (error) {
                console.error('Error getting final URL:', error);
                return null;
            }
        };

        // Get the final URLs for both checkpoints
        const checkpoint1Url = await getFinalUrl(checkpoint1Response);
        const checkpoint2Url = await getFinalUrl(checkpoint2Response);

        // Prepare response JSON
        const responseData = {
            one: checkpoint1Url,
            two: checkpoint2Url
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const baseurl = 'https://api.a-gen.io/account?type=';
const ethosbase64url = 'https://ethos-base64.vercel.app/base64/decode/';
const validtypes = ['disney', 'callofduty', 'hulu', 'nordvpn', 'crunchyroll', 'steam', 'minecraft'];

app.get('/api/linkvertise/dynamic', async (req, res) => {
  try {
    // Extracting the link parameter from the query string
    const link = req.query.link;

    // Extracting the 'r' parameter from the link URL
    const urlParams = new URLSearchParams(link.split('?')[1]);
    const rParameter = urlParams.get('r');

    // Making a GET request to decode the 'r' parameter
    const decodeResponse = await axios.get(`https://ethos-base64.vercel.app/base64/decode/${rParameter}`);

    // Getting the decoded value
    const decodedValue = decodeResponse.data.decoded;

    // Sending the decoded value as JSON response
    res.json({ bypassed: decodedValue });
  } catch (error) {
    // Handling errors
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/linkvertise/dynamicc', async (req, res) => {
  const link = req.query.link;

  try {
    const queryParams = new URLSearchParams(link.split('?')[1]);
    const rParameter = queryParams.get('r');

    if (!rParameter) {
      throw new Error('"r" parameter is missing');
    }

    const ethosResponse = await axios.get(`${ethosbase64url}${encodeURIComponent(rParameter)}`);
    const decodedJson = ethosResponse.data;

    const bypassedLink = decodedJson.decoded;

    res.json({ "bypassed": bypassedLink });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/account/gentwo', async (req, res) => {
let type = req.query.type;
// Check if type is provided
if (!type) {
    return res.status(400).json({ error: 'Type parameter is missing.' });
}

type = type.toLowerCase(); // Convert type to lowercase

// Check if type is valid
const validTypes = [
    'crunchyroll',
    'origin',
    'steam',
    'disneyplus',
    'hulu',
    'nordvpn',
    'uplay',
    'funimation',
    'hbomax',
    'peacock',
    'paramount+'
];

if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid type parameter.' });
}

// Fetch URL using the provided type
try {
    const apiUrl = `https://gen.magicgen.xyz/${type}`;
    const response = await fetch(apiUrl, { redirect: 'manual' });
    if (!response.ok) {
        throw new Error('Failed to fetch data from external API.');
    }
    const redirectUrl = response.headers.get('location');
    if (!redirectUrl) {
        throw new Error('No redirect URL found.');
    }
    res.json({ redirectUrl }); // Return the redirect URL
} catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
}
  });

app.get('/api/account/gen/:type', async (req, res) => {
  const type = req.params.type.toLowerCase();

  if (!validtypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  try {
    const response = await axios.post(`${baseurl}${type}`);
    const adlink = response.data.adlink;
    const rparameter = adlink.split('=')[1];

    const ethosresponse = await axios.get(`${ethosbase64url}${rparameter}`);
    const decodedlink = ethosresponse.data.decoded;

    const urlparams = new URLSearchParams(decodedlink.split('?')[1]);
    const email = urlparams.get('email');
    const password = urlparams.get('password');

    res.json({ "email": email, "password": password });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/tiktokk", async (req, res) => {
  try {
    const tiktoku = req.query.link;

    if (!tiktoku) {
      return res
        .status(400)
        .json({ error: "no tiktok link provided" });
    }

    const result = await tk.tiktokdownload(tiktoku);
    const modifiedr = {
      video: result.nowm,
      audio: result.audio,
    };

    return res.json(modifiedr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/chatgpt", async (req, res) => {
  try {
    const message = req.query.msg;

    if (!message) {
      return res.status(400).json({ error: "provide msg= parameter" });
    }

    const api = "pk-fKeYIiWLtQTRUBIBRUGJAluIrtbbQbIaDglbTvuUNqoceQrs";

    const response = await axios.post(
      "https://api.pawan.krd/v1/chat/completions",
      {
        model: "pai-001-light",
        max_tokens: 15000,
        messages: [
          {
            role: "system",
            content:
              "Your name is EthosAI. You are a helpful assistant. You are a chatbot. Be simple and concise. I can respond in the same language that the user talks with me in.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${api}`,
          "Content-Type": "application/json",
        },
      },
    );

    const completion = response.data.choices[0].message.content;

    res.json({ message: completion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/minecraft/aristois/java", async (req, res) => {
  try {
    const response = await axios.get("https://aristois.net/download");
    const html = response.data;
    const $ = cheerio.load(html);
    const downloadlink = $('a[href^="https://gitlab.com"]').attr("href");

    if (downloadlink) {
      res.json({ download: downloadlink });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/alysse/android", async (req, res) => {
  try {
    const downloadlink = "UNAVAILABLE";

    if (downloadlink) {
      res.json({ download: downloadlink });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/codex/android", async (req, res) => {
  try {
    const downloadlink = "https://loot-links.com/s?fIjL";

    if (downloadlink) {
      res.json({ download: downloadlink });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/trigon/android", async (req, res) => {
  try {
    const downloadlink = "https://cutt.ly/SwNidEx4";

    if (downloadlink) {
      const response = await axios.get(downloadlink);

      if (!response.request.res.responseUrl) {
        throw new Error("failed lol");
      }

      const downloadlinkk = response.request.res.responseUrl;

      setTimeout(() => {
        res.json({ download: downloadlinkk });
      }, 1000);
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/codex/ios", async (req, res) => {
  try {
    const downloadlink = "https://loot-link.com/s?oaRn";

    if (downloadlink) {
      res.json({ download: downloadlink });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/codex/androidd", async (req, res) => {
  try {
    const response = await axios.get("https://codexexecutor.net/android/");

    const $ = cheerio.load(response.data);

    const downloadlink = $(".ub-button-container a").attr("href");

    if (downloadlink) {
      res.json({ download: downloadlink });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/arceus/androidd", async (req, res) => {
  try {
    const response = await axios.get("https://arceusx.com/");

    const $ = cheerio.load(response.data);

    const downloadlink = $("a.elementor-button-link.elementor-size-sm").attr(
      "href",
    );

    if (downloadlink) {
      res.json({ download: downloadlink });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/hydrogen/android", async (req, res) => {
  try {
    const response = await axios.get("https://hydrogen.sh/download");
    const $ = cheerio.load(response.data);
    const downloadlink = $(".mantine-UnstyledButton-root.mantine-Button-root.mantine-q2ce8d").attr("href");

    if (downloadlink) {
      // Making request to bypass URL
      const bypassedResponse = await axios.get(`https://ethos-testing.vercel.app/api/adlinks/bypass?url=${encodeURIComponent(downloadlink)}`);
      const bypassedData = bypassedResponse.data;

      if (bypassedData && bypassedData.bypassed) {
        res.json({ download: bypassedData.bypassed });
      } else {
        res.status(404).json({ error: "Bypassed link not found" });
      }
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/valyse/android", async (req, res) => {
  try {
    const response = await axios.get("https://valyse.best/#get-started");

    const $ = cheerio.load(response.data);

    const downloadlink = $("a.relative.btn").attr("href");

    if (downloadlink) {
      res.json({ download: downloadlink });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/vegax/android", async (req, res) => {
  try {
    const response = await axios.get("https://vegax.gg/download.html");

    const $ = cheerio.load(response.data);

    const scriptcontent = $("script")
      .filter(function () {
        return $(this).html().includes("location.href");
      })
      .html();

    const regex = /location\.href\s*=\s*["']([^"']+)["']/;
    const match = scriptcontent.match(regex);

    if (match && match[1]) {
      let downloadLink = match[1];

      // Transform the link from direct-link.net to linkvertise.com
      downloadLink = downloadLink.replace('https://direct-link.net', 'https://linkvertise.com');

      // Bypass the linkvertise URL
      const bypassedResponse = await axios.get(`https://ethos-testing.vercel.app/api/adlinks/bypass?url=${encodeURIComponent(downloadLink)}`);

      // Extract the plain text data from the bypassed response
      const bypassedData = bypassedResponse.data.bypassed;

      // Visit the bypassed URL and return the plaintext as download
      const downloadResponse = await axios.get(bypassedData);
      const downloadPlainText = downloadResponse.data;

      res.json({ download: downloadPlainText });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/fnaftwo/search', async (req, res) => {
    // Function to fetch image links
    async function getImageLinks(url) {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const links = $('.boxInner').map((_, elem) => {
                return "https://rule34.world" + $(elem).attr('href');
            }).get();
            return links;
        } catch (error) {
            console.error("Failed to fetch page:", error.response.status);
            return [];
        }
    }

    // Function to get content source
    async function getContentSource(url) {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const imgSrc = $('img.img.shadow-base').attr('src');
            if (imgSrc) {
                return { img: "https://rule34.world" + imgSrc };
            }
            const videoSrc = $('video.video.shadow-base.ng-star-inserted > source[type="video/mp4"]').attr('src');
            if (videoSrc) {
                return { vid: "https://rule34.world" + videoSrc };
            }
            return null;
        } catch (error) {
            console.error("Failed to fetch page:", error.response.status);
            return null;
        }
    }

    const query = req.query.query;
    const page = req.query.page || 1;
    const url = `https://rule34.world/${query}/page/${page}`;
    try {
        const imageLinks = await getImageLinks(url);
        const startTime = Date.now();
        res.write('['); // Start of JSON array
        let firstItem = true;
        for (const link of imageLinks) {
            const contentSource = await getContentSource(link);
            if (contentSource) {
                if (!firstItem) {
                    res.write(',');
                }
                res.write(JSON.stringify(contentSource));
                firstItem = false;
            }
            // Send a heartbeat every 5 seconds to keep the connection alive
            if (Date.now() - startTime > 20000) {
                res.write(' ');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            }
        }
        res.write(']'); // End of JSON array
        res.end(); // End the response
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/fnaf/search', async (req, res) => {
  const { query, page } = req.query;
  const results = [];

  let currentPage = page ? parseInt(page) : 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const url = `https://rule34ai.art/category/${query}/page/${currentPage}`;
    console.log(`Fetching page ${currentPage}...`);

    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      const links = [];

      // Extract title and href attributes from <a> tags and filter out unwanted titles
      $('a').each((_, element) => {
        const title = $(element).attr('title');
        const href = $(element).attr('href');
        if (title && href && !title.includes('Posts by R34Ai Art') && !title.includes('Upvote') && !title.includes('Downvote')) {
          links.push({ title, href });
        }
      });

      // Process each link
      for (const link of links) {
        try {
          const response = await axios.get(link.href);
          const html = response.data;
          const $ = cheerio.load(html);
          let figures = [];

          // Extract all figures matching the selector
          $('figure.wp-block-image.size-large a').each((_, element) => {
            const figure = $(element).attr('href');
            if (figure) {
              figures.push(figure);
            }
          });

          // If no figures found, try the alternative selector
          if (figures.length === 0) {
            const figure = $('figure.wp-block-image.size-full a').attr('href');
            if (figure) {
              figures.push(figure);
            }
          }

          // Add figures to results
          if (figures.length === 1) {
            results.push({ title: link.title, img: figures[0] });
          } else if (figures.length > 1) {
            // Create separate entries for each image
            figures.forEach(figure => {
              results.push({ title: `${link.title} - Image ${figures.indexOf(figure) + 1}`, img: figure });
            });
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }

      if (!page || currentPage === parseInt(page)) {
        hasMorePages = false; // Break loop if specific page is requested
      } else {
        currentPage++;
      }
    } catch (error) {
      hasMorePages = false;
      console.error('Error fetching page:', error);
    }
  }

  res.json(results);
});





app.get('/api/fnaff/search', async (req, res) => {
  const { query, page } = req.query;
  const results = [];

  let currentPage = page ? parseInt(page) : 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const url = `https://rule34ai.art/category/${query}/page/${currentPage}`;
    console.log(`Fetching page ${currentPage}...`);

    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      const links = [];

      // Extract title and href attributes from <a> tags and filter out unwanted titles
      $('a').each((_, element) => {
        const title = $(element).attr('title');
        const href = $(element).attr('href');
        if (title && href && !title.includes('Posts by R34Ai Art') && !title.includes('Upvote') && !title.includes('Downvote')) {
          links.push({ title, href });
        }
      });

      // Process each link
      for (const link of links) {
        try {
          const response = await axios.get(link.href);
          const html = response.data;
          const $ = cheerio.load(html);
          let figure = $('figure.wp-block-image.size-full a').attr('href');

          // If the first selector doesn't find the image, try the second one
          if (!figure) {
            figure = $('figure.wp-block-image.size-large a').attr('href');
          }

          if (figure) {
            results.push({ title: link.title, img: figure });
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }

      if (!page || currentPage === parseInt(page)) {
        hasMorePages = false; // Break loop if specific page is requested
      } else {
        currentPage++;
      }
    } catch (error) {
      hasMorePages = false;
      console.error('Error fetching page:', error);
    }
  }

  res.json(results);
});



app.get("/roblox/vegax/windows", async (req, res) => {
  try {
    const response = await axios.get("https://vegax.gg/hello.html");

    const $ = cheerio.load(response.data);

    const scriptcontent = $("script")
      .filter(function () {
        return $(this).html().includes("location.href");
      })
      .html();

    const regex = /location\.href\s*=\s*["']([^"']+)["']/;
    const match = scriptcontent.match(regex);

    if (match && match[1]) {
      const downloadlink = match[1];
      res.json({ download: downloadlink });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/arceus/ios", async (req, res) => {
  try {
    const downloadlink = "https://loot-links.com/s?mY0o";

    if (downloadlink) {
      res.json({ download: downloadlink });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roblox/arceus/android", async (req, res) => {
  try {
    const downloadlink = "https://loot-link.com/s?fAyE";

    if (downloadlink) {
      res.json({ download: downloadlink });
    } else {
      res.status(404).json({ error: "Download link not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/roblox/delta/android', async (req, res) => {
    try {
        // Fetch the URL
        const response = await fetch('https://deltaexploits.net/android_dl');

        // Check if response is successful
        if (!response.ok) {
            throw new Error('Failed to fetch URL');
        }

        // Get the final URL after redirects
        const finalUrl = response.url;

        // Send the final URL in JSON response
        res.json({ download: finalUrl });
    } catch (error) {
        // Handle any errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});
