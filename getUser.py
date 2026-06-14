import requests,json,uuid,time
from encrptyUtils import RC4Helper
from patch_captcha import get_captcha
from urllib.parse import quote
import execjs
from loguru import logger
class ZhixueUserLogin():
    def __init__(self,USERNAME,PASSWORD):
        self.USERNAME = USERNAME
        self.PASSWORD = PASSWORD
        self.did = str(uuid.uuid4()).upper()
        self.userId = ""
        self.login_cookie = ""
    @staticmethod
    def get_time():
        return str(round(time.time()*1000))
    @staticmethod
    def req_jsonp(url,jsonp,headers=None,need_ctx=False):
        hs = {
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"
        }
        ctx = requests.get(url,headers=headers if headers else hs)
        content = ctx.text.strip()
        t = content.split(jsonp+"(")
        if need_ctx:
            return (json.loads((t[1][:len(t[1])-1]).replace("\'","").replace("\\","")),ctx)
        else:
            return json.loads((t[1][:len(t[1])-1]).replace("\'","").replace("\\",""))
    
    @staticmethod
    def p_jsonp(content,jsonp):
        t = content.split(jsonp+"(")
        return json.loads((t[1][:len(t[1])-1]).replace("\'","").replace("\\",""))
    def get_cpid(self,c):
        U = "https://www.zhixue.com/edition/login?from=web_login"
        form_data = {
            "appId": "zx-container-client",
            "captchaType": "third",
            "deviceName": "web",
            "client": "web",
            "deviceId": self.did,
            "thirdCaptchaExtInfo[captcha_id]": c["captcha_id"],
            "thirdCaptchaExtInfo[lot_number]": c["lot_number"],
            "thirdCaptchaExtInfo[pass_token]": c["pass_token"],
            "thirdCaptchaExtInfo[gen_time]": c["gen_time"],
            "thirdCaptchaExtInfo[captcha_output]": c["captcha_output"],
            "loginName": self.USERNAME,
            "description": "encrypt",
            "password": RC4Helper.toHexString(RC4Helper.rc4(self.PASSWORD,"iflytzhixueweb"))
        }
        hs = {
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"
        }
        res = requests.post(U,data=form_data,headers=hs)
        logger.info(res.text)
        r = res.json()
        self.userId = r["data"]["userId"]
        return r,res.cookies.get_dict()
    def getLT(self):
        U = "https://sso.zhixue.com/sso_alpha/login"
        params = {
            "sso_from": "zhixuesso",
            "service": "https://www.zhixue.com:443/ssoservice.jsp",
            "callback": f"jQuery035496251942680546_{self.get_time()}"
        }
        
        # 构造完整URL
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        full_url = f"{U}?{query_string}"
        
        hs = {
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"
        }
        response = requests.get(full_url, headers=hs)
        content = response.text.strip().replace("\\","").replace("\'",'')
        if content.startswith("jQuery"):
            # 提取JSON部分
            json_str = content[content.find('(')+1:content.rfind(')')]
            data = json.loads(json_str)
            return data
    @staticmethod
    def getPassword(lt, p):
        k = "LT/" + str(lt) + "/" + str(p)
        with open("sso.js","r",encoding="utf-8") as fr:
            code = fr.read()
        ctx = execjs.compile(code)
        encrypted_password = ctx.call("getKey",k)
        return encrypted_password
    @staticmethod
    def cookie_to_str(cookie):
        s = ""
        for key in cookie.keys():
            s += key
            s += "="
            s += cookie[key]
            s += ";"
        return s[:len(s)-1]
    def login(self):
        logger.info("开始登录")
        logger.info("获取验证码")
        captcha = get_captcha()
        logger.info("验证码output - "+json.dumps(captcha))
        logger.info("获取LT参数")
        lt_data = self.getLT()
        logger.info("lt - "+lt_data["data"]["lt"])
        logger.info("获取cpid")
        cd = self.get_cpid(captcha)
        logger.info("cpid -> "+json.dumps(cd[0]))
        ck = cd[1]
        if 'data' in lt_data and 'SSO_R_SESSION_ID' in lt_data['data']:
            ck["SSO_R_SESSION_ID"] = lt_data["data"]["SSO_R_SESSION_ID"]
        lt_value = lt_data["data"]["lt"]
        encrypted_password = self.getPassword(lt_value,self.PASSWORD)
        base_url = "https://sso.zhixue.com/sso_alpha/login"
        cbk = f"jQuery035496251942680546_{self.get_time()}"
        params = {
            "sso_from": "zhixuesso",
            "service": "https://www.zhixue.com:443/ssoservice.jsp",
            "callback": cbk,
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
            "username": self.USERNAME,
            "encodeType": "R2/P/LT",
            "password": encrypted_password,
            "mac": self.did,
            "useAreaExamNo": "true",
            "_": self.get_time()
        }
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        URL = f"{base_url}?{query_string}"
        cookie_str = self.cookie_to_str(ck)
        hs = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0",
            "Referer": "https://www.zhixue.com/",
            "Cookie": cookie_str
        }
        res = requests.get(URL, cookies=ck, headers=hs)
        response_text = res.text.strip()
        data = self.p_jsonp(response_text,cbk)
        logger.info("登录结果 -> "+json.dumps(data))
        logger.info("cookie -> "+self.cookie_to_str(res.cookies))
        login_url = "https://www.zhixue.com/ssoservice.jsp"
        payload = {
            "action":"login",
            "ticket":data["data"]["st"]
        }
        log_res = requests.post(login_url,data=payload)
        logger.info(log_res.text.strip())
        c = dict(log_res.cookies)
        c["deviceId"] = self.did
        c["loginUserName"] = self.USERNAME
        c["SSO_R_SESSION_ID"] = lt_data["data"]["SSO_R_SESSION_ID"]
        c["ui"] = self.userId
        logger.info(self.cookie_to_str(c))
        self.login_cookie = c
if __name__ == "__main__":
    us = input("USERNAME=")
    ps = input("PASSWORD=")
    z = ZhixueUserLogin(us,ps)
    z.login()