
import { parse } from "@babel/parser";

let source = "";

for await (const chunk of process.stdin) {source += chunk;}

const extension = process.argv[2]?.toLowerCase();

try {
  const plugins = [];

  if (extension === ".jsx" || extension === ".tsx") {plugins.push("jsx");}

  if (extension === ".ts" || extension === ".tsx") {plugins.push("typescript");}

  parse(source, {sourceType: "unambiguous",plugins,});

  console.log(JSON.stringify({valid: true,language: extension,errors: [],message: "Syntax is valid",} ));

} catch (error) {console.log(JSON.stringify({valid: false,
                language: extension,
                errors: [`Line ${error.loc?.line ?? "unknown"}: ${error.message}`, ],
                message: "Syntax validation failed", } ) );
                process.exitCode = 1;
                }
