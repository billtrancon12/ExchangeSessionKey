
// Return a hex to string
module.exports.hex_to_string = function HexToString(str){
    var hex = str.toString();
    var ret = '';
    for(var n = 0; n < hex.length; n+= 2){
        ret += String.fromCharCode(parseInt(hex.substr(n , 2), 16));
    }
    return ret;
}

// Return true or false whether an email is in validate format
module.exports.validate_email = function ValidateEmail(email){
    var validator = require("email-validator");
    return validator.validate(email);
}

module.exports.validate_pass_syntax = function ValidatePasswordSyntax(pass){
    const MIN_UP_CHAR = 1;
    const MIN_LOW_CHAR = 1;
    const MIN_SPEC_CHAR = 1;
    const MIN_LENGTH = 8;
    const MIN_DIGIT = 1;
    const SPEC_CHAR_ARR = ['!','@','#','$','%','^','&','*','(',')','{','}','-','_','=','+','[',']','{','}','\\','|',';',':','\'','"',',','<','.','>','/','?','`','~'];

    var lowChar = 0;
    var upChar = 0;
    var specChar = 0;
    var digitChar = 0;

    let lengthChecked = true;
    let upCharChecked = true;
    let lowCharChecked = true;
    let specCharChecked = true;
    let digitChecked = true;

    if(pass.length < MIN_LENGTH){
        lengthChecked = false;
    }

    for(let i = 0; i < pass.length; i++){
        let c = pass[i];

        if(c.charCodeAt(0) - 'a'.charCodeAt(0) >= 0 && c.charCodeAt(0) - 'a'.charCodeAt(0) <= 26){
            lowChar++;
        }
        else if(c.charCodeAt(0) - 'A'.charCodeAt(0) >= 0 && c.charCodeAt(0) - 'A'.charCodeAt(0) <= 26){
            upChar++;
        }
        else if(c.charCodeAt(0) - '0'.charCodeAt(0) >= 0 && c.charCodeAt(0) - '0'.charCodeAt(0) <= 9){
            digitChar++;
        }
        else{
            for(let j = 0; j < SPEC_CHAR_ARR.length; j++){
                if(SPEC_CHAR_ARR[j] === c){
                    specChar++;
                    break;
                }
            }
        }
    }
    if(lowChar < MIN_LOW_CHAR) lowCharChecked = false;
    if(upChar < MIN_UP_CHAR) upCharChecked = false;
    if(digitChar < MIN_DIGIT) digitChecked = false;
    if(specChar < MIN_SPEC_CHAR) specCharChecked = false;

    // Return status of password validation as follow
    // [length, up, low, spec, digit]
    let status = [lengthChecked, upCharChecked, lowCharChecked, specCharChecked, digitChecked];
    return status;
}

module.exports.encrypt_data = function EncryptData(data, secretKey, iv=null){
    var CryptoJS = require('crypto-js');
    if(iv === null)
        return CryptoJS.AES.encrypt(data, secretKey).toString();
    return CryptoJS.AES.encrypt(data, secretKey, {iv: iv, mode: CryptoJS.mode.CFB, padding: CryptoJS.pad.Pkcs7}).toString();
}

module.exports.decrypt_data = function DecryptData(encryptedData, secretKey, iv=null){
    var CryptoJS = require('crypto-js');
    
    if(iv === null)
        return CryptoJS.AES.decrypt(encryptedData, secretKey).toString();
    return CryptoJS.AES.decrypt(encryptedData, secretKey, {iv: iv, mode: CryptoJS.mode.CFB, padding: CryptoJS.pad.Pkcs7}).toString();
}

module.exports.signData = function SignData(data, secretKey){
    var CryptoJS = require('crypto-js');
    var hash = CryptoJS.HmacSHA256(data, secretKey);
    return CryptoJS.enc.Base64.stringify(hash);
}
