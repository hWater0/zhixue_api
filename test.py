import execjs
with open("sso.js","r",encoding="utf-8") as fr:
    code = fr.read()
ctx = execjs.compile(code)
print(ctx.call("getKey","LT/LT-22457145-CGGzNSJlKM66tgteqrboSnyKLadtHW/qwer1234"))