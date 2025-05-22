const { execSync } = require("child_process");
const core = require("@actions/core");

const checkDependencies = () => {
  try {
    console.info("Checking for outdated dependencies...");
    const outdated = execSync("yarn outdated --json").toString();
    const outdatedDependencies = JSON.parse(outdated).data.body;

    if (outdatedDependencies.length === 0) {
      console.info("All dependencies are up-to-date.");
      core.setOutput("result", "All dependencies are up-to-date.");
      return;
    }

    console.warn("Outdated dependencies found:");
    outdatedDependencies.forEach((dep) => {
      console.warn(
        `${dep[0]}: current version ${dep[1]}, latest version ${dep[3]}`,
      );
    });

    core.setOutput("result", "Outdated dependencies found.");
  } catch (error) {
    console.error("Failed to check for outdated dependencies:", error);
    core.setOutput("result", "Failed to check for outdated dependencies.");
    process.exit(1);
  }
};

checkDependencies();
