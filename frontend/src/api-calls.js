// --------------------------------------------------------------------------
// API : Get some env variables from the node.js backend
// --------------------------------------------------------------------------
export async function getEnvironment() {
  try {
    console.log("INFO : api-calls.js getEnvironment : start");
    const response = await fetch("/getEnvironment");
    console.log("INFO : api-calls.js getEnvironment : end");
    return await response.json();
  } catch (error) {
    return {};
  }
}

// --------------------------------------------------------------------------
// API : Get COS bucket listing
// --------------------------------------------------------------------------
export async function sendGetBucketContents() {
  try {
    console.log("INFO : api-calls.js sendGetBucketContents : start");
    const response = await fetch("/getBucketContent");
    console.log("INFO : api-calls.js sendGetBucketContents : end");
    return await response.json();
  } catch (error) {
    return {};
  }
}

// --------------------------------------------------------------------------
// API : Do a Watson Discovery query using the parameters given
// --------------------------------------------------------------------------
export async function sendGetFileContent(fileName) {
  try {
    console.log("INFO : api-calls.js sendGetFileContent : start");

    const response = await fetch("/getCosFileContent", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: fileName,
      }),
    });
    console.log("INFO : api-calls.js sendGetFileContent : end");
    return await response.json();
  } catch (error) {
    return {};
  }
}
