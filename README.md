# sample-react-app-poc

### Steps
1. Create SPAs for each region in IS Console and share them with your child organizations.
2. Create another SPA for direct region access clients and share it with your child organizations.
3. For each application, enable `orgnization_switch` grant.
4. For each region, complete `app-{region}/src/config.json` in the following format.
```json
{
    "clientID": "<CLIENT-ID>",
    "us/caClientID": "<DIRECT-REGION-ACCESS-CLIENT-ID>",
    "baseUrl": "https://localhost:9443",
    "us/caBaseURL": "https://localhost:9443",
    "signInRedirectURL": "http://localhost:3000",
    "signOutRedirectURL": "http://localhost:3000",
    "scope": ["openid", "profile", "roles", "groups", "email"],
    "orgId": "<CHILD-ORG-ID>",
    "parentOrgId": "<PARENT-ORG-ID>",
    "endpoints": {
        "issuer": "https://localhost:9443/oauth2/token"
    }
}
```
5. Run each app by executing the following command.
```bash
cd app-{region}
npm install && npm start
```
