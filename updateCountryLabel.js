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

const countryNameCell = "/../../td[4]";
const countryNameInput = "configurecountry:form:blockEditCountry:j_id33:j_id34:editName";
const countryIntegrationValueInput = "configurecountry:form:blockEditCountry:j_id33:j_id40:editIntVal";
const countrySaveButton = "configurecountry:form:blockBottomButtons:j_id60:saveButtonBottom";
const countriesJSON = `{
        "BQ": "Bonaire, Saba",
        "CG": "Congo, Republic of the",
        "CI": "Ivory Coast",
        "CW": "Curacao",
        "LY": "Libyan Arab Jamahiriya",
        "MF": "St. Martin",
        "PS": "Palestine, State of",
        "SX": "Sint Maarten",
        "SZ": "Eswatini",
        "TW": "Taiwan, Province of China",
        "VE": "Venezuela, Bolivarian Republic"
      }`;

async function main() {
    const driver = await startChromeAndReturnDriver();
    await loginToSalesforce(driver);
    await loopThroughCountries(driver);
    outputResult();
    driver.quit();
}
main();

async function loopThroughCountries(driver) {
    const newCountriesObject = JSON.parse(countriesJSON);
    for (countryCode in newCountriesObject) {
        const countryName = newCountriesObject[countryCode];
        console.log("==========================================================");
        console.log("Updating", "====", countryCode, "====", countryName);
        await updateSingleCountry(driver, countryCode, countryName);
    }
}

async function updateSingleCountry(driver, countryCode, countryName) {
    countTotal();
    const codeCellXpath = countryCodeCell.replace("{0}", countryCode);
    if (await isCountryNameMatching(driver, codeCellXpath + countryNameCell, countryName)) {
        console.log("Skipped: the country name matches the expected value.");
        countSkip();
        return;
    }
    await waitByXPathAndClick(driver, codeCellXpath + countryEditButton);
    await waitByNameAndSendKeys(driver, countryNameInput, countryName);
    await waitByNameAndSendKeys(driver, countryIntegrationValueInput, countryName);
    await waitByNameAndClick(driver, countrySaveButton);
    const isSuccess = await waitByCSSAndCheckForInnerText(driver, resultMessageSelector, "Success");
    if (isSuccess) {
        countSuccess();
    } else {
        countError();
    }
    await waitByNameAndClick(driver, countryCancelButton);
}

async function isCountryNameMatching(driver, nameXpath, newName) {
    return await driver.wait(until.elementLocated(By.xpath(nameXpath)), 80000).then(async (el) => {
        const currentName = await el.getAttribute("innerText");
        console.log("Cur Name:", currentName);
        console.log("New Name:", newName);
        return currentName == newName;
    });
}
