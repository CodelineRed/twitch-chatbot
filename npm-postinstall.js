const fs = require('fs');
const sources = [
    "./src/app/gulpfile.dist.json",
    "./src/app/chatbot.dist.json",
    "./data/chatbot.dist.sqlite3"
];
const targets = [
    "./src/app/gulpfile.json",
    "./src/app/chatbot.json",
    "./data/chatbot.sqlite3"
];

for (let i = 0; i < sources.length; i++) {
    if (!fs.existsSync(targets[i])) {
        fs.copyFile(sources[i], targets[i], (err) => {
            if (err) {
                throw err;
            }

            console.log(`${sources[i]} was copied to ${targets[i]}`);
        });
    }
}
