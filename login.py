import requests,json,binascii,uuid,time
from Crypto.Cipher import ARC4
from patch_captcha import get_captcha
import rsa
import binascii
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
import base64
USERNAME = "84882682"
PASSWORD = "qwer1234"
headers = {
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"
}
def get_time():
    return str(round(time.time()*1000))
def req_jsonp(url,jsonp):
    content = requests.get(url,headers=headers).text.strip()
    t = content.split(jsonp+"(")
    return json.loads((t[1][:len(t[1])-1]).replace("\'","").replace("\\",""))
class RSAUtils:
    @staticmethod
    def getKeyPair(e, d, n):
        """
        模拟JavaScript中的getKeyPair函数
        :param e: 公钥指数 (十六进制字符串)
        :param d: 私钥指数 (这里为空，因为我们只需要公钥)
        :param n: 模数 (十六进制字符串)
        :return: RSA公钥对象
        """
        # 将十六进制字符串转换为整数
        e_int = int(e, 16) if e else 65537  # 010001 = 65537
        n_int = int(n, 16)
        
        # 创建RSA公钥对象
        public_key = rsa.PublicKey(n_int, e_int)
        return public_key
    
    @staticmethod
    def encryptedString(public_key, data):
        """
        模拟JavaScript中的encryptedString函数
        :param public_key: RSA公钥对象
        :param data: 要加密的字符串
        :return: 加密后的十六进制字符串
        """
        # 将字符串编码为字节
        data_bytes = data.encode('utf-8')
        
        # 使用RSA加密
        encrypted_bytes = rsa.encrypt(data_bytes, public_key)
        
        # 转换为十六进制字符串
        encrypted_hex = binascii.hexlify(encrypted_bytes).decode('utf-8')
        
        return encrypted_hex
class RC4Helper:
    @staticmethod
    def rc4(data, key):
        """
        模拟JavaScript中的RC4加密
        """
        if isinstance(data, str):
            data = data.encode('utf-8')
        if isinstance(key, str):
            key = key.encode('utf-8')
            
        cipher = ARC4.new(key)
        return cipher.encrypt(data)
    
    @staticmethod
    def toHexString(byte_data):
        """
        将字节数据转换为十六进制字符串
        """
        if isinstance(byte_data, str):
            byte_data = byte_data.encode('utf-8')
        return binascii.hexlify(byte_data).decode('utf-8')
def get_cpid(c,did):
    U = "https://www.zhixue.com/edition/login?from=web_login"
    form_data = {
        "appId": "zx-container-client",
        "captchaType": "third",
        "deviceName": "web",
        "client": "web",
        "deviceId": did,
        "thirdCaptchaExtInfo[captcha_id]": c["captcha_id"],
        "thirdCaptchaExtInfo[lot_number]": c["lot_number"],
        "thirdCaptchaExtInfo[pass_token]": c["pass_token"],
        "thirdCaptchaExtInfo[gen_time]": c["gen_time"],
        "thirdCaptchaExtInfo[captcha_output]": c["captcha_output"],
        "loginName": USERNAME,
        "description": "encrypt",
        "password": RC4Helper.toHexString(RC4Helper.rc4(PASSWORD,"iflytzhixueweb"))
    }
    res = requests.post(U,data=form_data,headers=headers).json()
    return res
def getLT():
    U = "https://open.changyan.com/sso/login?sso_from=zhixuesso&service=https://www.zhixue.com:443/ssoservice.jsp&callback=jQuery035496251942680546_1780136718101&_="+get_time()
    result = req_jsonp(U,"jQuery035496251942680546_1780136718101")
    return result["data"]["lt"]
def getPassword(lt,p):
    e = "010001"  # 公钥指数 (65537)
    n = "00ccd806a03c7391ee8f884f5902102d95f6d534d597ac42219dd8a79b1465e186c0162a6771b55e7be7422c4af494ba0112ede4eb00fc751723f2c235ca419876e7103ea904c29522b72d754f66ff1958098396f17c6cd2c9446e8c2bb5f4000a9c1c6577236a57e270bef07e7fe7bbec1f0e8993734c8bd4750e01feb21b6dc9"  # 模数
    
    # 创建RSA公钥
    public_key = RSAUtils.getKeyPair(e, "", n)
    
    # 模拟数据 (请根据实际情况替换)
    f_lt = lt  # 示例时间戳或lt值
    c_password = p  # 示例密码
    
    # 构造要加密的字符串
    k = "LT/" + f_lt + "/" + c_password
    encrypted_password = RSAUtils.encryptedString(public_key, k)
    return encrypted_password
def login():
    captcha = get_captcha()
    lt = getLT()
    did = str(uuid.uuid4()).upper()
    URL = "https://open.changyan.com/sso/login?sso_from=zhixuesso&service=https://www.zhixue.com:443/ssoservice.jsp&callback=jQuery035496251942680546_1780136718101"
    URL += "&captchaId="+get_cpid(captcha,did)["data"]["captchaId"]
    URL += "&captchaType=third&thirdCaptchaParam="+json.dumps(captcha)
    URL += "&version=v2&encode=true&sourceappname=tkyh,tkyh&_eventId=submit&appId=zx-container-client&client=web&type=loginByNormal&key=auto"
    URL += "&lt="+lt
    URL += '&execution=e4s1&customLogoutUrl=//www.zhixue.com&ncetAppId=QLIqXrxyxFsURfFhp4Hmeyh09v6aYTq1&sysCode&behaviorCheckInPc=true&needBehaviorCheck=true&customConfig={"redirectUrl":"https://www.zhixue.com","needSsoLogin":"false"}&username=84882682&encodeType=R2/P/LT'
    URL += "&password="+getPassword(lt,PASSWORD)
    URL += "&mac="+did+"&useAreaExamNo=true&_="+get_time()
    print(URL)
    res = req_jsonp(URL,"jQuery035496251942680546_1780136718101")
    print(res)
login()