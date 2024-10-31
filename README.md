# sample-react-app-poc

### Steps
1. Create SPAs for each region in IS Console and share them with your child organizations.
2. For each application, enable `orgnization_switch` grant.
3. For each region, complete `app-{region}/src/config.json` in the following format.
```json
{
    "clientID": "<CLIENT-ID>",
    "baseUrl": "https://localhost:9443",
    "signInRedirectURL": "http://localhost:3000",
    "signOutRedirectURL": "http://localhost:3000",
    "scope": ["openid", "profile", "roles", "groups", "email"],
    "orgId": "<CHILD-ORG-ID>",
    "parentOrgId": "<PARENT-ORG-ID>"
}
```
4. Run each app by executing the following command.
```bash
cd app-{region}
npm install && npm start
```
