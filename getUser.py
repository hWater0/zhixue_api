import requests,json,uuid,time
from encryptUtils import RC4Helper
from patch_captcha import get_captcha
from urllib.parse import quote
import execjs
from loguru import logger
import os
import urllib.parse
import getpass

COOKIES_PATH = "cookies.json"

class ZhixueUserLogin:
    def __init__(self, cookiesPath):
        self.userId = ""
        self.cookies = {}
        self.loginState = {}
        self.cookiesPath = cookiesPath
        self.loadCookies()
        self.generateDeviceID()
        self.refreshLoginState()
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
    def generateDeviceID(self):
        if (not "deviceId" in self.cookies):
            self.cookies["deviceId"] = str(uuid.uuid4()).upper()
            self.saveCookies()
    def loadCookies(self):
        if os.path.exists(self.cookiesPath):
            with open(self.cookiesPath, "r") as file:
                self.cookies = json.loads(file.read())
    def saveCookies(self):
        with open(self.cookiesPath, "w") as file:
            file.write(json.dumps(self.cookies))
    def refreshLoginState(self):
        re = requests.get("https://www.zhixue.com/loginState/", cookies=self.cookies)
        self.loginState = re.json()
        #self.loginState["serviceUrlRaw"] = self.loginState["serviceUrl"]
        self.loginState["serviceUrl"] = urllib.parse.quote(self.loginState["serviceUrl"])
        if not "tlsysSessionId" in self.cookies:
            self.cookies["tlsysSessionId"] = re.cookies.get("tlsysSessionId")
            self.saveCookies()
    def getLoginState(self, refresh=True):
        if refresh:
            self.refreshLoginState()
        return self.loginState["result"]
    def get_cpid(self,c,username,password):
        U = "https://www.zhixue.com/edition/login?from=web_login"
        form_data = {
            "appId": "zx-container-client",
            "captchaType": "third",
            "deviceName": "web",
            "client": "web",
            "deviceId": self.cookies["deviceId"],
            "thirdCaptchaExtInfo[captcha_id]": c["captcha_id"],
            "thirdCaptchaExtInfo[lot_number]": c["lot_number"],
            "thirdCaptchaExtInfo[pass_token]": c["pass_token"],
            "thirdCaptchaExtInfo[gen_time]": c["gen_time"],
            "thirdCaptchaExtInfo[captcha_output]": c["captcha_output"],
            "loginName": username,
            "description": "encrypt",
            "password": RC4Helper.toHexString(RC4Helper.rc4(password,"iflytzhixueweb"))
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
        U = self.loginState["casUrl"]
        params = {
            "sso_from": "zhixuesso",
            "service": self.loginState["serviceUrl"],
            "callback": f"jQuery035496251942680546_{self.get_time()}"
        }
        
        # 构造完整URL
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        full_url = f"{U}/login?{query_string}"
        
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
    def login(self, username: str, password: str):
        """
        loginByNormal 普通登录

        :param username: 用户名
        :param password: 密码
        """
        logger.info("开始登录")
        logger.info("获取验证码")
        captcha = get_captcha()
        logger.info("验证码output - "+json.dumps(captcha))
        logger.info("获取LT参数")
        lt_data = self.getLT()
        logger.info("lt - "+lt_data["data"]["lt"])
        logger.info("获取cpid")
        cd = self.get_cpid(captcha, username, password)
        logger.info("cpid -> "+json.dumps(cd[0]))
        ck = cd[1]
        if 'data' in lt_data and 'SSO_R_SESSION_ID' in lt_data['data']:
            ck["SSO_R_SESSION_ID"] = lt_data["data"]["SSO_R_SESSION_ID"]
        ck["deviceId"] = self.cookies["deviceId"]
        ck["tlsysSessionId"] = self.cookies["tlsysSessionId"]
        lt_value = lt_data["data"]["lt"]
        encrypted_password = self.getPassword(lt_value,password)
        base_url = self.loginState["casUrl"]
        cbk = f"jQuery035496251942680546_{self.get_time()}"
        params = {
            "sso_from": "zhixuesso",
            "service": self.loginState["serviceUrl"],
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
            "username": username,
            "encodeType": "R2/P/LT",
            "password": encrypted_password,
            "mac": self.cookies["deviceId"],
            "useAreaExamNo": "true",
            "_": self.get_time()
        }
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        URL = f"{base_url}?{query_string}"
        hs = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0",
            "Referer": "https://www.zhixue.com/"
        }
        res = requests.get(URL, cookies=ck, headers=hs)
        response_text = res.text.strip()
        data = self.p_jsonp(response_text,cbk)
        logger.info("登录结果 -> "+json.dumps(data))
        res.cookies.update(ck)
        res = requests.post("https://www.zhixue.com/ssoservice.jsp", cookies=ck, data={"action": "login", "ticket": data["data"]["st"]})
        logger.info(res.text)
        res = requests.post("https://www.zhixue.com/loginSuccess/", cookies=ck, data={"userId": self.userId})
        logger.info(res.status_code)
if __name__ == "__main__":
    z = ZhixueUserLogin("cookies.json")
    if z.getLoginState(False) == "fall":
        logger.info("请先登录")
        us = input("USERNAME=")
        ps = getpass.getpass("PASSWORD=")
        z.login(us, ps)
    logger.info("登录状态" + z.getLoginState())