const path = require('path')
  , core = require('@actions/core')
  , github = require('@actions/github')
  , DataCollector = require('./src/DataCollector')
  , ReportTemplate = require('./src/reports/ReportTemplate')
  , pdfWriter = require('./src/reports/pdfWriter')
  ;

async function run() {
  try {
    const token = getRequiredInputValue('token')
      , sarifReportDir = getRequiredInputValue('sarifReportDir')
      , outputDir = getRequiredInputValue('outputDir')
      , repository = getRequiredInputValue('repository')
      , octokit = github.getOctokit(token)
    ;
    
    const collector = new DataCollector(octokit, repository)
      , reportData = await collector.getPayload(sarifReportDir)
      , reportTemplate = new ReportTemplate() //TODO add support to set a different directory
    ;

    //TODO outputting this to console for testing, needs to be converted into a reportData
    // console.log(JSON.stringify(reportData.getPayload(), null, 2));

    const html = reportTemplate.render(reportData.getJSONPayload(), 'summary.html');
    const result = await pdfWriter.save(html, path.join(outputDir, 'summary.pdf'));
    console.log(JSON.stringify(result));
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();

function getRequiredInputValue(key) {
  return core.getInput(key, {required: true});
}
