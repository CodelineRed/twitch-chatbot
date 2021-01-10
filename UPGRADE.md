### Upgrade in general
- Stop chatbot
- Follow the instructions below
- Start chatbot `$ node chatbot.js`

### Upgrade from 1.5.0 to 1.6.0
Nothing you have to do.

### Upgrade from 1.4.0 to 1.5.0
Add `"performance": 1,` or `"performance": 0,` in `src/app/chatbot.json`

### Upgrade from 1.3.0 to 1.4.0
Add `"backup": true,` or `"backup": false,` in `src/app/chatbot.json`

### Upgrade from 1.2.x to 1.3.0
`$ node migration.js -f version-1.3.0`

### Upgrade from 1.1.0 to 1.2.x
Nothing you have to do.

### Upgrade from 1.0.x to 1.1.0
Nothing you have to do.
