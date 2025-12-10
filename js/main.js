// IP -> INT
function ipToInt(ip) {
    let parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) {
        throw new Error("Invalid IP format");
    }
    return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

// INT -> IP
function intToIp(int) {
    return [
        (int >>> 24) & 255,
        (int >>> 16) & 255,
        (int >>> 8) & 255,
        int & 255
    ].join(".");
}

// CIDR -> INT
function cidrToMask(bits) {
    return bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
}

// INT -> CIDR
function maskIntToDotted(maskInt) {
    return intToIp(maskInt);
}

// selectメニュー
function generateCidrOptions(selectId) {
    let select = document.getElementById(selectId);

    for (let i = 1; i <= 32; i++) {
        let maskInt = cidrToMask(i);
        let dotted = maskIntToDotted(maskInt);

        let option = document.createElement("option");
        option.value = i;
        option.textContent = `/${i} (${dotted})`;

        if (i === 24) option.selected = true;

        select.appendChild(option);
    }
}

function checkConnectivity() {
    let resultBox = document.getElementById("result");

    try {
        let ip1 = document.getElementById("ip1").value.trim();
        let ip2 = document.getElementById("ip2").value.trim();

        let cidr1 = parseInt(document.getElementById("cidrSelect1").value);
        let cidr2 = parseInt(document.getElementById("cidrSelect2").value);

        let mask1Int = cidrToMask(cidr1);
        let mask2Int = cidrToMask(cidr2);

        let ip1Int = ipToInt(ip1);
        let ip2Int = ipToInt(ip2);

        // IP1 == IP2
        if (ip1Int === ip2Int) {
            resultBox.style.background = "#f7c5c5";
            resultBox.textContent =
                "IP重複のため通信不可\n\n" +
                "（Wiresharkの場合）\n" +
                "pingすると自分のIPだと判断するので、ループバックでキャッチできない\n" +
                "（arp commandの場合）\n" +
                "IP重複によりMACの競合が起きるため、通信不可";
            return;
        }

        // IP1
        let net1_from1 = ip1Int & mask1Int;
        let net2_from1 = ip2Int & mask1Int;

        // IP2
        let net1_from2 = ip1Int & mask2Int;
        let net2_from2 = ip2Int & mask2Int;

        let canFrom1 = (net1_from1 === net2_from1);
        let canFrom2 = (net1_from2 === net2_from2);

        let canCommunicate = canFrom1 && canFrom2;

        let output =
            (canCommunicate ? "通信可能" : "通信不可") + "：\n" +
            "IP1から見るIP1：" + intToIp(net1_from1) + " /" + cidr1 + "\n" +
            "IP1から見るIP2：" + intToIp(net2_from1) + " /" + cidr1 + "\n" +
            "IP2から見るIP1：" + intToIp(net1_from2) + " /" + cidr2 + "\n" +
            "IP2から見るIP2：" + intToIp(net2_from2) + " /" + cidr2;

        resultBox.style.background = canCommunicate ? "#c8f7c5" : "#f7c5c5";
        resultBox.textContent = output;

    } catch (err) {
        resultBox.style.background = "#f7e2c5";
        resultBox.textContent = "入力エラー: " + err.message;
    }
}

generateCidrOptions("cidrSelect1");
generateCidrOptions("cidrSelect2");

document.getElementById("checkBtn").addEventListener("click", checkConnectivity);
