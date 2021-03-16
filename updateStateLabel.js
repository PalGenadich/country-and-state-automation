const { By, until } = require("selenium-webdriver");
const path = require("path");
const {
    resultMessageSelector,
    startChromeAndReturnDriver,
    loginToSalesforce,
    waitByNameAndClick,
    waitByNameAndSendKeys,
    waitByCSSAndCheckForInnerText,
    waitByXPathAndClick,
    countryCodeCell,
    countryEditButton,
    countryCancelButton,
    countTotal,
    countSkip,
    countSuccess,
    outputResult,
} = require(path.resolve(__dirname, "./countryAndStateUtil.js"));

const stateCodeCell = '(//*[contains(@id, "configurecountry")][contains(@id, "code")][text() = "{0}"])[1]';
const stateEditButton = "/../../td[1]/a";
const stateNameCell = "/../../td[4]";
const stateNameInput = "configurecountry:form:blockEditCountry:j_id9:j_id37:editName";
const stateSaveButton = "configurecountry:form:blockEditCountry:j_id8:saveButtonTop";
const stateCancelButton = "configurecountry:form:blockEditCountry:j_id8:cancelButtonTop";
const statesJSON = `{
    "AU_ACT": "Aust Capital Terr",
    "BR_AM": "Amazon",
    "BR_AP": "Amapa",
    "BR_CE": "Ceara",
    "BR_DF": "Brasilia",
    "BR_ES": "Espirito Santo",
    "BR_GO": "Goias",
    "BR_MA": "Maranhao",
    "BR_PA": "Para",
    "BR_PB": "Paraiba",
    "BR_PI": "Piaui",
    "BR_PR": "Parana",
    "BR_RO": "Rondonia",
    "BR_SP": "Sao Paulo",
    "CA_NL": "Newfoundland & Labr.",
    "CA_NT": "Northwest Terr.",
    "CA_YT": "Yukon Territory",
    "IE_MH": "Monaghan",
    "IT_AG": "Agriento",
    "IT_CL": "Caltanisetta",
    "IT_FC": "Forli/Cesana",
    "IT_GE": "Genova",
    "IT_MB": "Monza e Brianza",
    "IT_MN": "Mantova",
    "IT_MS": "Massa Carrara",
    "IT_PD": "Padova",
    "IT_PU": "Pesaro-Urbino",
    "IT_SR": "Siracusa",
    "IT_VB": "Verbania",
    "MX_DF": "Distrito Federal",
    "MX_NL": "Nuevo Leon",
    "US_MP": "Northern Mariana Isl",
    "US_VI": "Virgin Islands"
  }`;

let previousCountry;

async function main() {
    const driver = await startChromeAndReturnDriver();
    await loginToSalesforce(driver);
    await loopThroughStates(driver);
    outputResult();
    driver.quit();
}
main();

async function loopThroughStates(driver) {
    const newStatesObject = JSON.parse(statesJSON);
    for (stateIntegrationCode in newStatesObject) {
        const stateName = newStatesObject[stateIntegrationCode];
        const bothCodes = stateIntegrationCode.split("_");
        const countryCode = bothCodes[0];
        const stateCode = bothCodes[1];
        console.log("==========================================================");
        console.log("Updating", "====", stateIntegrationCode, "====", stateName);
        await updateSingleState(driver, countryCode, stateCode, stateName);
    }
}

async function updateSingleState(driver, countryCode, stateCode, stateName) {
    countTotal();
    if (previousCountry && previousCountry !== countryCode) {
        await waitByNameAndClick(driver, countryCancelButton);
    }
    if (!previousCountry || previousCountry !== countryCode) {
        await waitByXPathAndClick(driver, countryCodeCell.replace("{0}", countryCode) + countryEditButton);
    }
    previousCountry = countryCode;
    const codeCellXpath = stateCodeCell.replace("{0}", stateCode);
    if ((await isStateNameMatching(driver, codeCellXpath + stateNameCell, stateName)) === true) {
        console.log("Skipped: the state name matches the expected value.");
        countSkip();
        return;
    }
    await waitByXPathAndClick(driver, codeCellXpath + stateEditButton);
    await waitByNameAndSendKeys(driver, stateNameInput, stateName);
    await waitByNameAndClick(driver, stateSaveButton);
    const isSuccess = await waitByCSSAndCheckForInnerText(driver, resultMessageSelector, "Success");
    if (isSuccess) {
        countSuccess();
    } else {
        countError();
    }
}

async function isStateNameMatching(driver, nameXpath, newName) {
    return await driver.wait(until.elementLocated(By.xpath(nameXpath)), 80000).then(async (el) => {
        const currentName = await el.getAttribute("innerText");
        console.log("Cur Name:", currentName);
        console.log("New Name:", newName);
        return currentName == newName;
    });
}
