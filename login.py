import requests,json,binascii,uuid,time
from Crypto.Cipher import ARC4
from patch_captcha import get_captcha
import rsa
from urllib.parse import quote

USERNAME = input("name:")
PASSWORD = input("password:")

def get_time():
    return str(round(time.time()*1000))

def req_jsonp(url,jsonp,headers=None):
    hs = {
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"
    }
    content = requests.get(url,headers=headers if headers else hs).text.strip()
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
        
        # 使用RSA加密 (PKCS#1 v1.5 填充)
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
    hs = {
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"
    }
    res = requests.post(U,data=form_data,headers=hs)
    return res.json(),res.cookies.get_dict()

def getLT():
    """
    对应JavaScript中的F函数，获取LT参数
    """
    print("=== 步骤1: 获取LT参数 ===")
    U = "https://sso.zhixue.com/sso_alpha/login"
    params = {
        "sso_from": "zhixuesso",
        "service": "https://www.zhixue.com:443/ssoservice.jsp",
        "callback": f"jQuery035496251942680546_{get_time()}"
    }
    
    # 构造完整URL
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    full_url = f"{U}?{query_string}"
    
    hs = {
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"
    }
    
    try:
        response = requests.get(full_url, headers=hs)
        print(f"LT请求URL: {full_url}")
        print(f"LT响应状态: {response.status_code}")
        
        # 解析JSONP响应
        content = response.text.strip().replace("\\","").replace("\'",'')
        if content.startswith("jQuery"):
            # 提取JSON部分
            json_str = content[content.find('(')+1:content.rfind(')')]
            print(json_str)
            data = json.loads(json_str)
            print(f"LT数据: {data}")
            return data
        else:
            print(f"LT响应内容: {content}")
            return {"result": "fail", "message": "无法解析LT响应"}
    except Exception as e:
        print(f"获取LT参数失败: {e}")
        return {"result": "fail", "message": str(e)}

def getPassword(lt, p):
    """
    完全按照JavaScript逻辑实现的密码加密
    对应JavaScript代码中的密码加密逻辑:
    h = RSAUtils.getKeyPair("010001", "", "00ccd806a03c7391ee8f884f5902102d95f6d534d597ac42219dd8a79b1465e186c0162a6771b55e7be7422c4af494ba0112ede4eb00fc751723f2c235ca419876e7103ea904c29522b72d754f66ff1958098396f17c6cd2c9446e8c2bb5f4000a9c1c6577236a57e270bef07e7fe7bbec1f0e8993734c8bd4750e01feb21b6dc9");
    k = "LT/" + f.lt + "/" + c.password;
    e.encodeType = "R2/P/LT";
    e.password = RSAUtils.encryptedString(h, k);
    """
    print("=== 步骤2: RSA加密密码 ===")
    
    # RSA参数（与JavaScript完全一致）
    e = "010001"  # 公钥指数 (65537)
    n = "00ccd806a03c7391ee8f884f5902102d95f6d534d597ac42219dd8a79b1465e186c0162a6771b55e7be7422c4af494ba0112ede4eb00fc751723f2c235ca419876e7103ea904c29522b72d754f66ff1958098396f17c6cd2c9446e8c2bb5f4000a9c1c6577236a57e270bef07e7fe7bbec1f0e8993734c8bd4750e01feb21b6dc9"  # 模数
    
    # 创建RSA公钥（与JavaScript完全一致）
    # public_key = RSAUtils.getKeyPair(e, "", n)
    
    # 构造要加密的字符串（与JavaScript完全一致）
    k = "LT/" + str(lt) + "/" + str(p)
    print(f"待加密字符串: {k}")
    
    # 执行RSA加密（与JavaScript完全一致）
    # encrypted_password = RSAUtils.encryptedString(public_key, k)
    import execjs
    with open("sso.js","r",encoding="utf-8") as fr:
        code = fr.read()
    ctx = execjs.compile(code)
    encrypted_password = ctx.call("getKey",k)
    print(f"加密后密码长度: {len(encrypted_password)}")
    print(f"加密后密码: {encrypted_password}")
    return encrypted_password

def cookie_to_str(cookie):
    s = ""
    for key in cookie.keys():
        s += key
        s += "="
        s += cookie[key]
        s += ";"
    return s[:len(s)-1]

def login():
    try:
        print("=" * 60)
        print("开始智学网登录流程")
        print("=" * 60)
        
        # 获取验证码 (使用您原有的patch_captcha方式)
        print("=== 步骤0: 获取验证码 ===")
        captcha = get_captcha()
        print("✅ 验证码获取成功")
        print(f"验证码数据 keys: {list(captcha.keys())}")
        
        # 获取LT参数（对应JavaScript中的F函数）
        lt_data = getLT()
        if not lt_data or lt_data.get("result") == "fail":
            print("❌ 获取LT参数失败")
            return None
        print("✅ LT参数获取成功")
        
        # 生成设备ID
        did = str(uuid.uuid4()).upper()
        print(f"设备ID: {did}")
        
        # 获取CPID和Cookie
        print("=== 步骤3: 获取CPID和Cookie ===")
        cd = get_cpid(captcha, did)
        print("✅ CPID和Cookie获取成功")
        print(f"CD数据 keys: {list(cd[0].keys())}")
        
        # 处理Cookie
        ck = cd[1]
        if 'data' in lt_data and 'SSO_R_SESSION_ID' in lt_data['data']:
            ck["SSO_R_SESSION_ID"] = lt_data["data"]["SSO_R_SESSION_ID"]
        print(f"Cookie keys: {list(ck.keys())}")
        
        # 获取加密后的密码（对应JavaScript中的密码加密逻辑）
        if 'data' not in lt_data or 'lt' not in lt_data['data']:
            print("❌ LT数据中缺少lt参数")
            return None
            
        lt_value = lt_data["data"]["lt"]
        print(f"LT值: {lt_value}")
        
        encrypted_password = getPassword(lt_value, PASSWORD)
        print("✅ 密码加密成功")
        
        # 构造登录URL（对应JavaScript中的v函数）
        print("=== 步骤4: 构造登录请求 ===")
        base_url = "https://sso.zhixue.com/sso_alpha/login"
        params = {
            "sso_from": "zhixuesso",
            "service": "https://www.zhixue.com:443/ssoservice.jsp",
            "callback": f"jQuery035496251942680546_{get_time()}",
            "captchaId": cd[0]["data"]["captchaId"] if 'data' in cd[0] and 'captchaId' in cd[0]['data'] else "default_captcha_id",
            "captchaType": "third",
            "thirdCaptchaParam": quote(json.dumps(captcha)),
            "version": "v2",
            "encode": "true",
            "sourceappname": "tkyh,tkyh",
            "_eventId": "submit",
            "appId": "zx-container-client",
            "client": "web",
            "type": "loginByNormal",
            "key": "auto",
            "lt": lt_value,
            "execution": lt_data["data"]["execution"] if 'data' in lt_data and 'execution' in lt_data['data'] else "",
            "customLogoutUrl": "//www.zhixue.com",
            "ncetAppId": "QLIqXrxyxFsURfFhp4Hmeyh09v6aYTq1",
            "sysCode": "",
            "behaviorCheckInPc": "true",
            "needBehaviorCheck": "true",
            "customConfig": quote('{"redirectUrl":"https://www.zhixue.com","needSsoLogin":"false"}'),
            "username": USERNAME,
            "encodeType": "R2/P/LT",
            "password": encrypted_password,
            "mac": did,
            "useAreaExamNo": "true",
            "_": get_time()
        }
        
        # 构造完整URL
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        URL = f"{base_url}?{query_string}"
        
        print("✅ 登录URL构造完成")
        print(f"URL参数个数: {len(params)}")
        
        # 构造Cookie字符串
        cookie_str = cookie_to_str(ck)
        print(f"Cookie字符串长度: {len(cookie_str)}")
        
        # 发送登录请求
        print("=== 步骤5: 发送登录请求 ===")
        hs = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0",
            "Referer": "https://www.zhixue.com/",
            "Cookie": cookie_str
        }
        
        print("正在发送登录请求...")
        print(f"请求URL长度: {len(URL)}")
        
        res = requests.get(URL, cookies=ck, headers=hs)
        
        print(f"✅ 登录响应状态码: {res.status_code}")
        print(f"响应头: {dict(res.headers)}")
        
        # 输出完整响应内容
        response_text = res.text
        print(f"响应内容长度: {len(response_text)}")
        print(f"响应内容: {response_text}")
        
        # 尝试解析JSONP响应
        if response_text.startswith("jQuery"):
            try:
                json_start = response_text.find('(') + 1
                json_end = response_text.rfind(')')
                if json_start > 0 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    response_data = json.loads(json_str)
                    print(f"解析后的响应数据: {response_data}")
            except Exception as parse_error:
                print(f"JSON解析错误: {parse_error}")
        
        print("=" * 60)
        print("登录流程完成")
        print("=" * 60)
        
        return res
        
    except Exception as e:
        print(f"登录过程中出现错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

# 主程序入口
if __name__ == "__main__":
    login()
