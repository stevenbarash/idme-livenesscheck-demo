const express = require("express");
const session = require("express-session");
const { Issuer, Strategy } = require("openid-client");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "a-very-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.urlencoded({ extended: true }));

let idmeClient;

// Initialize ID.me OIDC client
Issuer.discover("https://api.idmelabs.com/oidc")
  .then((idmeIssuer) => {
    idmeClient = new idmeIssuer.Client({
      client_id: process.env.IDME_CLIENT_ID,
      client_secret: process.env.IDME_CLIENT_SECRET,
      redirect_uris: [`http://localhost:${port}/callback`],
      response_types: ["code"],
    });
    console.log("ID.me OIDC client initialized");
  })
  .catch((err) => {
    console.error("Failed to initialize ID.me OIDC client:", err);
    process.exit(1);
  });

// HTML template
const htmlTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Change Phone Number</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    form { margin-top: 20px; }
    input[type="tel"] { width: 100%; padding: 10px; margin: 10px 0; }
    button { cursor: pointer; }
  </style>
</head>
<body>
  <h1>Change Phone Number</h1>
  ${content}
</body>
</html>
`;

// Routes
app.get("/", (req, res) => {
  const content = req.session.verified
    ? `
      <form method="post" action="/change-phone-number">
      <h1>You have successfully verified your identity. Please update your phone number below.</h1>
        <label for="new_phone_number">New Phone Number:</label>
        <input type="tel" id="new_phone_number" name="new_phone_number" required>
        <button type="submit">Change Phone Number</button>
      </form>
    `
    : `
      <p>To change your phone number, you need to complete a verification with ID.me.</p>
        <a href="/start-verification">
          <img src="https://developers.id.me/assets/buttons/rectangle-solid-sign-c1d3504ddef6e9f65531da61fb31addb58d43af739b4e735ece4d1a25667258b.svg" alt="Verify with ID.me" style="width: 200px; height: auto;">
        </a>

    `;

  res.send(htmlTemplate(content));
});

app.get("/start-verification", (req, res) => {
  const authorizationUrl = idmeClient.authorizationUrl({
    scope:
      "openid liveness_always",
    response_type: "code",
  });
  res.redirect(authorizationUrl);
});

app.get("/callback", async (req, res) => {
  const params = idmeClient.callbackParams(req);
  try {
    const tokenSet = await idmeClient.callback(
      `http://localhost:${port}/callback`,
      params,
      { response_type: "code" }
    );
    req.session.idmeToken = tokenSet;
    req.session.verified = true;
    res.redirect("/");
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(500).send("Authentication failed");
  }
});

app.post("/change-phone-number", (req, res) => {
  if (!req.session.verified) {
    return res.redirect("/");
  }

  const newPhoneNumber = req.body.new_phone_number;
  // Here you would typically update the phone number in your system
  res.send(
    htmlTemplate(
      `<p>Phone number successfully changed to ${newPhoneNumber}</p>`
    )
  );
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
