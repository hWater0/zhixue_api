import os,shutil
from tqdm import tqdm
class AnswerToImage:
    def __init__(self):
        self.wk_cmd = "wkhtmltopdf\\bin\\wkhtmltoimage.exe \"question.html\" \"output\\output%.png\""
        if os.path.exists("output"):
            shutil.rmtree("output")
        os.mkdir("output")
    def parse_answer(self,answer):
        i = 0
        for part in answer:
            for q in tqdm(part["topicAnalysisDTOs"]):
                html = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>菜鸟教程</title>
</head>
<body>
"""
                html += q["contentHtml"]
                html += "<br><br><br><br><br><br>"
                html += q["answerHtml"]
                html += "<br><br><br>"
                html += q["analysisHtml"]
                html += "</body></html>"
                with open("question.html","w",encoding="utf-8") as fw:
                    fw.write(html)
                os.system(self.wk_cmd.replace("%",str(i)))
                i += 1