//Let's put WMC as Left hand side, and TDPT(Remote) as Right hand side.

const osc = require('osc')
const Quaternion = require('quaternion');
const fs = require('fs');
const path = require('path');
const configArray = fs.readFileSync(path.join(process.cwd(), 'vmcdualcammixer/config.txt')).toString().split("\n");
const LOCALHOST = configArray[2].replace('\r', '')
const LOCALPORT = configArray[5].replace('\r', '')
const LOCALIP = configArray[10].replace('\r', '')
const REMOTEPORT = configArray[13].replace('\r', '')
const SENDIP = configArray[18].replace('\r', '')
const SENDPORT = configArray[21].replace('\r', '')
const OCCUPPORT = configArray[26].replace('\r', '')

const PARTS = ['LeftShoulder', 'LeftUpperArm', 'LeftLowerArm', 'LeftHand', 'LeftUpperLeg', 'LeftLowerLeg', 'LeftFoot', 'LeftToes', 'RightShoulder', 'RightUpperArm', 'RightLowerArm', 'RightHand', 'RightUpperLeg', 'RightLowerLeg', 'RightFoot', 'RightToes']

var receiveRootArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveHipsArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveSpineArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveChestArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveUpperChestArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveNeckArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveHeadArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveLeftShoulderArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveLeftUpperArmArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveLeftLowerArmArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveLeftHandArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveLeftUpperLegArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveLeftLowerLegArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveLeftFootArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveLeftToesArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveRightShoulderArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveRightUpperArmArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveRightLowerArmArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveRightHandArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveRightUpperLegArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveRightLowerLegArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveRightFootArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}
var receiveRightToesArray = {wmc: [], tdpt: [], formerWmc: [], formerTdpt: [], former: []}

var triggered = false
var receive = false

var isLeftArmVisible = true
var isRightArmVisible = true
var isLegInvisible = 0 // 0이 보임, -1이 오른쪽에서보임, 1이 왼쪽에서보임

var getIPAddresses = function () {
    var os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }
    return ipAddresses;
};

var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: OCCUPPORT
});

var tdptPort = new osc.UDPPort({
    localAddress: LOCALIP,
    localPort: REMOTEPORT,
    remotePort: OCCUPPORT
});

var wmcPort = new osc.UDPPort({
    localAddress: LOCALHOST,
    localPort: LOCALPORT,
    remotePort: OCCUPPORT
});

var sendPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    remoteAddress: SENDIP,
    remotePort: SENDPORT
});

sendPort.open();
tdptPort.open();
wmcPort.open();

tdptPort.on("ready", function () {
    var ipAddresses = getIPAddresses();
    ipAddresses.forEach(function (address) {
        console.log("Remote SW Port On: ", tdptPort.options.localPort);
    });
});

tdptPort.on("message", function (oscMessage) {
    if (oscMessage.address == '/VMC/Ext/Bone/Pos') {
        oscMessage.args.push('tdpt')
        tdptPort.send({
            address: oscMessage.address,
            args: oscMessage.args
        })
    } else if (oscMessage.address == '/VMC/Ext/Root/Pos') {
        sendPort.send(oscMessage)
    }
})

wmcPort.on("ready", function () {
    var ipAddresses = getIPAddresses();
    ipAddresses.forEach(function (address) {
        console.log("Local SW Port On: ", wmcPort.options.localPort);
    });
});

wmcPort.on("message", function (oscMessage) {
    if (oscMessage.address == '/VMC/Ext/Bone/Pos') {
        oscMessage.args.push('wmc')
        wmcPort.send({
            address: oscMessage.address,
            args: oscMessage.args,
        })
    } else if (oscMessage.address != '/VMC/Ext/Root/Pos') {
        sendPort.send(oscMessage)
    }
})

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();
    ipAddresses.forEach(function (address) {
        console.log("Local Receiving Port On: ", udpPort.options.localPort);
    });
});

sendPort.on("ready", function () {
    var ipAddresses = getIPAddresses();
    ipAddresses.forEach(function (address) {
        console.log("Host:", sendPort.options.localAddress + ", Port:", sendPort.options.remotePort);
    });
})

function averageAndSender(message) {
    let part = message.args[0]
    if (receive == true) {
        if (message.args[8] == 'wmc') {
            eval(`receive${part}Array.wmc.push(message.args.slice(1, 8))`)
        } else {
            eval(`receive${part}Array.tdpt.push(message.args.slice(1, 8))`)
        }
    } else {
        var resultArr = eval(`averager('${part}', receive${part}Array)`)
        eval(`receive${part}Array.wmc.push(message.args.slice(1, 8))\nreceive${part}Array = {wmc: [], tdpt: [], formerWmc: resultArr[0], formerTdpt: resultArr[1], former: resultArr[2]}`)
    }
}

function averager(part, receiveArray) {
    if (receiveArray.wmc.length > 0 && receiveArray.tdpt.length > 0 ) {
        let result1 = []
        let euler1, euler2, q1, q2
        for(var i = 0; i < receiveArray.wmc[0].length; i++){
            if ( i < 3 ) {
                let num = 0;
                let numArray = []
                for(var j = 0; j < receiveArray.wmc.length; j++){ 
                    num += receiveArray.wmc[j][i];
                    numArray.push(receiveArray.wmc[j][i])
                }
                result1.push(num / receiveArray.wmc.length)
            } else {
                result1.push(receiveArray.wmc[receiveArray.wmc.length - 1][i])
            }
        }
        q1 = new Quaternion(result1[6], result1[3], result1[4], result1[5])
        euler1 = q1.toEuler()

        let result2 = []
        for(var i2 = 0; i2 < receiveArray.tdpt[0].length; i2++){
            if ( i2 < 3 ) {
                let num2 = 0;
                let numArray2 = []
                for(var j2 = 0; j2 < receiveArray.tdpt.length; j2++){ 
                    num2 += receiveArray.tdpt[j2][i2];
                    numArray2.push(receiveArray.tdpt[j2][i2])
                }
                result2.push(num2 / receiveArray.tdpt.length)
            } else {
                result2.push(receiveArray.tdpt[receiveArray.tdpt.length - 1][i2])
            }
        }
        q2 = new Quaternion(result2[6], result2[3], result2[4], result2[5])
        euler2 = q2.toEuler()

        if (part == 'Hips' && euler2[0] > 1) {
            isLegInvisible = 1
        } else if (part == 'Hips' && euler2[0] < 0.5) {
            isLegInvisible = -1
        } else if (part == 'Hips') {
            isLegInvisible = 0
        }

        if (part == 'LeftUpperArm' && (euler1[0] > 1.2 || euler2[2] < 0.3 || euler2[2] > 0.95 )) {
            isLeftArmVisible = false
        } else if(part == 'LeftUpperArm') {
            isLeftArmVisible = true
        }
        if (part == 'RightUpperArm' && (euler2[0] < -1.2 || euler1[2] > -0.3 || euler1[2] < -0.95)) {
            isRightArmVisible = false
        } else if(part == 'RightUpperArm') {
            isRightArmVisible = true
        }

        let result3 = [part]
        let q3_w = 0
        let q3_xyz = []
        let diff1Mean = 0
        let diff2Mean = 0

        var averageFunc = function() {
            let q3 = q1.slerp(result2[6], result2[3], result2[4], result2[5])(0.5)
            q3_w = q3.real()
            q3_xyz = q3.imag()
            
            let avr = result1.slice(0,3).map((x, y) => (x + result2.slice(0,3)[y])/2);
            result3 = result3.concat(avr).concat(q3_xyz)
            result3.push(q3_w)
        }

        if (receiveArray.formerWmc) {
            let diff1 = result1.map((x, y) => x - receiveArray.formerWmc[y]);
            diff1Mean = diff1[3]**2 + diff1[4]**2 + diff1[5]**2 + diff1[6]**2
        }
        if (receiveArray.formerTdpt) {
            let diff2 = result2.map((x, y) => x - receiveArray.formerTdpt[y]);
            diff2Mean = diff2[3]**2 + diff2[4]**2 + diff2[5]**2 + diff2[6]**2
        }

        if ('HipsSpineHeadNeckUpperChestRoot'.includes(part) || diff1Mean > 1) {
            result3 = result3.concat(result2)
            q3_w = result2[6]
            q3_xyz = [result2[3], result2[4], result2[5]]
        } else if (diff2Mean > 1) {
            result3 = result3.concat(result1)
            q3_w = result1[6]
            q3_xyz = [result1[3], result1[4], result1[5]]
        } else if(part.includes('Arm') || part.includes('Hand') || part.includes('Shoulder')) {
            if (isLeftArmVisible && isRightArmVisible) {
                if (part.includes('Left')) {
                    result3 = result3.concat(result1)
                    q3_w = result1[6]
                    q3_xyz = [result1[3], result1[4], result1[5]]
                } else {
                    result3 = result3.concat(result2)
                    q3_w = result2[6]
                    q3_xyz = [result2[3], result2[4], result2[5]]
                }
            } else if (!isLeftArmVisible && !isRightArmVisible) {
                if (part.includes('Right')) {
                    result3 = result3.concat(result1)
                    q3_w = result1[6]
                    q3_xyz = [result1[3], result1[4], result1[5]]
                } else {
                    result3 = result3.concat(result2)
                    q3_w = result2[6]
                    q3_xyz = [result2[3], result2[4], result2[5]]
                }
            } else if (!isLeftArmVisible && isRightArmVisible) {
                result3 = result3.concat(result2)
                q3_w = result2[6]
                q3_xyz = [result2[3], result2[4], result2[5]]
            } else {
                result3 = result3.concat(result1)
                q3_w = result1[6]
                q3_xyz = [result1[3], result1[4], result1[5]]
            }
        } else if(part.includes('Leg') || part.includes('Foot') || part.includes('Toes')) {
            if (isLegInvisible == 0) {
                if (part.includes('Left')) {
                    result3 = result3.concat(result1)
                    q3_w = result1[6]
                    q3_xyz = [result1[3], result1[4], result1[5]]
                } else {
                    result3 = result3.concat(result2)
                    q3_w = result2[6]
                    q3_xyz = [result2[3], result2[4], result2[5]]
                }
            } else if (isLegInvisible > 0) {
                result3 = result3.concat(result2)
                q3_w = result2[6]
                q3_xyz = [result2[3], result2[4], result2[5]]
            } else {
                result3 = result3.concat(result1)
                q3_w = result1[6]
                q3_xyz = [result1[3], result1[4], result1[5]]
            }
        } else {
            averageFunc()
        }

        async function smoother() {
            let index = [1,2,3,4,5,6,7,8,9]
            let newResultArray = []
            for await (let i of index) {
                let positresult = receiveArray.former.slice(1,4).map((x, y) => (((9-i)* x + i * result3.slice(1,4)[y])/9))
                let qResult = qformer.slerp(q3_w, q3_xyz[0], q3_xyz[1], q3_xyz[2])(i/9)
                let qR_w = qResult.real()
                let qR_xyz = qResult.imag()
                let newResult = [part].concat(positresult).concat(qR_xyz)
                newResult.push(qR_w)
                newResultArray.push(newResult)
                setTimeout(() => {
                    sendPort.send({
                        address: '/VMC/Ext/Bone/Pos',
                        args: newResultArray[i-1]
                    })
                }, (i-1)*17);
            }
        }

        if (receiveArray.former) {
            if (receiveArray.former.length > 0) {
                qformer = new Quaternion(receiveArray.former[7], receiveArray.former[4], receiveArray.former[5], receiveArray.former[6])
                smoother()
            }
        }
        return [result1, result2, result3]
    }
    return [[], [], receiveArray.former]
}

udpPort.on("message", function (oscMessage) {
    if (!triggered) {
        setInterval(() => {
            receive = true
            setTimeout(() => {
                receive = false
            }, 100);
        }, 150)
    }
    triggered = true

    if (oscMessage.address == '/VMC/Ext/Bone/Pos') {
        if (PARTS.includes(oscMessage.args[0])) {
            averageAndSender(oscMessage)
        } else if (oscMessage.args[8] == 'tdpt' && 'HipsSpineHeadNeckUpperChestRoot'.includes(oscMessage.args[0])) {
            sendPort.send({
                address: oscMessage.address,
                args: oscMessage.args.slice(0, 8)
            })
        } else if (oscMessage.args[8] == 'wmc' && !'HipsSpineHeadNeckUpperChestRoot'.includes(oscMessage.args[0])) {
            sendPort.send({
                address: oscMessage.address,
                args: oscMessage.args.slice(0, 8)
            })
        }
    }
});
udpPort.on("error", function (err) {
    console.log(err);
});
udpPort.open();