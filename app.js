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
    localAddress: process.env.LOCALHOST,
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
    } else if (oscMessage.address == '/VMC/Ext/Root/Pos') {
        sendPort.send(oscMessage)
    }
})

function modPi(angle) {
    var re = angle % (2*Math.PI)
    if (re < -1*Math.PI) {
        return re + (2*Math.PI)
    } else if (re > Math.PI) {
        return re - (2*Math.PI)
    }
    return re
}

function mod2Pi(angle) {
    var re = angle % (2*Math.PI)
    if (re < 0) {
        return re + (2*Math.PI)
    }
    return re
}

wmcPort.on("ready", function () {
    var ipAddresses = getIPAddresses();
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
    } else if (oscMessage.address != '/VMC/Ext/Root/Pos') {
        sendPort.send(oscMessage)
    }
})

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();
    ipAddresses.forEach(function (address) {
        console.log("Local Receiving Port On");
    });
});

sendPort.on("ready", function () {
    var ipAddresses = getIPAddresses();
    ipAddresses.forEach(function (address) {
        console.log("Host:", sendPort.options.localAddress + ", Port:", sendPort.options.remotePort);
    });
})

function averageAndSender(message) {
    var part = message.args[0]
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
        var result1 = []
        var euler1, euler2
        for(var i = 0; i < receiveArray.wmc[0].length; i++){
            if ( i < 3 ) {
                var num = 0;
                var numArray = []
                for(var j = 0; j < receiveArray.wmc.length; j++){ 
                    num += receiveArray.wmc[j][i];
                    numArray.push(receiveArray.wmc[j][i])
                }
                result1.push(num / receiveArray.wmc.length)
            } else {
                result1.push(receiveArray.wmc[receiveArray.wmc.length - 1][i])
            }
        }
        euler1 = new Quaternion(result1[6], result1[3], result1[4], result1[5]).toEuler()

        var result2 = []
        for(var i2 = 0; i2 < receiveArray.tdpt[0].length; i2++){
            if ( i2 < 3 ) {
                var num2 = 0;
                var numArray2 = []
                for(var j2 = 0; j2 < receiveArray.tdpt.length; j2++){ 
                    num2 += receiveArray.tdpt[j2][i2];
                    numArray2.push(receiveArray.tdpt[j2][i2])
                }
                result2.push(num2 / receiveArray.tdpt.length)
            } else {
                result2.push(receiveArray.tdpt[receiveArray.tdpt.length - 1][i2])
            }
        }
        euler2 = new Quaternion(result2[6], result2[3], result2[4], result2[5]).toEuler()

        if (part == 'LeftUpperArm' && result2[5] > 0.35 && Math.abs(result2[4]) < 0.2 && Math.abs(result2[3]) < 0.2) {
            isLeftArmVisible = false
        } else if(part == 'LeftUpperArm') {
            isLeftArmVisible = true
        }
        if (part == 'RightUpperArm' && result1[5] < -0.35 && Math.abs(result1[4]) < 0.2 && Math.abs(result1[3]) < 0.2) {
            isRightArmVisible = false
        } else if(part == 'RightUpperArm') {
            isRightArmVisible = true
        }

        var result3 = [part]
        var euler3 = []
        var diff1Mean = 0
        var diff2Mean = 0

        var averageFunc = function() {
            for (var i = 0; i < 3; i++) {
                if (i == 0 || i == 2) {
                    euler3.push(mod2Pi(euler1[i] + modPi(euler2[i] - euler1[i])/2))
                } else {
                    euler3.push(euler1[i] + modPi(euler2[i] - euler1[i])/2)
                }
            }
            var q3 = Quaternion.fromEuler(...euler3)
            var q3_w = q3.real()
            var q3_xyz = q3.imag()
            
            var avr = result1.slice(0,3).map((x, y) => (x + result2.slice(0,3)[y])/2);
            result3 = result3.concat(avr).concat(q3_xyz)
            result3.push(q3_w)
        }

        if (receiveArray.formerWmc) {
            var diff1 = result1.map((x, y) => x - receiveArray.formerWmc[y]);
            diff1Mean = diff1[3]**2 + diff1[4]**2 + diff1[5]**2 + diff1[6]**2
        }
        if (receiveArray.formerTdpt) {
            var diff2 = result2.map((x, y) => x - receiveArray.formerTdpt[y]);
            diff2Mean = diff2[3]**2 + diff2[4]**2 + diff2[5]**2 + diff1[6]**2
        }

        if ('HipsSpineHeadNeckUpperChestRoot'.includes(part) || diff1Mean > 0.4) {
            result3 = result3.concat(result2)
            euler3 = euler2
        } else if (diff2Mean > 0.4) {
            result3 = result3.concat(result1)
            euler3 = euler1
        } else if ( isLeftArmVisible == false && isRightArmVisible == false ) {
            if ((part.includes('Right') && part.includes('Arm')) || (part.includes('Right') && part.includes('Hand')) || (part.includes('Left') && part.includes('Leg')) || (part.includes('Left') && part.includes('Foot'))) {
                result3 = result3.concat(result1)
                euler3 = euler1
            } else if ((part.includes('Left') && part.includes('Arm')) || (part.includes('Left') && part.includes('Hand')) || (part.includes('Right') && part.includes('Leg')) || (part.includes('Right') && part.includes('Foot'))) {
                result3 = result3.concat(result2)
                euler3 = euler2
            } else {
                averageFunc()
            }
        } else if ( isLeftArmVisible == true && isRightArmVisible == true ) {
            if (part.includes('Left')) {
                result3 = result3.concat(result1)
                euler3 = euler1
            } else if (part.includes('Right')) {
                result3 = result3.concat(result2)
                euler3 = euler2
            } else {
                averageFunc()
            }
        } else if (isLeftArmVisible == false && isRightArmVisible == true) {
            if ((part.includes('Left') && part.includes('Leg')) || (part.includes('Left') && part.includes('Foot'))) {
                result3 = result3.concat(result1)
                euler3 = euler1
            } else if ( part.includes('Arm') || part.includes('Hand') || (part.includes('Right') && part.includes('Leg')) || (part.includes('Right') && part.includes('Foot'))) {
                result3 = result3.concat(result2)
                euler3 = euler2
            } else {
                averageFunc()
            }
        } else if (isRightArmVisible == false && isLeftArmVisible == true) {
            if ( part.includes('Arm') || part.includes('Hand') || (part.includes('Left') && part.includes('Leg')) || (part.includes('Left') && part.includes('Foot'))) {
                result3 = result3.concat(result1)
                euler3 = euler1
            } else if ((part.includes('Right') && part.includes('Leg')) || (part.includes('Right') && part.includes('Foot'))) {
                result3 = result3.concat(result2)
                euler3 = euler2
            } else {
                averageFunc()
            }
        } else {
            averageFunc()
        }

        async function smoother() {
            var index = [1,2,3,4,5,6,7,8,9,10,11,12]
            var newResultArray = []
            for await (let i of index) {
                var positresult = receiveArray.former.slice(1,4).map((x, y) => (((12-i)* x + i * result3.slice(1,4)[y])/12))
                var eulerresult = []
                for (var j = 0; j<3; j++) {
                    if (j == 0 || j == 2) {
                        eulerresult.push(mod2Pi(eulerformer[j] + i * (modPi(euler3[j] - eulerformer[j]))/12))
                    } else {
                        eulerresult.push(modPi(eulerformer[j] + i * (modPi(euler3[j] - eulerformer[j]))/12))
                    }
                }
                var qResult = Quaternion.fromEuler(...eulerresult)
                var qR_w = qResult.real()
                var qR_xyz = qResult.imag()
                var newResult = [part].concat(positresult).concat(qR_xyz)
                newResult.push(qR_w)
                newResultArray.push(newResult)
                setTimeout(() => {
                    // if (part == 'Head'){
                    //     console.log(newResultArray[i-1][7])
                    // }
                    sendPort.send({
                        address: '/VMC/Ext/Bone/Pos',
                        args: newResultArray[i-1]
                    })
                }, (i-1)*17);
            }
        }

        if (receiveArray.former) {
            if (receiveArray.former.length > 0) {
                eulerformer = new Quaternion(receiveArray.former[7], receiveArray.former[4], receiveArray.former[5], receiveArray.former[6]).toEuler()
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
            }, 150);
        }, 200) // 5 fps
    }
    triggered = true

    if (oscMessage.address == '/VMC/Ext/Bone/Pos') {
        if (PARTS.includes(oscMessage.args[0])) {
            averageAndSender(oscMessage)
        } else if (oscMessage.args[8] == 'wmc') {
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