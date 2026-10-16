import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const PORT = process.env.PORT || 3000;
const GRAPHQL_ENDPOINTS = {
  sit: {
    url: "https://sit-api-admin.sh-pxmer.co/graphql",
    origin: "https://sit-admin.sh-pxmer.co",
    referer: "https://sit-admin.sh-pxmer.co/",
    skiprefresh: "true"
  },
  uat: {
    url: "https://uat-api-admin.sh-pxmer.co/graphql",
    origin: "https://uat-admin.sh-pxmer.co",
    referer: "https://uat-admin.sh-pxmer.co/",
    skiprefresh: "true"
  }
};

const FRONT_GRAPHQL_ENDPOINTS = {
  sit: {
    url: "https://sit-api.sh-pxmer.co/graphql",
    origin: "https://sit.sh-pxmer.co",
    referer: "https://sit.sh-pxmer.co/",
    skiprefresh: "true"
  },
  uat: {
    url: "https://uat-api.sh-pxmer.co/graphql",
    origin: "https://uat.sh-pxmer.co",
    referer: "https://uat.sh-pxmer.co/",
    skiprefresh: "true"
  }
};

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};


function send(res, status, data, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*"
  });
  if (Buffer.isBuffer(data) || typeof data === "string") return res.end(data);
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return body;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type, authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
    return res.end();
  }
const requestUrl = new URL(req.url, "http://localhost");

if (requestUrl.pathname === "/api/front-graphql" && req.method === "POST") {
  const environment = requestUrl.searchParams.get("environment") || "sit";
  const target = FRONT_GRAPHQL_ENDPOINTS[environment];

  if (!target) {
    return send(res, 400, { error: "Unknown front GraphQL environment" });
  }

  try {
    const body = await readBody(req);
    const incomingAuth = req.headers.authorization || "";

    if (!incomingAuth) {
      return send(res, 401, { error: "Missing Authorization header" });
    }

    const apiRes = await fetch(target.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "*/*",
        "authorization": incomingAuth,
        "skiprefresh": target.skiprefresh,
        "platform": "web",
        "origin": target.origin,
        "referer": target.referer
      },
      body
    });

    const text = await apiRes.text();

    res.writeHead(apiRes.status, {
      "Content-Type": apiRes.headers.get("content-type") || "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    });

    return res.end(text);
  } catch (err) {
    return send(res, 500, { error: err.message });
  }
}


if (requestUrl.pathname === "/api/graphql" && req.method === "POST") {
  const environment = requestUrl.searchParams.get("environment") || "sit";
  const target = GRAPHQL_ENDPOINTS[environment];

  if (!target) {
    return send(res, 400, { error: "Unknown GraphQL environment" });
  }

  try {
    const body = await readBody(req);
    const incomingAuth = req.headers.authorization || "";

    if (!incomingAuth) {
      return send(res, 401, { error: "Missing Authorization header" });
    }

    console.log(
      `[GraphQL Proxy] POST ${target.url} | Auth: ${incomingAuth.slice(0, 18)}...`
    );

    const apiRes = await fetch(target.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "*/*",
        "authorization": incomingAuth,
        "skiprefresh": target.skiprefresh,
        "cookie": req.headers.cookie || "",
        "origin": target.origin,
        "referer": target.referer
      },
      body
    });

    const text = await apiRes.text();

    console.log(
      `[GraphQL Proxy] Response HTTP ${apiRes.status} | Body length: ${text.length}`
    );

    if (text.includes("error") || text.includes("errors")) {
      console.log(`[GraphQL Proxy Error Body]:\n${text}\n`);
    }

    res.writeHead(apiRes.status, {
      "Content-Type":
        apiRes.headers.get("content-type") || "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    });

    return res.end(text);
  } catch (err) {
    console.error("[GraphQL Proxy] Error:", err.message);
    return send(res, 500, { error: err.message });
  }
}
  let requested = decodeURIComponent((req.url || "/").split("?")[0]);
  if (requested === "/") requested = "/index.html";
  const filePath = path.normalize(path.join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) return send(res, 403, { error: "Forbidden" });

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, { error: "Not found" });
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mime[ext] || "application/octet-stream",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Sale Here STAR Data Tool: http://localhost:${PORT}`);
  console.log(`GraphQL proxy SIT: ${GRAPHQL_ENDPOINTS.sit.url}`);
  console.log(`GraphQL proxy UAT: ${GRAPHQL_ENDPOINTS.uat.url}`); 
});
