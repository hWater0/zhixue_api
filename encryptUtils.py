import binascii
from Crypto.Cipher import ARC4
import random
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

class RSAObject:
    def __init__(self, exponent: str, decryption: str, modulus: str):
        self.e = int(exponent, 16)
        self.d = int(decryption, 16)
        self.m = int(modulus, 16)
        self.digitSize = (self.m.bit_length() + 7) // 8
        self.chunkSize = self.digitSize - 11
        #self.radix = 16
        #self.barrettMu = (1 << 16 * self.digitSize) // self.m
        #self.barrettBkplus1 = (1 << 8 * (self.digitSize + 2))

class RSAUtils:
    @staticmethod
    def getKeyPair(exponent: str, decryption: str, modulus: str) -> RSAObject: 
        if (decryption == ""):
            decryption = "0"
        return RSAObject(exponent, decryption, modulus)
    def encryptedString(obj: RSAObject, text: str):
        data = text.encode("utf-8")
        size = len(data)
        ns = ""
        for l in range(0, size, obj.chunkSize):
            t = size % obj.chunkSize if l + obj.chunkSize > size else obj.chunkSize
            s = data[l:(l + t)]
            s += b"\x00"
            r = max(8, obj.digitSize - 3 - t)
            for u in range(r):
                s += random.randint(1, 254).to_bytes(1)
            s += b"\x02\x00"
            si = int.from_bytes(s, "little")
            n: int = pow(si, obj.e, obj.m)
            ns = format(n, "x").zfill(obj.digitSize * 2) + ns
        return ns
if __name__ == "__main__":
    r = RSAUtils.getKeyPair("010001", "", "00ccd806a03c7391ee8f884f5902102d95f6d534d597ac42219dd8a79b1465e186c0162a6771b55e7be7422c4af494ba0112ede4eb00fc751723f2c235ca419876e7103ea904c29522b72d754f66ff1958098396f17c6cd2c9446e8c2bb5f4000a9c1c6577236a57e270bef07e7fe7bbec1f0e8993734c8bd4750e01feb21b6dc9")
    a = RSAUtils.encryptedString(r, "333")
    print(a)