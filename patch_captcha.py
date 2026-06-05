import random
from params import Geetest4Solver
import requests,time,json,uuid,pprint,time
from get_slide import get_distance
def req_jsonp(url,jsonp):
    content = requests.get(url,headers=headers).text
    t = content.split(jsonp+"(")
    return json.loads(t[1][:len(t[1])-1])
def download(url,file):
    with open(file,"wb") as fw:
        fw.write(requests.get(url,headers=headers).content)
headers = {
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"
}
def get_time():
    return str(round(time.time()*1000))
def get_captcha():
    GET_CAPTCHA_ID_URL = "https://open.changyan.com/sso/v1/getCaptchaType?sso_from=zhixuesso&callback=jQuery04726437087003722_1780496936268&appId=zx-container-client&client=web&needSsoConf=true&_="
    result = req_jsonp(GET_CAPTCHA_ID_URL+get_time(),"jQuery04726437087003722_1780496936268")
    captchaConf = json.loads(result["data"]["captchaConf"])
    captcha_id = captchaConf["gt"]
    print(captcha_id)
    cpt = ""
    captcha_detail = None
    while cpt != "slide":
        print("try get slide")
        GET_CAPTCHA_URL = "https://xunfei.geetest.com/load?captcha_id="+captcha_id\
                +"&challenge="+ str(uuid.uuid4())\
                +"&client_type=0&pt=0&callback=geetest_1780496938625"
        result = req_jsonp(GET_CAPTCHA_URL,"geetest_1780496938625")
        captcha_detail = result
        cpt = result["data"]["captcha_type"]
        time.sleep(0.5)
    pprint.pprint(captcha_detail)
    PIC_BASEURL = "https://static.geetest.com/"
    #download pic
    download(PIC_BASEURL+captcha_detail["data"]["bg"],"bg.png")
    download(PIC_BASEURL+captcha_detail["data"]["slice"],"slice.png")
    with open("bg.png", "rb") as f:
        bg_img = f.read()
    with open("slice.png", "rb") as f:
        slice_img = f.read()
    distance = get_distance(bg_img, slice_img,save_path="result.png")
    print(distance)
    passtime = random.randint(1500,1900)
    lot_number = captcha_detail["data"]["lot_number"]
    pow_detail = captcha_detail["data"]["pow_detail"]
    payload = captcha_detail["data"]["payload"]
    proc_token = captcha_detail["data"]["process_token"]
    solver = Geetest4Solver(captcha_id,lot_number,pow_detail,passtime,distance)
    w = solver.generate_w_value()
    print(w)
    VERIFY_URL = "https://xunfei.geetest.com/verify?callback=geetest_1780586054841&captcha_id="+ captcha_id\
        +"&client_type=web&lot_number="+ lot_number\
            +"&payload="+payload\
            +"&process_token="+proc_token+"&payload_protocol=1&pt=1&w="+w
    result = req_jsonp(VERIFY_URL,"geetest_1780586054841")
    pprint.pprint(result["data"]["seccode"])
    return result["data"]["seccode"]
if __name__ == "__main__":
    print(get_captcha())