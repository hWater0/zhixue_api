from loguru import logger
from getUser import ZhixueUserLogin
import requests,json
class ZhixueWeb:
    def __init__(self,username,password):
        self.account = ZhixueUserLogin(username,password)
        self.account.login()
        self.headers = {
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0",
            "Referer":"https://www.zhixue.com/htm-vessel/",
            "Host":"www.zhixue.com"
        }
        self.userToken = self.get_token()
        self.headers2 = {
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0",
            "Referer":"https://www.zhixue.com",
            "token":self.userToken,
            "xtoken":self.userToken
        }
        logger.info(self.userToken)
        self.years = self.get_year()
    def get_token(self):
        url = "https://www.zhixue.com/container/app/token/getToken"
        h = self.headers
        h["Cookies"] = self.account.cookie_to_str(self.account.login_cookie)
        result = requests.get(url,headers=h,cookies=self.account.login_cookie).json()
        logger.info(json.dumps(result))
        return result["result"]
    def get_year(self):
        url = "https://ali-bg.zhixue.com/zhixuebao/base/common/academicYear"
        logger.debug(self.headers2)
        result = requests.get(url,headers=self.headers2,cookies=self.account.login_cookie)
        logger.info(result.text)
        return result.json()["result"]
    def get_exam(self,yi):
        end = False
        datas = []
        url = "https://ali-bg.zhixue.com/zhixuebao/report/exam/getUserExamList?pageIndex=1&pageSize=10&startSchoolYear="+self.years[yi]["beginTime"]\
        +"&endSchoolYear="+self.years[yi]["endTime"]
        while not end:
            logger.debug(self.headers2)
            result = requests.get(url,headers=self.headers2,cookies=self.account.login_cookie)
            logger.info(result.text)
            d = result.json()
            for da in d["result"]["examList"]:
                datas.append(da)
            if not d["result"]["hasNextPage"]:
                end = True
            else:
                url = "https://ali-bg.zhixue.com/zhixuebao/report/exam/getUserExamList?pageIndex="+str(d["result"]["pagination"]["pageIndex"])+\
                    "&pageSize="+str(d["result"]["pagination"]["pageSize"])+"&startSchoolYear="+self.years[yi]["beginTime"]\
                +"&endSchoolYear="+self.years[yi]["endTime"]
        return datas
    def get_detail(self,eid):
        url = "https://ali-bg.zhixue.com/zhixuebao/report/exam/getReportMain?examId="+eid
        logger.debug(self.headers2)
        result = requests.get(url,headers=self.headers2,cookies=self.account.login_cookie)
        logger.info(result.text)
        return result.json()
    def get_answer(self,eid,pid,yi,sjc):
        u = "https://www.zhixue.com/zhixuebao/zhixuebao/transcript/analysis/main/?subjectCode="+sjc\
            +"&classId=null&paperId="+pid\
            +"&examId="+eid\
            +"&token="+self.userToken+"&startSchoolYear="+self.years[yi]["beginTime"]\
            +"&endSchoolYear="+self.years[yi]["endTime"]
        html = requests.get(u,headers=self.headers,cookies=self.account.login_cookie)
        html = html.text
        res = html.split("var hisQueParseDetail = ")[1].split("];")[0]+']'
        res = json.loads(res)
        logger.info(res)
        return res