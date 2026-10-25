
import { useState } from "react";
import api from "../api";

function CodeGeneration() {
  const [requirement, setRequirement] = useState("");

  // Code generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Validation state
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  // for apply button 
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");

  // Step 1: Generate code using the backend
  async function handleGenerate(event) {
    event.preventDefault();
    setError("");
    setValidationError("");
    setValidationResult(null);
    setResult(null);

    if (!requirement.trim()) {setError("Please enter a requirement.");return;}

    try {
      setLoading(true);
      const response = await api.post("/generation/request",{requirement: requirement.trim(),});
      setResult(response.data);
    } catch (err) {setError(err.response?.data?.detail ||"Code generation failed. Check the backend.");
    } finally {setLoading(false);}
  }

  // Step 2: Get the generated text
  const generatedCode =
    result?.generated_code ??
    result?.code ??
    result?.output ??
    "";
  const targetFile = generatedCode.match(/Suggested file path\.?\s*[-:\n]*\s*`?([^`\s\n]+)`?/i)?.[1] ?? "";

  const detectedLanguage =  /\.(jsx|tsx)$/i.test(targetFile) ? "React JSX/TSX"
    : /\.(js|ts)$/i.test(targetFile) ? "JavaScript/TypeScript"
    : /\.py$/i.test(targetFile) ? "Python" : "Unknown";
  
  
  const codeMatch = generatedCode.match(/```(?:jsx|javascript|js|tsx|typescript|ts|python|py)[ \t]*\r?\n([\s\S]*?)```/i);

  const proposedCode = codeMatch?.[1]?.trim() ?? "";


  // Step 3: Validate generated Python code
  
  // Step 3: Validate code according to its programming language
  async function handleValidateCode() {

    setValidationError("");
    setValidationResult(null);
    setApplyMessage("");
    setApplyError("");

    if (!targetFile || !proposedCode) {setValidationError("A target file and a code proposal are required.");
      return;
    }

    const extension = targetFile.split(".").pop().toLowerCase();
    try {
      setValidating(true);

      let response;

      if (extension === "py") {
        // Python code uses the existing Python validator.
        response = await api.post("/validation/python", {code: proposedCode,});} 

      else if (["js", "jsx", "ts", "tsx"].includes(extension) ) {
        // JavaScript and JSX use the new Babel validator.
        response = await api.post("/validation/frontend", {target_file: targetFile,code: proposedCode,});}
       else {setValidationError(`Validation is not supported for ${targetFile}.` ); return; }

      setValidationResult(response.data);

    } catch (err) {setValidationError(err.response?.data?.detail || err.message ||"Validation request failed.");
    } finally {setValidating(false); }
  }



  // async function handleValidateCode() {
  //   setValidationError("");
  //   setValidationResult(null);

  //   if (detectedLanguage !== "Python") {
  //     setValidationError(`The Python validator cannot validate ${detectedLanguage} code.`);
  //     return;
  //   }

  //   if (typeof generatedCode !== "string" || !generatedCode.trim() ) {
  //     setValidationError("No generated code is available to validate.");
  //     return;
  //   }   

  //   // Extract Python code from a Python Markdown code block.
  //   // If the AI returns no code block, use the complete text.
  //   const codeBlock = generatedCode.match(/```(?:python|py)[ \t]*\r?\n([\s\S]*?)```/i);

  //   if (!codeBlock) {
  //     setValidationError("This proposal contains no Python code block. The current validator only checks Python syntax.React/JavaScript validation is not implemented yet. ");
  //     return;
  //   }

  //   const codeToValidate = codeBlock[1].trim();

  //   try {
  //     setValidating(true);

  //     const response = await api.post("/validation/python",{code: codeToValidate,});
  //     setValidationResult(response.data);
  //   } catch (err) {setValidationError(err.response?.data?.detail ||err.message ||"Validation request failed.");
  //   } finally {setValidating(false);}
  // }
  
  async function handleApplyCode() {
    setApplyMessage("");
    setApplyError("");

    if (!targetFile || !proposedCode) {setApplyError("A target file and code proposal are required.");return;}
    if (!validationResult?.valid) {setApplyError("Please validate the code successfully before applying it.");return; }
    const confirmed = window.confirm(`Apply the proposed code to ${targetFile}? A backup will be created first.`);
    if (!confirmed) return;
    
    try {
      setApplying(true);
      const response = await api.post("generation/apply", {target_file: targetFile,code: proposedCode,approved: true,});
      setApplyMessage(`Updated ${response.data.target_file}. Backup: ${response.data.backup_file}`);
    } catch (err) {setApplyError(err.response?.data?.detail || "Could not apply the code.");
    } finally {setApplying(false);}
  }



  return (
    <div className="generation-page">
      <h1>AI Code Generation</h1>

      <p>Enter a requirement to generate code using your existing repository and AI model.</p>

      {/* Code generation form */}
      <form className="generation-card" onSubmit={handleGenerate} >

        <label htmlFor="generation-requirement">Requirement</label>
        <textarea id="generation-requirement" value={requirement}onChange={(event) =>setRequirement(event.target.value)}placeholder="Describe the code you want to generate..."rows={7}minLength={10}maxLength={5000}
          required
        />

        <button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate Code"}</button>

      </form>

      {/* Loading message */}
      {loading && (<p role="status">Analyzing the repository and generating code...</p>)}

      {/* Generation error */}
      {error && (<p className="error-message" role="alert">{error}</p>)}


      {/* Generation result */}
      {result && (
        <section className="generation-card">
          <h2>Generation Result</h2>

          {result.status && (<p><strong>Status:</strong> {result.status}</p>)}

          {result.repository && (<p><strong>Repository:</strong> {result.repository}</p>)}

          {result.requirement && (<p><strong>Requirement:</strong> {result.requirement}</p>)}

          {/* Files used as AI context */}
          {result.context_files?.length > 0 && (
            <>
              <h3>Files Analyzed for Generation</h3>
              <ul>
                {result.context_files.map((file) => (<li key={file}>{file}</li>))}
              </ul>
            </>
          )}


          {/* Generated code proposal */}
          <h3>Generated Code Proposal</h3>

          <p><strong>Target file:</strong>{" "}{targetFile || "Not identified"}</p>
          <p><strong>Detected language:</strong>{" "}{detectedLanguage}</p>


          { generatedCode ? (
            <pre className="generated-code">
              <code>{generatedCode}</code>
            </pre>) : ( <p>The backend responded, but no generated code field was found.</p> ) 
          }
          
          <h3>Review Proposed Change</h3>
          <p><strong>Target:</strong> {targetFile || "Not identified"}</p>

          {proposedCode ? (<pre className="generated-code"><code>{proposedCode}</code>
            </pre>) : (<p>No supported fenced code block was found.</p>)
          }

          {/* <button type="button"onClick={handleApplyCode} disabled={applying || !targetFile || !proposedCode}>
            {applying ? "Applying..." : "Approve and Apply Code"}
          </button> */}
                    
          <button type="button" onClick={handleApplyCode}
                  disabled={applying ||validating ||!targetFile ||!proposedCode ||!validationResult?.valid}>
            {applying ? "Applying..." : "Approve and Apply Code"}
          </button>




          {applyMessage && (<p role="status">{applyMessage}</p>)}

          {applyError && (<p className="error-message" role="alert">{applyError}</p>)}



          {/* Validate button */}
          <button type="button"onClick={handleValidateCode}disabled={validating || !generatedCode}>
            {validating ? "Validating...": "Validate Code"}
          </button>

          {/* ================================== Validation status ===================== */}

          <h3>Validation Results</h3>

          {validating && (<p role="status">Checking  {detectedLanguage} syntax...</p>)}

          {validationError && (<p className="error-message" role="alert">{validationError}</p>)}

          {validationResult && (
            <div className="validation-output">
              <p>
                <strong>Status:</strong>{" "}
                {validationResult.valid ? "Passed" : "Failed"}
              </p>

              {validationResult.checks?.map(
                (check, index) => (
                  <div key={`${check.name}-${index}`}>
                    <p>
                      <strong>{check.name}:</strong>{" "}
                      {check.passed ? "Passed" : "Failed"}
                    </p>

                    <p>{check.message}</p>
                  </div>
                )
              )}

              {validationResult.errors?.length > 0 && (
                <>
                  <h4>Errors</h4>
                  <ul>
                    {validationResult.errors.map((message, index) => (<li key={index}>{message}</li>))}
                  </ul>
                </>
              )}

              <details>
                <summary>View complete validation response</summary>
                <pre className="validation-output">{JSON.stringify(validationResult, null, 2)}</pre>
              </details>
            </div>
          )}

          {/* Complete backend response */}
          <details>
            <summary>View complete backend response</summary>
            <pre className="validation-output">{JSON.stringify(result, null, 2)}</pre>
          </details>
        </section>
      )}
    </div>
  );
}

export default CodeGeneration;


