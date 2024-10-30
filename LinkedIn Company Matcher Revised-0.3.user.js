// ==UserScript==
// @name         LinkedIn Company Matcher Revised
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Check if LinkedIn job company is in IND km sponsor list
// @author       JP Zhang
// @match        https://www.linkedin.com/jobs/*
// @grant        GM_xmlhttpRequest
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @license             MPL-2.0
// @downloadURL https://update.greasyfork.org/scripts/474089/LinkedIn%20Company%20Matcher%20Revised.user.js
// @updateURL https://update.greasyfork.org/scripts/474089/LinkedIn%20Company%20Matcher%20Revised.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // Fetch the IND km sponsor list (supposed to be a JSON file)
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://raw.githubusercontent.com/yangliu305/km_company.json/refs/heads/main/km_company.json",
        onload: function(response) {
            let indCompanies = JSON.parse(response.responseText);

            // 每5秒运行检查
        setInterval(function() {
            // 获取公司名称
            let companyNameElement = document.querySelector(".job-details-jobs-unified-top-card__company-name a.app-aware-link");
            if (!companyNameElement) {
                console.log("Company name element not found");
                return;
            }
            let companyName = companyNameElement.textContent.trim().toLowerCase();

            // 获取公司位置
            let locationElement = document.querySelector(".job-details-jobs-unified-top-card__primary-description-container .tvm__text--low-emphasis");
            let location = "";
            if (locationElement) {
                location = locationElement.textContent.trim();
                console.log("Location:", location);
            } else {
                console.log("Location element not found");
            }

            // 打印公司名称和位置
            console.log("Company name: " + companyName);
            console.log("Location: " + location);

                if (location.includes('Netherlands') || location.includes('荷兰') || location.includes('尼德兰') || location.includes('Delft')) {
                    let companyLink = companyNameElement; // Save the object for the company name link

                    console.time("Matching time"); // Start timer

                    let matched = indCompanies.sponsors.some(function(sponsor) {
                        if (isKMismatchSubstring(companyName, sponsor.toLowerCase(), 3)) {
                            // The company name is a K-mismatch substring of this company,
                            // so you can change the CSS as needed.
                            companyLink.style.fontWeight = 'bold';
                            companyLink.style.color = 'green';
                            return true;
                        }
                        return false;
                    });

                    console.timeEnd("Matching time"); // End timer and log time

                    if (!matched) {
                        // The company name did not match any sponsor,
                        // so you can change the CSS as needed.
                        console.log("Not matched!");
                        companyLink.style.fontWeight = 'bold';
                        companyLink.style.color = 'red';
                    }
                }
            }, 5000);
        }
    });
})();

function isKMismatchSubstring(query, text, k) {
    let m = query.length;
    for (let i = 0; i <= text.length - m; i++) {
        let mismatches = 0;
        for (let j = 0; j < m; j++) {
            if (text[i + j] !== query[j]) {
                mismatches++;
                if (mismatches > k) {
                    break;
                }
            }
        }
        if (mismatches <= k) {
            return true;
        }
    }
    return false;
}
