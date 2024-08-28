//Let's put WMC as Left hand side, and TDPT(Remote) as Right hand side.

const osc = require('osc')
const Quaternion = require('quaternion');
require('dotenv').config()

const PARTS = ['Root', 'Hips', 'Spine', 'Chest', 'UpperChest', 'Neck', 'Head', 'LeftShoulder', 'LeftUpperArm', 'LeftLowerArm', 'LeftHand', 'LeftUpperLeg', 'LeftLowerLeg', 'LeftFoot', 'LeftToes', 'RightShoulder', 'RightUpperArm', 'RightLowerArm', 'RightHand', 'RightUpperLeg', 'RightLowerLeg', 'RightFoot', 'RightToes']

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
    localPort: 39538
});

var tdptPort = new osc.UDPPort({
    localAddress: process.env.LOCALIP,
    localPort: process.env.REMOTEPORT,
    remotePort: 39538
});

var wmcPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: process.env.LOCALPORT,
    remotePort: 39538
});

var sendPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    remotePort: 39539
});

sendPort.open();
tdptPort.open();
wmcPort.open();

tdptPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log("TDPT Port On");
    });
});

tdptPort.on("message", function (oscMessage) {
    if (oscMessage.address == '/VMC/Ext/Bone/Pos') {
        oscMessage.args.push('tdpt')
        tdptPort.send({
            address: oscMessage.address,
            args: oscMessage.args
        })
    }
})

wmcPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log("WMC Port On");
    });
});

wmcPort.on("message", function (oscMessage) {
    if (oscMessage.address == '/VMC/Ext/Bone/Pos') {
        oscMessage.args.push('wmc')
        wmcPort.send({
            address: oscMessage.address,
            args: oscMessage.args,
        })
    } else {
        wmcPort.send(oscMessage)
    }
})

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
    });
});


sendPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", sendPort.options.localPort);
    });


    function averageAndSender(message) {
        var part = message.args[0]
        if (receive == true) {
            if (message.args[8] == 'wmc') {
                eval(`receive${part}Array.wmc.push(message.args.slice(1, 8))`)
            } else {
                eval(`receive${part}Array.tdpt.push(message.args.slice(1, 8))`)
            }
        } else if (receive == false) {
            var resultArr = eval(`averager('${part}', receive${part}Array)`)
            eval(`receive${part}Array.wmc.push(message.args.slice(1, 8))\nreceive${part}Array = {wmc: [], tdpt: [], formerWmc: resultArr[0], formerTdpt: resultArr[1], former: resultArr[2]}`)
        }
    }

    function averager(part, receiveArray) {
        if (receiveArray.wmc.length > 0 && receiveArray.tdpt.length > 0  ) {
            var result1 = []
            var euler1, euler2
            for(var i = 0; i < receiveArray.wmc[0].length; i++){
                var num = 0;
                var numArray = []
                for(var j = 0; j < receiveArray.wmc.length; j++){ 
                    num += receiveArray.wmc[j][i];
                    numArray.push(receiveArray.wmc[j][i])
                }
                result1.push(num / receiveArray.wmc.length) // 평균
            }
            euler1 = new Quaternion(result1[6], result1[3], result1[4], result1[5]).toEuler()
            var result2 = []
            for(var i2 = 0; i2 < receiveArray.tdpt[0].length; i2++){
                var num2 = 0;
                var numArray2 = []
                for(var j2 = 0; j2 < receiveArray.tdpt.length; j2++){ 
                    num2 += receiveArray.tdpt[j2][i2];
                    numArray2.push(receiveArray.tdpt[j2][i2])
                }
                result2.push(num2 / receiveArray.tdpt.length)
            }

            if (part == 'LeftUpperArm' && Math.abs(result2[5]) > 0.4) {
                isLeftArmVisible = false
            } else if(part == 'LeftUpperArm' && Math.abs(result2[5]) <= 0.4) {
                isLeftArmVisible = true
            }
            if (part == 'RightUpperArm' && Math.abs(result1[5]) > 0.4) {
                isRightArmVisible = false
            } else if(part == 'RightUpperArm' && Math.abs(result1[5]) <= 0.4)  {
                isRightArmVisible = true
            }
            euler2 = new Quaternion(result2[6], result2[3], result2[4], result2[5]).toEuler()
            var result3 = [part]
            var euler3 = []
            for (var i = 0; i < euler2.length; i++) {
                euler3.push((euler1[i] + euler2[i])/2)
            }
            var q3 = Quaternion.fromEuler(...euler3)
            var q3_w = q3.real()
            var q3_xyz = q3.imag()
            var diff1Mean = 0
            var diff2Mean = 0
            if (receiveArray.formerWmc) {
                var diff1 = result1.map((x, y) => x - receiveArray.formerWmc[y]);
                diff1Mean = diff1[3]**2 + diff1[4]**2 + diff1[5]**2
            }
            if (receiveArray.formerTdpt) {
                var diff2 = result2.map((x, y) => x - receiveArray.formerTdpt[y]);
                diff2Mean = diff2[3]**2 + diff2[4]**2 + diff2[5]**2
            }
            for(var j = 0; j < result2.length; j++){
                if ('HipsSpineHeadNeckRoot'.includes(part)) {
                    result3.push(result2[j])
                } else if (diff1Mean > 0.3) {
                    result3.push(result2[j])
                } else if (diff2Mean > 0.3) {
                    if (j < 3) {
                        result3.push(result2[j])
                    } else {
                        result3.push(result1[j])
                    }
                } else if ( isLeftArmVisible == false && isRightArmVisible == false ) {
                    if ((part.includes('Right') && part.includes('Arm')) || (part.includes('Left') && part.includes('Leg'))) {
                        result3.push(result2[j])
                    } else if ((part.includes('Left') && part.includes('Arm')) || (part.includes('Right') && part.includes('Leg'))) {
                        result3.push(result1[j])
                    } else {
                        if (j < 3) {
                            result3.push(result2[j])
                        } else if (j > 2 && j < 6) {
                            result3.push(q3_xyz[j-3])
                        } else if (j == 6) {
                            result3.push(q3_w)
                        } else {
                            result3.push((result1[j] + result2[j])/2)
                        }
                    }
                } else if ( isLeftArmVisible == true && isRightArmVisible == true ) {
                    if (part.includes('Left')) {
                        result3.push(result2[j])
                    } else if (part.includes('Right')) {
                        result3.push(result1[j])
                    } else {
                        if (j < 3) {
                            result3.push(result2[j])
                        } else if (j > 2 && j < 6) {
                            result3.push(q3_xyz[j-3])
                        } else if (j == 6) {
                            result3.push(q3_w)
                        } else {
                            result3.push((result1[j] + result2[j])/2)
                        }
                    }
                } else if (isLeftArmVisible == false && isRightArmVisible == true) {
                    if ( part.includes('Arm') || (part.includes('Right') && part.includes('Leg')) ) {
                        result3.push(result2[j])
                    } else if ((part.includes('Left') && part.includes('Leg'))) {
                        result3.push(result1[j])
                    } else {
                        if (j < 3) {
                            result3.push(result2[j])
                        } else if (j > 2 && j < 6) {
                            result3.push(q3_xyz[j-3])
                        } else if (j == 6) {
                            result3.push(q3_w)
                        } else {
                            result3.push((result1[j] + result2[j])/2)
                        }
                    }
                } else if (isRightArmVisible == false && isLeftArmVisible == true) {
                    if ((part.includes('Right') && part.includes('Leg'))) {
                        result3.push(result2[j])
                    } else if (part.includes('Arm') || (part.includes('Left') && part.includes('Leg'))) {
                        result3.push(result1[j])
                    } else {
                        if (j < 3) {
                            result3.push(result2[j])
                        } else if (j > 2 && j < 6) {
                            result3.push(q3_xyz[j-3])
                        } else if (j == 6) {
                            result3.push(q3_w)
                        } else {
                            result3.push((result1[j] + result2[j])/2)
                        }
                    }
                } else {
                    if (j < 3) {
                        result3.push(result2[j])
                    } else if (j > 2 && j < 6) {
                        result3.push(q3_xyz[j-3])
                    } else if (j == 6) {
                        result3.push(q3_w)
                    } else {
                        result3.push((result1[j] + result2[j])/2)
                    }
                }
            }
            if (receiveArray.former) {
                var diff3 =  result3.slice(1).map((x, y) => x - receiveArray.former.slice(1)[y]);
                var diffresult = diff3[3]**2 + diff3[4]**2 + diff3[5]**2
                if (diffresult > 2) {
                    sendPort.send({
                        address: '/VMC/Ext/Bone/Pos',
                        args: receiveArray.former
                    })
                    return [result1, result2, receiveArray.former]
                } else {
                    sendPort.send({
                        address: '/VMC/Ext/Bone/Pos',
                        args: result3
                    })
                    return [result1, result2, result3]
                }
            }
            return [result1, result2, result3]
        }
        return [result1, result2, receiveArray.former]
    }

    udpPort.on("message", function (oscMessage) {
        if (!triggered) {
            record = false
            setInterval(() => {
                receive = true
                setTimeout(() => {
                    receive = false
                }, 50);
            }, 70) // 10fps
        }
        triggered = true

        if (oscMessage.address == '/VMC/Ext/Bone/Pos') {
            if (PARTS.includes(oscMessage.args[0])) {
                averageAndSender(oscMessage)
            } else {
                sendPort.send(oscMessage)
            }

        } else {
            sendPort.send(oscMessage)
        }
    });
    udpPort.on("error", function (err) {
        console.log(err);
    });
    udpPort.open();
})