const { spawn } = require("child_process");
const { exit } = require("process");

const zork = spawn("npm", ["start"]);

function abortTest() {
  zork.kill();
  process.exit(1);
}

const timer = setTimeout(() => {
  console.error("TEST TOOK TOO LONG!");
  abortTest();
}, 20000);

const expectedStrings = [
  "ZORK I: The Great Underground Empire",
  "There is a small mailbox here",
  "Opening the small mailbox reveals a leaflet",
  "Do you wish to leave the game",
];

zork.on("close", (code) => {
  if (code === 0 && expectedStrings.length === 0) {
    console.log("Test completed successfully!");
  } else {
    console.error(`Unfound strings: ${expectedStrings}`);
    console.error("Test failed.");
    exit(1);
  }
  clearTimeout(timer);
});

zork.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);

  for (let i = expectedStrings.length - 1; i >= 0; i--) {
    const expectedString = expectedStrings[i];
    if (`${data}`.includes(expectedString)) {
      console.log(`FOUND: "${expectedString}"`);
      expectedStrings.splice(i, 1);
    }
  }
});

zork.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

zork.stdin.write("open mailbox\r");
zork.stdin.write("quit\r");
zork.stdin.write("Y\r");
zork.stdin.end();
