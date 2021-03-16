const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const prodName = "prd";

// =========================================CONFIG=========================================
// set target org here
const orgName = "dev";
// set username here
const username = "user@salesforce.com" + (orgName == prodName ? "" : "." + orgName);
// set user password here
const password = "password";
// set your domain name
const domainName = "your-domain";
// =======================================CONFIG END=======================================

const orgDomain = "https://" + domainName + (orgName == prodName ? "" : "--" + orgName) + ".my.salesforce.com";
const configureCountryUrl = orgDomain + "/?login&startURL=" + encodeURIComponent("/i18n/ConfigStateCountry.apexp?setupid=AddressCleanerOverview");
const resultMessageSelector = ".message";
const countryCodeCell = '(//*[contains(@id, "configstatecountry")][contains(@id, "code")][text() = "{0}"])[1]';
const countryEditButton = "/../../td[1]/a";
const countryCancelButton = "configurecountry:form:blockBottomButtons:j_id60:cancelButtonBottom";
const waitTimeout = 80000;
let countTotal = 0;
let countError = 0;
let countSuccess = 0;
let countSkip = 0;

module.exports = Object.freeze({
    resultMessageSelector: resultMessageSelector,
    startChromeAndReturnDriver: startChromeAndReturnDriver,
    loginToSalesforce: loginToSalesforce,
    waitByNameAndClick: waitByNameAndClick,
    waitByNameAndSendKeys: waitByNameAndSendKeys,
    waitByCSSAndCheckForInnerText: waitByCSSAndCheckForInnerText,
    waitByXPathAndClick: waitByXPathAndClick,
    countryCodeCell: countryCodeCell,
    countryEditButton: countryEditButton,
    countryCancelButton: countryCancelButton,
    countTotal: incrementCountTotal,
    countError: incrementCountError,
    countSuccess: incrementCountSuccess,
    countSkip: incrementCountSkip,
    outputResult: outputResult,
});

async function startChromeAndReturnDriver() {
    const chromeOptions = new chrome.Options();
    // chromeOptions.addArguments("--start-maximized");
    // chromeOptions.addArguments("disable-infobars");
    // chromeOptions.addArguments("--disable-notifications");
    // chromeOptions.addArguments("--auto-open-devtools-for-tabs");
    chromeOptions.excludeSwitches("enable-logging");
    chromeOptions.excludeSwitches("enable-automation");
    return await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
}

async function loginToSalesforce(driver) {
    await driver.get(configureCountryUrl);
    await driver.findElement(By.name("username")).sendKeys(username, Key.TAB);
    await driver.findElement(By.name("pw")).sendKeys(password, Key.ENTER);
}

async function waitByNameAndClick(driver, elementName) {
    return driver.wait(until.elementLocated(By.name(elementName)), waitTimeout).then(() => {
        return (
            driver
                .wait(until.elementIsEnabled(driver.findElement(By.name(elementName))), waitTimeout)
                .then((element) => {
                    return element.click();
                })
                // this catch is needed for the case when checkbox is activated by re-creating the dom element
                .catch(() => {
                    return driver.wait(until.elementIsEnabled(driver.findElement(By.name(elementName))), waitTimeout).then((element) => {
                        return element.click();
                    });
                })
        );
    });
}

async function waitByNameAndSendKeys(driver, elementName, ...keys) {
    return driver.wait(until.elementLocated(By.name(elementName)), waitTimeout).then((el) => {
        el.clear();
        return el.sendKeys(...keys);
    });
}

async function waitByCSSAndCheckForInnerText(driver, cssSelector, textToFind) {
    return driver.wait(until.elementLocated(By.css(cssSelector)), waitTimeout).then(async (el) => {
        const innerText = await el.getAttribute("innerText");
        const isTextFound = innerText.includes(textToFind);
        console.log(innerText.trim());
        return isTextFound;
    });
}

async function waitByXPathAndClick(driver, xpathSelector) {
    return driver.wait(until.elementLocated(By.xpath(xpathSelector)), waitTimeout).then(async (el) => {
        return el.click();
    });
}

function incrementCountTotal() {
    countTotal++;
}

function incrementCountError() {
    countError++;
}

function incrementCountSuccess() {
    countSuccess++;
}

function incrementCountSkip() {
    countSkip++;
}

function outputResult() {
    console.log("==========================================================");
    console.log("Successfully processed:", countSuccess);
    console.log("Errors:", countError);
    console.log("Skipped:", countSkip);
    console.log("Total processed:", countTotal);
    console.log("Done!");
}
