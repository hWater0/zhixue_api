import json
import random
import hashlib
import rsa
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

class Geetest4Solver:
    def __init__(self, captcha_id, lot_number, pow_detail, passtime, setLeft, rsa_n=None, rsa_e=65537):
        self.captcha_id = captcha_id
        self.lot_number = lot_number
        self.pow_detail = pow_detail
        self.passtime = passtime
        self.setLeft = setLeft
        
        # RSA公钥参数（需要根据实际网站调整）
        self.rsa_n = rsa_n or '00C1E3934D1614465B33053E7F48EE4EC87B14B95EF88947713D25EECBFF7E74C7977D02DC1D9451F79DD5D1C10C29ACB6A9B4D6FB7D0A0279B6719E1772565F09AF627715919221AEF91899CAE08C0D686D748B20A3603BE2318CA6BC2B59706592A9219D0BF05C9F65023A21D2330807252AE0066D59CEEFA5F2748EA80BAB81'
        self.rsa_e = rsa_e
    
    def set_rsa_parameters(self, n, e=65537):
        """设置RSA参数"""
        self.rsa_n = n
        self.rsa_e = e
    
    def generate_random_string(self, length=16):
        """生成指定长度的随机十六进制字符串"""
        return ''.join(random.choices('0123456789abcdef', k=length))
    
    def generate_pow_info(self):
        """生成pow_msg和pow_sign"""
        version = self.pow_detail.get('version', '1')
        bits = self.pow_detail.get('bits', 0)
        hashfunc = self.pow_detail.get('hashfunc', 'md5')
        datetime = self.pow_detail.get('datetime', '')
        
        # 选择哈希函数
        if hashfunc == 'sha256':
            hash_fn = hashlib.sha256
        elif hashfunc == 'sha1':
            hash_fn = hashlib.sha1
        else:
            hash_fn = hashlib.md5
        
        # 计算需要的前导零
        prefix = '0' * (bits // 4) if bits > 0 else ''
        
        # 循环生成满足条件的pow_msg和pow_sign
        while True:
            # 生成16位随机十六进制字符串
            random_key = self.generate_random_string(16)
            
            # 构造pow_msg
            pow_msg = f"{version}|{bits}|{hashfunc}|{datetime}|{self.captcha_id}|{self.lot_number}||{random_key}"
            
            # 计算pow_sign
            pow_sign = hash_fn(pow_msg.encode()).hexdigest()
            
            # 检查是否满足前导零条件
            if bits == 0 or pow_sign.startswith(prefix):
                return pow_msg, pow_sign
    
    def calculate_userresponse(self):
        """计算userresponse值"""
        return self.setLeft / 1.0059466666666665 + 2
    
    def generate_aes_key(self):
        """生成16位随机AES密钥"""
        return self.generate_random_string(16)
    
    def aes_encrypt(self, data, key):
        """AES加密"""
        # 将数据转换为JSON字符串
        json_data = json.dumps(data, separators=(',', ':'))
        
        # AES加密配置
        iv = b'0000000000000000'
        cipher = AES.new(key.encode('utf-8'), AES.MODE_CBC, iv)
        
        # PKCS7填充并加密
        padded_data = pad(json_data.encode('utf-8'), AES.block_size)
        encrypted = cipher.encrypt(padded_data)
        
        # 转换为十六进制字符串
        return encrypted.hex()
    
    def rsa_encrypt(self, plaintext):
        """RSA加密"""
        # 构造公钥
        key = rsa.PublicKey(e=self.rsa_e, n=int(self.rsa_n, 16))
        
        # 加密
        message = rsa.encrypt(plaintext.encode('utf-8'), key)
        
        # 转换为十六进制字符串
        return message.hex()
    
    def generate_w_value(self):
        """生成w值"""
        # 生成pow_msg和pow_sign
        pow_msg, pow_sign = self.generate_pow_info()
        
        # 计算userresponse
        userresponse = self.calculate_userresponse()
        
        # 生成AES密钥
        aes_key = self.generate_aes_key()
        
        # 构造加密数据
        encrypt_data = {
            "setLeft": self.setLeft,
            "passtime": self.passtime,
            "userresponse": userresponse,
            "device_id": "",
            "lot_number": self.lot_number,
            "pow_msg": pow_msg,
            "pow_sign": pow_sign,
            "geetest": "captcha",
            "lang": "zh",
            "ep": "123",
            "biht": "1426265548",
            "gee_guard": {
                "roe": {
                    "aup": "3",
                    "sep": "3",
                    "egp": "3",
                    "auh": "3",
                    "rew": "3",
                    "snh": "3",
                    "res": "3",
                    "cdc": "3"
                }
            },
            "W4Ec": "7RXi",
            "ec24": {
                "551bf48a": {
                    "bf48daec": "1755"
                }
            },
            "em": {
                "ph": 0,
                "cp": 0,
                "ek": "11",
                "wd": 1,
                "nt": 0,
                "si": 0,
                "sc": 0
            }
        }
        
        # AES加密
        aes_encrypted = self.aes_encrypt(encrypt_data, aes_key)
        
        # RSA加密AES密钥
        rsa_encrypted = self.rsa_encrypt(aes_key)
        
        # 组合w值
        w = aes_encrypted + rsa_encrypted
        return w

# 使用示例
def main():
    # 已知参数
    captcha_id = "54088bb07d2df3c46b79f80300b0abbe"
    lot_number = "63d16e4da9fc4682aed6b359c796769c"
    pow_detail = {
        "version": "1",
        "bits": 0,
        "datetime": "2025-04-14T08:48:05.208562+08:00",
        "hashfunc": "md5"
    }
    passtime = 1500  # 滑动时间（毫秒）
    setLeft = 176    # 滑动距离（像素）
    
    # 创建求解器实例
    solver = Geetest4Solver(captcha_id, lot_number, pow_detail, passtime, setLeft)
    
    # 如果您有特定网站的RSA参数，请使用以下方法设置：
    # solver.set_rsa_parameters("您的RSA模数n", 65537)
    
    # 生成w值
    w = solver.generate_w_value()
    
    # 输出结果
    print(f"captcha_id: {captcha_id}")
    print(f"lot_number: {lot_number}")
    print(f"passtime: {passtime}")
    print(f"setLeft: {setLeft}")
    print(f"w值: {w}")
    # 验证pow_msg和pow_sign
    pow_msg, pow_sign = solver.generate_pow_info()
    print(f"\npow_msg: {pow_msg}")
    print(f"pow_sign: {pow_sign}")

if __name__ == "__main__":
    main()
