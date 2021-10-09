let os = require("os");

module.exports = {
    skipJsErrors: true,
    pageLoadTimeout: 120000,
    browsers: "chrome:headless",
    screenshots: {
        "path": "/tmp/artifacts",
        "takeOnFails": true,
        "pathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
    },
    videoPath: "/tmp/artifacts",
    videoOptions: {  
        "singleFile": false,
        "failedOnly": true,
        "pathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4"
    }
}