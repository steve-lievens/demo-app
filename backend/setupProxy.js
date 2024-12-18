const { createProxyMiddleware } = require("http-proxy-middleware");
const { getAuthenticatorFromEnvironment } = require("ibm-watson/auth");
const cors = require("cors");
const bodyParser = require("body-parser");

const addAuthorization = async (req, _res, next) => {
  // look for authentication config from environment variables or `ibm-credentials.env` file
  const authenticator = getAuthenticatorFromEnvironment("discovery");
  try {
    const accessToken = await authenticator.tokenManager.getToken();
    req.headers.authorization = `Bearer ${accessToken}`;
  } catch (e) {
    console.error(e);
  }
  return next();
};

module.exports = async function (app) {
  const target = process.env.DISCOVERY_URL;
  app.use(
    "/api",
    addAuthorization,
    createProxyMiddleware({
      target,
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/",
      },
      onProxyReq: (proxyReq) => {
        // this prevents cryptic errors from the Watson Discovery service
        // when localhost cookies are sent along with the proxied request, overloading the request header size
        proxyReq.removeHeader("Cookie");
      },
      onProxyRes: (proxyRes) => {
        proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      },
      onError: (error) => {
        console.error(error);
      },
    })
  );
  app.use(bodyParser.json());
  app.options("*", cors());
};
