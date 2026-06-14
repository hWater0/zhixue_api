from getData import ZhixueWeb
from answer_conv import AnswerToImage
if __name__ == "__main__":
    us,ps = (input("USERNAME="),input("PASSWORD="))
    z = ZhixueWeb(us,ps)
    print("选择学年")
    i = 0
    for y in z.years:
        print(f"[{i}] - {y['name']}")
        i += 1
    y = int(input(">>> "))
    d = z.get_exam(y)
    i = 0
    for da in d:
        print(f"[{i}] - {da['examName']}")
        i += 1
    eid = int(input(">>> "))
    r = z.get_detail(d[eid]["examId"])["result"]["paperList"][0]
    print("=============================")
    print(r["paperName"]+" - "+r["subjectName"])
    print(f"得分 - {r['userScore']}/{r['standardScore']}")
    ans = z.get_answer(d[eid]["examId"],r["paperId"],y,r["subjectCode"])
    print("===================================")
    print("下载答案")
    atp = AnswerToImage()
    atp.parse_answer(ans)

