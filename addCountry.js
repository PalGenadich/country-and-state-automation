const path = require("path");
const {
    resultMessageSelector,
    startChromeAndReturnDriver,
    loginToSalesforce,
    waitByNameAndClick,
    waitByNameAndSendKeys,
    waitByCSSAndCheckForInnerText,
    countTotal,
    countError,
    countSuccess,
    outputResult,
} = require(path.resolve(__dirname, "./countryAndStateUtil.js"));

const addNewCountryButton = "configstatecountry:form:j_id34:configStateCountryRelList:list:j_id36:buttonAddNew";
const nameInput = "configurenew:j_id1:blockNew:j_id7:nameSectionItem:editName";
const codeInput = "configurenew:j_id1:blockNew:j_id7:codeSectionItem:editIsoCode";
const activeCheckbox = "configurenew:j_id1:blockNew:j_id7:activeSectionItem:editActive";
const visibleCheckbox = "configurenew:j_id1:blockNew:j_id7:visibleSectionItem:editVisible";
const submitNewCountryButton = "configurenew:j_id1:blockNew:j_id41:addButton";
const cancelAfterSaveButton = "configurecountry:form:blockBottomButtons:j_id60:cancelButtonBottom";
const cancelAfterErrorButton = "configurenew:j_id1:blockNew:j_id41:cancelButton";
const newCountriesJSON = `{
        "AN": "Netherlands Antilles",
        "AS": "American Samoa",
        "FM": "Micronesia, Federated States of",
        "GU": "Guam",
        "HK": "Hong Kong",
        "PR": "Puerto Rico",
        "PW": "Palau",
        "UM": "United States Minor Outlying Islands",
        "VI": "Virgin Islands, U.S."
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
    const newCountriesObject = JSON.parse(newCountriesJSON);
    for (countryCode in newCountriesObject) {
        const countryName = newCountriesObject[countryCode];
        console.log("==========================================================");
        console.log("Adding", "====", countryCode, "====", countryName);
        await createSingleCountry(driver, countryCode, countryName);
    }
}

async function createSingleCountry(driver, countryCode, countryName) {
    countTotal();
    await waitByNameAndClick(driver, addNewCountryButton);
    await waitByNameAndSendKeys(driver, nameInput, countryName);
    await waitByNameAndSendKeys(driver, codeInput, countryCode);
    await waitByNameAndClick(driver, activeCheckbox);
    await waitByNameAndClick(driver, visibleCheckbox);
    await waitByNameAndClick(driver, submitNewCountryButton);
    const isSuccess = await waitByCSSAndCheckForInnerText(driver, resultMessageSelector, "Success");
    if (isSuccess) {
        countSuccess();
        await waitByNameAndClick(driver, cancelAfterSaveButton);
    } else {
        countError();
        await waitByNameAndClick(driver, cancelAfterErrorButton);
    }
}
