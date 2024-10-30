# sample-react-app-poc

### Steps
1. Create an SPA in IS Console.
2. Complete `src/config.json` in the following format.
```json
{
    "clientID": "<CLIENT-ID>",
    "baseUrl": "https://localhost:9443",
    "signInRedirectURL": "http://localhost:3000",
    "signOutRedirectURL": "http://localhost:3000",
    "scope": ["openid profile"],
    "orgId": "<CHILD-ORG-ID>"
}
```
3. Run the server by executing the follwoing command.
```bash
npm install && npm start
```
