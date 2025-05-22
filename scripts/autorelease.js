const { exec, execSync } = require("child_process");
const fs = require("fs");
const core = require("@actions/core");

const excalidrawDir = `${__dirname}/../packages/excalidraw`;
const excalidrawPackage = `${excalidrawDir}/package.json`;
const pkg = require(excalidrawPackage);
const isPreview = process.argv.slice(2)[0] === "preview";

const getShortCommitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    console.error("Failed to get short commit hash:", error);
    throw new Error("Failed to get short commit hash");
  }
};

const publish = () => {
  const tag = isPreview ? "preview" : "next";

  try {
    console.info("Installing dependencies...");
    execSync(`yarn  --frozen-lockfile`);
    console.info("Building ESM package...");
    execSync(`yarn run build:esm`, { cwd: excalidrawDir });
    console.info("Publishing package...");
    execSync(`yarn --cwd ${excalidrawDir} publish --tag ${tag}`);
    console.info(`Published ${pkg.name}@${tag}🎉`);
    core.setOutput(
      "result",
      `**Preview version has been shipped** :rocket:
    You can use [@excalidraw/excalidraw@${pkg.version}](https://www.npmjs.com/package/@excalidraw/excalidraw/v/${pkg.version}) for testing!`,
    );
  } catch (error) {
    console.error("Package couldn't be published:", error);
    core.setOutput("result", "Package couldn't be published :warning:!");
    process.exit(1);
  }
};

const updatePackageVersion = (version) => {
  try {
    pkg.version = version;
    fs.writeFileSync(excalidrawPackage, JSON.stringify(pkg, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to update package version:", error);
    throw new Error("Failed to update package version");
  }
};

const getChangedFiles = async () => {
  return new Promise((resolve, reject) => {
    exec(`git diff --name-only HEAD^ HEAD`, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error("Failed to get changed files:", error || stderr);
        return reject(new Error("Failed to get changed files"));
      }
      resolve(stdout.trim().split("\n"));
    });
  });
};

const shouldPublish = (changedFiles) => {
  const excalidrawPackageFiles = changedFiles.filter((file) => {
    return (
      file.indexOf("packages/excalidraw") >= 0 ||
      file.indexOf("buildPackage.js") > 0
    );
  });
  return excalidrawPackageFiles.length > 0;
};

const main = async () => {
  try {
    const changedFiles = await getChangedFiles();
    if (!shouldPublish(changedFiles)) {
      console.info("Skipping release as no valid diff found");
      core.setOutput("result", "Skipping release as no valid diff found");
      process.exit(0);
    }

    let version = `${pkg.version}-${getShortCommitHash()}`;
    if (isPreview) {
      const pullRequestNumber = process.argv.slice(3)[0];
      version = `${pkg.version}-${pullRequestNumber}-${getShortCommitHash()}`;
    }

    updatePackageVersion(version);
    console.info("Publish in progress...");
    publish();
  } catch (error) {
    console.error("Error during release process:", error);
    core.setOutput("result", "Error during release process :warning:!");
    process.exit(1);
  }
};

main();
