import binascii
from Crypto.Cipher import ARC4
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
