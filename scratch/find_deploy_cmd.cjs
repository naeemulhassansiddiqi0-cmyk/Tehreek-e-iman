const fs = require('fs');
const readline = require('readline');

async function searchTranscript() {
  const fileStream = fs.createReadStream('C:\\Users\\CoreCom\\.gemini\\antigravity\\brain\\dd668b2f-c9f7-40f5-bd87-9605ec6b011f\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('pages deploy') || line.includes('wrangler') || line.includes('git push')) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          for (const tc of obj.tool_calls) {
            if (tc.name === 'run_command') {
              console.log('FOUND DEPLOY COMMAND:', tc.args.CommandLine);
            }
          }
        }
      } catch (e) {}
    }
  }
}

searchTranscript();
