/*
 * 文件名: sso.js
 * 描述: 提供对 CAS 单点登录的封装
 *
 * 功能说明:
 * 实现多个应用之间的单点登录（SSO）功能,应用可以部署在不同的域名。
 *
 * 兼容性说明:
 * 此版本sdk,同时支持普通项目使用,以及前后端分离项目使用。
 *
 * 接口列表:
 * login,登录接口
 * loginExt,扩展登录接口
 * logout,登出接口
 * getLoginState,获取登录状态接口
 * validateServiceTicket,验证ST接口
 * getDeviceId,获取设备ID接口
 * getAccessToken,获取访问token接口
 *
 * 登录方式:
 * 1.普通登录(account,password)
 * 2.验证码登录(loginType,phoneNum,smsVerifyCode,smsCaptchaId,smsLoginType,smsCaptchaCode)
 * 3.TGT在线自动登录(account,loginType,mac,tgt,timestamp,username,signature)
 * 4.通用方式登录(loginType,genericValidateUserAttributes,genericUserInfoAttributes)
 * 5.免密登录(loginType,token,platformKey,signature)
 * 6.账号切换(account)
 *
 */
var window = {
    location:{
        herf:""
    }
};
var document = {
    cookie:{
        match:()=>{}
    }
};
var sucWeb = {
    clazz:null
};
sucWeb.clazz = () => {};
var jQuery = {};
(function() {
    var a = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    Math.uuid = function(e, r) {
        var q = [], b;
        r = r || a.length;
        if (e)
            for (b = 0; b < e; b++)
                q[b] = a[0 | Math.random() * r];
        else {
            var d;
            q[8] = q[13] = q[18] = q[23] = "-";
            q[14] = "4";
            for (b = 0; 36 > b; b++)
                q[b] || (d = 0 | 16 * Math.random(),
                q[b] = a[19 == b ? d & 3 | 8 : d])
        }
        return q.join("")
    }
    ;
    Math.uuidFast = function() {
        for (var e = Array(36), r = 0, q, b = 0; 36 > b; b++)
            8 == b || 13 == b || 18 == b || 23 == b ? e[b] = "-" : 14 == b ? e[b] = "4" : (2 >= r && (r = 33554432 + 16777216 * Math.random() | 0),
            q = r & 15,
            r >>= 4,
            e[b] = a[19 == b ? q & 3 | 8 : q]);
        return e.join("")
    }
    ;
    Math.uuidCompact = function() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a) {
            var e = 16 * Math.random() | 0;
            return ("x" == a ? e : e & 3 | 8).toString(16)
        })
    }
}
)();
(function(a) {
    var e = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d",
        encode: function(a) {
            var q = "", b, d, l, r, u, p, z = 0;
            for (a = e._utf8_encode(a); z < a.length; )
                b = a.charCodeAt(z++),
                d = a.charCodeAt(z++),
                l = a.charCodeAt(z++),
                r = b >> 2,
                b = (b & 3) << 4 | d >> 4,
                u = (d & 15) << 2 | l >> 6,
                p = l & 63,
                isNaN(d) ? u = p = 64 : isNaN(l) && (p = 64),
                q = q + this._keyStr.charAt(r) + this._keyStr.charAt(b) + this._keyStr.charAt(u) + this._keyStr.charAt(p);
            return q
        },
        decode: function(a) {
            var q = "", b, d, l, r, u, p = 0;
            for (a = a.replace(/[^A-Za-z0-9+/=]/g, ""); p < a.length; )
                b = this._keyStr.indexOf(a.charAt(p++)),
                d = this._keyStr.indexOf(a.charAt(p++)),
                r = this._keyStr.indexOf(a.charAt(p++)),
                u = this._keyStr.indexOf(a.charAt(p++)),
                b = b << 2 | d >> 4,
                d = (d & 15) << 4 | r >> 2,
                l = (r & 3) << 6 | u,
                q += String.fromCharCode(b),
                64 != r && (q += String.fromCharCode(d)),
                64 != u && (q += String.fromCharCode(l));
            return q = e._utf8_decode(q)
        },
        _utf8_encode: function(a) {
            a = a.replace(/rn/g, "n");
            for (var e = "", b = 0; b < a.length; b++) {
                var d = a.charCodeAt(b);
                128 > d ? e += String.fromCharCode(d) : (127 < d && 2048 > d ? e += String.fromCharCode(d >> 6 | 192) : (e += String.fromCharCode(d >> 12 | 224),
                e += String.fromCharCode(d >> 6 & 63 | 128)),
                e += String.fromCharCode(d & 63 | 128))
            }
            return e
        },
        _utf8_decode: function(a) {
            var e = "", b = 0, d;
            for (c1 = c2 = 0; b < a.length; )
                d = a.charCodeAt(b),
                128 > d ? (e += String.fromCharCode(d),
                b++) : 191 < d && 224 > d ? (c2 = a.charCodeAt(b + 1),
                e += String.fromCharCode((d & 31) << 6 | c2 & 63),
                b += 2) : (c2 = a.charCodeAt(b + 1),
                c3 = a.charCodeAt(b + 2),
                e += String.fromCharCode((d & 15) << 12 | (c2 & 63) << 6 | c3 & 63),
                b += 3);
            return e
        }
    };
    window.Base64 = e
}
)();
(function(a) {
    var e = function(a, b) {
        return a << b | a >>> 32 - b
    }
      , r = function(a) {
        var b = "", d, e;
        for (d = 7; 0 <= d; d--)
            e = a >>> 4 * d & 15,
            b += e.toString(16);
        return b
    };
    // a.extend({
    //     sha1: function(a) {
    //         var b, d, l = Array(80), q = 1732584193, u = 4023233417, p = 2562383102, z = 271733878, F = 3285377520, v, w, C, E, f;
    //         b = a.replace(/\x0d\x0a/g, "\n");
    //         var k = "";
    //         for (a = 0; a < b.length; a++)
    //             d = b.charCodeAt(a),
    //             128 > d ? k += String.fromCharCode(d) : (127 < d && 2048 > d ? k += String.fromCharCode(d >> 6 | 192) : (k += String.fromCharCode(d >> 12 | 224),
    //             k += String.fromCharCode(d >> 6 & 63 | 128)),
    //             k += String.fromCharCode(d & 63 | 128));
    //         a = k;
    //         v = a.length;
    //         k = [];
    //         for (b = 0; b < v - 3; b += 4)
    //             d = a.charCodeAt(b) << 24 | a.charCodeAt(b + 1) << 16 | a.charCodeAt(b + 2) << 8 | a.charCodeAt(b + 3),
    //             k.push(d);
    //         switch (v % 4) {
    //         case 0:
    //             b = 2147483648;
    //             break;
    //         case 1:
    //             b = a.charCodeAt(v - 1) << 24 | 8388608;
    //             break;
    //         case 2:
    //             b = a.charCodeAt(v - 2) << 24 | a.charCodeAt(v - 1) << 16 | 32768;
    //             break;
    //         case 3:
    //             b = a.charCodeAt(v - 3) << 24 | a.charCodeAt(v - 2) << 16 | a.charCodeAt(v - 1) << 8 | 128
    //         }
    //         for (k.push(b); 14 != k.length % 16; )
    //             k.push(0);
    //         k.push(v >>> 29);
    //         k.push(v << 3 & 4294967295);
    //         for (a = 0; a < k.length; a += 16) {
    //             for (b = 0; 16 > b; b++)
    //                 l[b] = k[a + b];
    //             for (b = 16; 79 >= b; b++)
    //                 l[b] = e(l[b - 3] ^ l[b - 8] ^ l[b - 14] ^ l[b - 16], 1);
    //             d = q;
    //             v = u;
    //             w = p;
    //             C = z;
    //             E = F;
    //             for (b = 0; 19 >= b; b++)
    //                 f = e(d, 5) + (v & w | ~v & C) + E + l[b] + 1518500249 & 4294967295,
    //                 E = C,
    //                 C = w,
    //                 w = e(v, 30),
    //                 v = d,
    //                 d = f;
    //             for (b = 20; 39 >= b; b++)
    //                 f = e(d, 5) + (v ^ w ^ C) + E + l[b] + 1859775393 & 4294967295,
    //                 E = C,
    //                 C = w,
    //                 w = e(v, 30),
    //                 v = d,
    //                 d = f;
    //             for (b = 40; 59 >= b; b++)
    //                 f = e(d, 5) + (v & w | v & C | w & C) + E + l[b] + 2400959708 & 4294967295,
    //                 E = C,
    //                 C = w,
    //                 w = e(v, 30),
    //                 v = d,
    //                 d = f;
    //             for (b = 60; 79 >= b; b++)
    //                 f = e(d, 5) + (v ^ w ^ C) + E + l[b] + 3395469782 & 4294967295,
    //                 E = C,
    //                 C = w,
    //                 w = e(v, 30),
    //                 v = d,
    //                 d = f;
    //             q = q + d & 4294967295;
    //             u = u + v & 4294967295;
    //             p = p + w & 4294967295;
    //             z = z + C & 4294967295;
    //             F = F + E & 4294967295
    //         }
    //         f = r(q) + r(u) + r(p) + r(z) + r(F);
    //         return f.toLowerCase()
    //     }
    // })
}
)(jQuery);
(function(a) {
    function e(f) {
        var k = b
          , h = k.biDivideByRadixPower(f, this.k - 1)
          , h = k.biMultiply(h, this.mu)
          , h = k.biDivideByRadixPower(h, this.k + 1);
        f = k.biModuloByRadixPower(f, this.k + 1);
        h = k.biMultiply(h, this.modulus);
        h = k.biModuloByRadixPower(h, this.k + 1);
        f = k.biSubtract(f, h);
        f.isNeg && (f = k.biAdd(f, this.bkplus1));
        for (h = 0 <= k.biCompare(f, this.modulus); h; )
            f = k.biSubtract(f, this.modulus),
            h = 0 <= k.biCompare(f, this.modulus);
        return f
    }
    function r(f, k) {
        var h = b.biMultiply(f, k);
        return this.modulo(h)
    }
    function q(f, k) {
        var h = new p;
        h.digits[0] = 1;
        for (var a = f, d = k; ; ) {
            0 != (d.digits[0] & 1) && (h = this.multiplyMod(h, a));
            d = b.biShiftRight(d, 1);
            if (0 == d.digits[0] && 0 == b.biHighIndex(d))
                break;
            a = this.multiplyMod(a, a)
        }
        return h
    }
    var b = "undefined" === typeof a.RSAUtils ? a.RSAUtils = {} : a.RSAUtils, d, l, G, u, p = a.BigInt = function(b) {
        this.digits = "boolean" == typeof b && 1 == b ? null : l.slice(0);
        this.isNeg = !1
    }
    ;
    b.setMaxDigits = function(b) {
        d = b;
        l = Array(d);
        for (b = 0; b < l.length; b++)
            l[b] = 0;
        G = new p;
        u = new p;
        u.digits[0] = 1
    }
    ;
    b.setMaxDigits(20);
    b.biFromNumber = function(b) {
        var f = new p;
        f.isNeg = 0 > b;
        b = Math.abs(b);
        for (var h = 0; 0 < b; )
            f.digits[h++] = b & 65535,
            b = Math.floor(b / 65536);
        return f
    }
    ;
    var z = b.biFromNumber(1E15);
    b.biFromDecimal = function(f) {
        for (var a = "-" == f.charAt(0), h = a ? 1 : 0, A; h < f.length && "0" == f.charAt(h); )
            ++h;
        if (h == f.length)
            A = new p;
        else {
            var d = (f.length - h) % 15;
            0 == d && (d = 15);
            A = b.biFromNumber(Number(f.substr(h, d)));
            for (h += d; h < f.length; )
                A = b.biAdd(b.biMultiply(A, z), b.biFromNumber(Number(f.substr(h, 15)))),
                h += 15;
            A.isNeg = a
        }
        return A
    }
    ;
    b.biCopy = function(b) {
        var f = new p(!0);
        f.digits = b.digits.slice(0);
        f.isNeg = b.isNeg;
        return f
    }
    ;
    b.reverseStr = function(b) {
        for (var f = "", h = b.length - 1; -1 < h; --h)
            f += b.charAt(h);
        return f
    }
    ;
    var F = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
    b.biToString = function(f, a) {
        var h = new p;
        h.digits[0] = a;
        for (var k = b.biDivideModulo(f, h), d = F[k[1].digits[0]]; 1 == b.biCompare(k[0], G); )
            k = b.biDivideModulo(k[0], h),
            digit = k[1].digits[0],
            d += F[k[1].digits[0]];
        return (f.isNeg ? "-" : "") + b.reverseStr(d)
    }
    ;
    b.biToDecimal = function(f) {
        var a = new p;
        a.digits[0] = 10;
        for (var h = b.biDivideModulo(f, a), A = String(h[1].digits[0]); 1 == b.biCompare(h[0], G); )
            h = b.biDivideModulo(h[0], a),
            A += String(h[1].digits[0]);
        return (f.isNeg ? "-" : "") + b.reverseStr(A)
    }
    ;
    var v = "0123456789abcdef".split("");
    b.digitToHex = function(f) {
        for (var a = "", h = 0; 4 > h; ++h)
            a += v[f & 15],
            f >>>= 4;
        return b.reverseStr(a)
    }
    ;
    b.biToHex = function(f) {
        var a = "";
        b.biHighIndex(f);
        for (var h = b.biHighIndex(f); -1 < h; --h)
            a += b.digitToHex(f.digits[h]);
        return a
    }
    ;
    b.charToHex = function(b) {
        return 48 <= b && 57 >= b ? b - 48 : 65 <= b && 90 >= b ? 10 + b - 65 : 97 <= b && 122 >= b ? 10 + b - 97 : 0
    }
    ;
    b.hexToDigit = function(a) {
        for (var f = 0, h = Math.min(a.length, 4), A = 0; A < h; ++A)
            f <<= 4,
            f |= b.charToHex(a.charCodeAt(A));
        return f
    }
    ;
    b.biFromHex = function(a) {
        for (var f = new p, h = a.length, A = 0; 0 < h; h -= 4,
        ++A)
            f.digits[A] = b.hexToDigit(a.substr(Math.max(h - 4, 0), Math.min(h, 4)));
        return f
    }
    ;
    b.biFromString = function(a, k) {
        var h = "-" == a.charAt(0)
          , f = h ? 1 : 0
          , d = new p
          , e = new p;
        e.digits[0] = 1;
        for (var n = a.length - 1; n >= f; n--)
            var t = a.charCodeAt(n)
              , t = b.charToHex(t)
              , t = b.biMultiplyDigit(e, t)
              , d = b.biAdd(d, t)
              , e = b.biMultiplyDigit(e, k);
        d.isNeg = h;
        return d
    }
    ;
    b.biDump = function(b) {
        return (b.isNeg ? "-" : "") + b.digits.join(" ")
    }
    ;
    b.biAdd = function(a, k) {
        var h;
        if (a.isNeg != k.isNeg)
            k.isNeg = !k.isNeg,
            h = b.biSubtract(a, k),
            k.isNeg = !k.isNeg;
        else {
            h = new p;
            for (var f = 0, d = 0; d < a.digits.length; ++d)
                f = a.digits[d] + k.digits[d] + f,
                h.digits[d] = f % 65536,
                f = Number(65536 <= f);
            h.isNeg = a.isNeg
        }
        return h
    }
    ;
    b.biSubtract = function(a, k) {
        var h;
        if (a.isNeg != k.isNeg)
            k.isNeg = !k.isNeg,
            h = b.biAdd(a, k),
            k.isNeg = !k.isNeg;
        else {
            h = new p;
            for (var f, d = f = 0; d < a.digits.length; ++d)
                f = a.digits[d] - k.digits[d] + f,
                h.digits[d] = f % 65536,
                0 > h.digits[d] && (h.digits[d] += 65536),
                f = 0 - Number(0 > f);
            if (-1 == f) {
                for (d = f = 0; d < a.digits.length; ++d)
                    f = 0 - h.digits[d] + f,
                    h.digits[d] = f % 65536,
                    0 > h.digits[d] && (h.digits[d] += 65536),
                    f = 0 - Number(0 > f);
                h.isNeg = !a.isNeg
            } else
                h.isNeg = a.isNeg
        }
        return h
    }
    ;
    b.biHighIndex = function(b) {
        for (var a = b.digits.length - 1; 0 < a && 0 == b.digits[a]; )
            --a;
        return a
    }
    ;
    b.biNumBits = function(a) {
        var f = b.biHighIndex(a);
        a = a.digits[f];
        var f = 16 * (f + 1), h;
        for (h = f; h > f - 16 && 0 == (a & 32768); --h)
            a <<= 1;
        return h
    }
    ;
    b.biMultiply = function(a, d) {
        for (var h = new p, f, k = b.biHighIndex(a), e = b.biHighIndex(d), n, t = 0; t <= e; ++t) {
            f = 0;
            n = t;
            for (var y = 0; y <= k; ++y,
            ++n)
                f = h.digits[n] + a.digits[y] * d.digits[t] + f,
                h.digits[n] = f & 65535,
                f >>>= 16;
            h.digits[t + k + 1] = f
        }
        h.isNeg = a.isNeg != d.isNeg;
        return h
    }
    ;
    b.biMultiplyDigit = function(a, d) {
        var h, f, k = new p;
        h = b.biHighIndex(a);
        for (var e = f = 0; e <= h; ++e)
            f = k.digits[e] + a.digits[e] * d + f,
            k.digits[e] = f & 65535,
            f >>>= 16;
        k.digits[1 + h] = f;
        return k
    }
    ;
    b.arrayCopy = function(b, a, h, d, e) {
        for (e = Math.min(a + e, b.length); a < e; ++a,
        ++d)
            h[d] = b[a]
    }
    ;
    var w = [0, 32768, 49152, 57344, 61440, 63488, 64512, 65024, 65280, 65408, 65472, 65504, 65520, 65528, 65532, 65534, 65535];
    b.biShiftLeft = function(a, d) {
        var h = Math.floor(d / 16)
          , f = new p;
        b.arrayCopy(a.digits, 0, f.digits, h, f.digits.length - h);
        for (var h = d % 16, k = 16 - h, e = f.digits.length - 1, n = e - 1; 0 < e; --e,
        --n)
            f.digits[e] = f.digits[e] << h & 65535 | (f.digits[n] & w[h]) >>> k;
        f.digits[0] = f.digits[e] << h & 65535;
        f.isNeg = a.isNeg;
        return f
    }
    ;
    var C = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535];
    b.biShiftRight = function(a, d) {
        var f = Math.floor(d / 16)
          , k = new p;
        b.arrayCopy(a.digits, f, k.digits, 0, a.digits.length - f);
        for (var f = d % 16, e = 16 - f, l = 0, n = l + 1; l < k.digits.length - 1; ++l,
        ++n)
            k.digits[l] = k.digits[l] >>> f | (k.digits[n] & C[f]) << e;
        k.digits[k.digits.length - 1] >>>= f;
        k.isNeg = a.isNeg;
        return k
    }
    ;
    b.biMultiplyByRadixPower = function(a, d) {
        var f = new p;
        b.arrayCopy(a.digits, 0, f.digits, d, f.digits.length - d);
        return f
    }
    ;
    b.biDivideByRadixPower = function(a, d) {
        var f = new p;
        b.arrayCopy(a.digits, d, f.digits, 0, f.digits.length - d);
        return f
    }
    ;
    b.biModuloByRadixPower = function(a, d) {
        var f = new p;
        b.arrayCopy(a.digits, 0, f.digits, 0, d);
        return f
    }
    ;
    b.biCompare = function(b, a) {
        if (b.isNeg != a.isNeg)
            return 1 - 2 * Number(b.isNeg);
        for (var f = b.digits.length - 1; 0 <= f; --f)
            if (b.digits[f] != a.digits[f])
                return b.isNeg ? 1 - 2 * Number(b.digits[f] > a.digits[f]) : 1 - 2 * Number(b.digits[f] < a.digits[f]);
        return 0
    }
    ;
    b.biDivideModulo = function(a, d) {
        var f = b.biNumBits(a), e = b.biNumBits(d), k = d.isNeg, l, n;
        if (f < e)
            return a.isNeg ? (l = b.biCopy(u),
            l.isNeg = !d.isNeg,
            a.isNeg = !1,
            d.isNeg = !1,
            n = biSubtract(d, a),
            a.isNeg = !0,
            d.isNeg = k) : (l = new p,
            n = b.biCopy(a)),
            [l, n];
        l = new p;
        n = a;
        for (var t = Math.ceil(e / 16) - 1, y = 0; 32768 > d.digits[t]; )
            d = b.biShiftLeft(d, 1),
            ++y,
            ++e,
            t = Math.ceil(e / 16) - 1;
        n = b.biShiftLeft(n, y);
        f = Math.ceil((f + y) / 16) - 1;
        for (e = b.biMultiplyByRadixPower(d, f - t); -1 != b.biCompare(n, e); )
            ++l.digits[f - t],
            n = b.biSubtract(n, e);
        for (; f > t; --f) {
            var e = f >= n.digits.length ? 0 : n.digits[f]
              , B = f - 1 >= n.digits.length ? 0 : n.digits[f - 1]
              , r = f - 2 >= n.digits.length ? 0 : n.digits[f - 2]
              , q = t >= d.digits.length ? 0 : d.digits[t]
              , v = t - 1 >= d.digits.length ? 0 : d.digits[t - 1];
            l.digits[f - t - 1] = e == q ? 65535 : Math.floor((65536 * e + B) / q);
            for (var z = l.digits[f - t - 1] * (65536 * q + v), w = 4294967296 * e + (65536 * B + r); z > w; )
                --l.digits[f - t - 1],
                z = l.digits[f - t - 1] * (65536 * q | v),
                w = 4294967296 * e + (65536 * B + r);
            e = b.biMultiplyByRadixPower(d, f - t - 1);
            n = b.biSubtract(n, b.biMultiplyDigit(e, l.digits[f - t - 1]));
            n.isNeg && (n = b.biAdd(n, e),
            --l.digits[f - t - 1])
        }
        n = b.biShiftRight(n, y);
        l.isNeg = a.isNeg != k;
        a.isNeg && (l = k ? b.biAdd(l, u) : b.biSubtract(l, u),
        d = b.biShiftRight(d, y),
        n = b.biSubtract(d, n));
        0 == n.digits[0] && 0 == b.biHighIndex(n) && (n.isNeg = !1);
        return [l, n]
    }
    ;
    b.biDivide = function(a, d) {
        return b.biDivideModulo(a, d)[0]
    }
    ;
    b.biModulo = function(a, d) {
        return b.biDivideModulo(a, d)[1]
    }
    ;
    b.biMultiplyMod = function(a, d, e) {
        return b.biModulo(b.biMultiply(a, d), e)
    }
    ;
    b.biPow = function(a, d) {
        for (var f = u, e = a; ; ) {
            0 != (d & 1) && (f = b.biMultiply(f, e));
            d >>= 1;
            if (0 == d)
                break;
            e = b.biMultiply(e, e)
        }
        return f
    }
    ;
    b.biPowMod = function(a, d, e) {
        for (var f = u; ; ) {
            0 != (d.digits[0] & 1) && (f = b.biMultiplyMod(f, a, e));
            d = b.biShiftRight(d, 1);
            if (0 == d.digits[0] && 0 == b.biHighIndex(d))
                break;
            a = b.biMultiplyMod(a, a, e)
        }
        return f
    }
    ;
    a.BarrettMu = function(a) {
        this.modulus = b.biCopy(a);
        this.k = b.biHighIndex(this.modulus) + 1;
        a = new p;
        a.digits[2 * this.k] = 1;
        this.mu = b.biDivide(a, this.modulus);
        this.bkplus1 = new p;
        this.bkplus1.digits[this.k + 1] = 1;
        this.modulo = e;
        this.multiplyMod = r;
        this.powMod = q
    }
    ;
    var E = function(f, d, e) {
        var h = b;
        this.e = h.biFromHex(f);
        this.d = h.biFromHex(d);
        this.m = h.biFromHex(e);
        this.digitSize = 2 * h.biHighIndex(this.m) + 2;
        this.chunkSize = this.digitSize - 11;
        this.radix = 16;
        this.barrett = new a.BarrettMu(this.m)
    };
    b.getKeyPair = function(a, b, d) {
        return new E(a,b,d)
    }
    ;
    "undefined" === typeof a.twoDigit && (a.twoDigit = function(a) {
        return (10 > a ? "0" : "") + String(a)
    }
    );
    b.encryptedString = function(a, d) {
        for (var f = [], e = d.length, l = 0; l < e; )
            f[l] = d.charCodeAt(l),
            l++;
        for (var k = f.length, e = "", n, t, y, l = 0; l < k; l += a.chunkSize) {
            y = new p;
            n = 0;
            t = l + a.chunkSize > k ? k % a.chunkSize : a.chunkSize;
            var B = [], u;
            for (u = 0; u < t; u++)
                B[u] = f[l + u];
            B[t] = 0;
            var r = Math.max(8, a.digitSize - 3 - t);
            for (u = 0; u < r; u++)
                B[t + 1 + u] = Math.floor(254 * Math.random()) + 1;
            B[a.digitSize - 2] = 2;
            for (t = B[a.digitSize - 1] = 0; t < a.digitSize; ++n)
                y.digits[n] = B[t++],
                y.digits[n] += B[t++] << 8;
            n = a.barrett.powMod(y, a.e);
            n = 16 === a.radix ? b.biToHex(n) : b.biToString(n, a.radix);
            e += n + " "
        }
        f = "";
        l = e.split(" ");
        for (t = l.length; 1 <= t; t--)
            f += l[t - 1];
        return f
    }
    ;
    b.decryptedString = function(a, d) {
        var f = d.split(" "), e = "", l, k, n;
        for (l = 0; l < f.length; ++l)
            for (k = 16 === a.radix ? b.biFromHex(f[l]) : b.biFromString(f[l], a.radix),
            n = a.barrett.powMod(k, a.d),
            k = 0; k <= b.biHighIndex(n); ++k)
                e += String.fromCharCode(n.digits[k] & 255, n.digits[k] >> 8);
        0 === e.charCodeAt(e.length - 1) && (e = e.substring(0, e.length - 1));
        return e
    }
    ;
    b.setMaxDigits(130)
}
)(window);
(function(a) {
    var e = window.location
      , r = e.href
      , q = /\#.*$/
      , b = {
        removeHash: function(a) {
            return (a || r).replace(q, "")
        },
        getHash: function(a) {
            return (a = (a || r).match(q)) && a[0] ? a[0] : ""
        },
        removeParams: function(a, e) {
            e = e || r;
            var d = b.getHash(e);
            e = this.removeHash(e);
            var l;
            for (l = a.length - 1; 0 <= l; l--)
                e = e.replace(new RegExp("(?:[\\?\\\x26](" + a[l] + "\x3d[^\x26]*))","g"), "");
            e = e.replace(/\&+/, "\x26").replace(/[\&]+$/, "").replace(/[\?]+$/, "") + d;
            return /^[^?]*\&/.test(e) ? e.replace("\x26", "?") : e
        },
        addParams: function(a, e) {
            e = e || r;
            var d = []
              , l = []
              , p = b.getHash(e);
            e = this.removeHash(e);
            for (var q in a)
                a.hasOwnProperty(q) && (d.push(q),
                l.push(q + "\x3d" + encodeURIComponent(a[q])));
            e = this.removeParams(d, e);
            return e + (l[0] ? (-1 === e.indexOf("?") ? "?" : "\x26") + l.join("\x26") : "") + p
        },
        queryString: function(b, e) {
            var d = this.getParams(e);
            return null != d[b] ? d[b] : a
        },
        getParams: function(a) {
            a = -1 === a.indexOf("?") ? [] : a.substr(a.indexOf("?") + 1).split("\x26");
            for (var b = 0, d = a.length, e = {}, p; b < d; b++)
                p = a[b].indexOf("\x3d"),
                0 < p && (e[a[b].substring(0, p)] = decodeURIComponent(a[b].substring(p + 1)));
            return e
        },
        getUrl: function() {
            return e.protocol + "//" + e.host + e.pathname
        },
        redirect: function(a) {
            e.href = a;
            try {
                window.event.returnValue = !1
            } catch (l) {}
        }
    };
    window.Url = b
}
)();
(function(a) {
    function e(c, b) {
        z(g.needAttribute, g.appKey, g.client, g.loginRedirectUrl);
        var m = g.SSOServerUrl + "/v1/getSsoLoginCaptcha"
          , m = D(m)
          , d = {}
          , x = {};
        x.appId = c.appId || g.appKey;
        x.client = c.client || g.client;
        x.service = c.service != a ? c.service : g.loginRedirectUrl;
        x.mac = c.mac || g.mac;
        x.extInfo = '{"deviceId": "' + (c.deviceId || g.deviceId) + '"}';
        x.newCaptcha = !0;
        c.isRefresh ? x.smsLoginCaptchaId = c.smsLoginCaptchaId : x.captchaCustomConfig = JSON.stringify({
            width: c.width,
            height: c.height,
            textLength: c.textLength,
            textChars: c.textChars,
            fontSize: c.fontSize,
            fontColor: c.fontColor
        });
        $.ajax({
            url: m,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            data: x,
            success: function(c) {
                c && "success" === c.code ? (d.result = "success",
                d.code = c.code,
                d.message = c.message,
                d.data = c.data) : (d.result = "fail",
                d.code = c.code,
                d.message = c.message);
                b && b(d)
            },
            error: function(c) {
                d.result = "fail";
                d.code = c.code;
                d.message = c.message;
                b && b(d)
            }
        })
    }
    function r(c, b) {
        z(g.needAttribute, g.appKey, g.client, g.loginRedirectUrl);
        var m = g.SSOServerUrl + "/v1/checkCaptcha"
          , m = D(m)
          , d = {}
          , x = {};
        x.appId = c.appId || g.appKey;
        x.client = c.client || g.client;
        x.service = c.service != a ? c.service : g.loginRedirectUrl;
        x.mac = c.mac || g.mac;
        x.extInfo = '{"deviceId": "' + (c.deviceId || g.deviceId) + '"}';
        x.smsLoginCaptchaId = c.smsLoginCaptchaId;
        x.smsLoginCaptchaCode = c.smsLoginCaptchaCode;
        $.ajax({
            url: m,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            data: x,
            success: function(c) {
                d.result = c && "success" === c.code ? "success" : "fail";
                d.code = c.code;
                d.message = c.message;
                b && b(d)
            },
            error: function(c) {
                d.result = "fail";
                d.code = c.code;
                d.message = c.message;
                b && b(d)
            }
        })
    }
    function q(c, b) {
        z(g.needAttribute, g.appKey, g.client, g.loginRedirectUrl);
        var m = g.SSOServerUrl + "/v1/sendSms"
          , m = D(m)
          , d = {}
          , x = {};
        x.appId = c.appId || g.appKey;
        x.client = c.client || g.client;
        x.service = c.service != a ? c.service : g.loginRedirectUrl;
        c.notCheckMobileExist != a && (x.notCheckMobileExist = c.notCheckMobileExist);
        x.mac = c.mac || g.mac;
        x.extInfo = '{"deviceId": "' + (c.deviceId || g.deviceId) + '"}';
        x.smsLoginCaptchaId = c.smsLoginCaptchaId;
        x.smsLoginCaptchaCode = c.smsLoginCaptchaCode;
        x.mobile = c.mobile;
        $.ajax({
            url: m,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            data: x,
            success: function(c) {
                d.result = c && "success" === c.code ? "success" : "fail";
                d.code = c.code;
                d.message = c.message;
                b && b(d)
            },
            error: function(c) {
                d.result = "fail";
                d.code = c.code;
                d.message = c.message;
                b && b(d)
            }
        })
    }
    function b(c, a) {
        var b = {}
          , d = {};
        d.appKey = c.appKey || g.appKey;
        d.tgt = c.data.tgt;
        d.st = c.data.st;
        d.service = g.loginRedirectUrl;
        d.client = g.client;
        d.mac = g.mac;
        d.scope = g.scope;
        d.extInfo = '{"deviceId": "' + g.deviceId + '"}';
        var m = g.SSOServerUrl + "/v1/validationWeb";
        if ("pc" === g.client || "app" === g.client || "pc-web" === g.client || "app-web" === g.client)
            m = g.SSOServerUrl + "/v1/validationV2";
        m = D(m);
        $.ajax({
            url: m,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            data: d,
            success: function(c) {
                c && "1" === c.code && c.data && c.data.token ? (b.result = "success",
                b.code = c.code,
                b.data = {
                    token: c.data.token,
                    tgt: d.tgt,
                    loginName: c.data.loginName,
                    userId: c.data.userId,
                    mergingUserId: c.data.mergingUserId
                }) : (b.result = "fail",
                b.code = c.code);
                b.message = c.message;
                a && a(b)
            },
            error: function(c) {
                b.result = "fail";
                b.code = c.code;
                b.message = c.message;
                b.data = {
                    tgt: d.tgt
                };
                a && a(b)
            }
        })
    }
    function d(c, a) {
        var b = {}
          , d = {};
        d.appId = c.appKey || g.appKey;
        d.client = c.client || g.client;
        d.mac = c.mac || g.mac;
        d.needTicket = c.needTicket;
        var m = c.deviceId || g.deviceId;
        m && (d.extInfo = '{"deviceId": "' + m + '"}');
        c.destAppId ? d.destAppId = c.destAppId : d.service = c.service || g.loginRedirectUrl;
        c.tgt ? d.tgt = c.tgt : c.loginType === g.loginType.LOGINBYNORMAL ? (m = RSAUtils.getKeyPair("010001", "", "00ccd806a03c7391ee8f884f5902102d95f6d534d597ac42219dd8a79b1465e186c0162a6771b55e7be7422c4af494ba0112ede4eb00fc751723f2c235ca419876e7103ea904c29522b72d754f66ff1958098396f17c6cd2c9446e8c2bb5f4000a9c1c6577236a57e270bef07e7fe7bbec1f0e8993734c8bd4750e01feb21b6dc9"),
        d.type = c.loginType,
        d.username = c.account,
        d.password = RSAUtils.encryptedString(m, c.password),
        d.encodeType = "R2/P",
        d.encode = !0,
        d.key = c.key || n(c.account, g.isCenterSSO),
        d.captchaId = c.captchaId || g.captchaId,
        d.captchaType = c.captchaType || g.captchaType,
        d.captchaType == g.thirdCaptchaType && (d.thirdCaptchaParam = JSON.stringify(g.captchaObj.getValidate())),
        d.version = g.accountLoginVersion,
        d.captchaCode = c.captchaCode) : c.loginType === g.loginType.LOGINBYTOKEN && (d.type = c.loginType,
        d.token = c.token,
        d.platformKey = c.platformKey,
        d.service = c.service || g.loginRedirectUrl,
        d.signature = c.signature);
        m = g.SSOServerUrl + "/v1/getSingleAt";
        m = D(m);
        $.ajax({
            url: m,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            data: d,
            success: function(c) {
                c && "success" === c.code && c.data && c.data.at ? (b.result = "success",
                b.code = c.code,
                b.data = {
                    at: c.data.at,
                    service: c.data.service
                }) : (b.result = "fail",
                b.code = c.code);
                b.message = c.message;
                a && a(b)
            },
            error: function(c) {
                b.result = "fail";
                b.code = c.code;
                b.message = c.message;
                b.data = {
                    tgt: d.tgt
                };
                a && a(b)
            }
        })
    }
    function l(c, a) {
        z(g.needAttribute, g.appKey, g.client, g.loginRedirectUrl);
        u(!0, function(d) {
            d && "success" === d.result ? (c && c.appKey && (d.appKey = c.appKey),
            b(d, a)) : a && a(d)
        }, c && c.tgt)
    }
    function G(c, a) {
        z(g.needAttribute, g.appKey, g.client, g.loginRedirectUrl);
        p(!0, function(d) {
            d && "success" === d.result ? (c && c.appKey && (d.appKey = c.appKey),
            b(d, a)) : a && a(d)
        })
    }
    function u(c, a, b) {
        var d = {}
          , m = g.SSOServerUrl + "/login";
        b && (m = Url.addParams({
            tgtId: b
        }, m));
        c && !0 === c && (m = Url.addParams({
            service: g.loginRedirectUrl
        }, m));
        m = D(m);
        $.ajax({
            url: m,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            success: function(c) {
                c = $.trim(c).replace(/\t/g, "");
                c = y(c);
                c.result && "success" === c.result && 1001 === parseInt(c.code) && c.data.tgt ? (d.result = "success",
                d.code = c.code,
                d.message = c.message,
                d.data = {
                    tgt: c.data.tgt,
                    st: c.data.st,
                    mergingUserId: c.data.mergingUserId
                }) : (d.result = "fail",
                d.code = c.code,
                d.message = c.message);
                a && a(d)
            },
            error: function(c) {
                d.result = "fail";
                d.code = c.code;
                d.message = c.message;
                a && a(d)
            }
        })
    }
    function p(c, a) {
        if (I()) {
            var b = K(g.casTgcCookieName);
            if (b)
                return u(c, function(c) {
                    "success" === c.result ? a && a(c) : (B(g.casTgcCookieName, "", -1),
                    c = g.SSOServerUrl + "/checkLogin",
                    c = Url.addParams({
                        service: window.location.href,
                        appId: g.appKey
                    }, c),
                    window.location.href = c);
                    return !1
                }, b);
            if ("true" === J("checkLoginBack")) {
                var b = J("tgtId")
                  , d = J("atId");
                if (b)
                    return Q("tgtId", "checkLoginBack"),
                    B(g.casTgcCookieName, b, 1),
                    u(c, function(c) {
                        a && a(c);
                        return !1
                    }, b);
                if (d)
                    return k(d, function(b) {
                        if ("success" === b.code && b.data && b.data.tgt)
                            return b = b.data.tgt,
                            B(g.casTgcCookieName, b, 1),
                            u(c, function(c) {
                                a && a(c);
                                return !1
                            }, b);
                        B(g.casTgcCookieName, "", -1);
                        b = {
                            result: "fail",
                            message: "\u767b\u5f55\u5931\u8d25"
                        };
                        a && a(b);
                        return !1
                    });
                B(g.casTgcCookieName, "", -1);
                b = {
                    result: "fail"
                };
                b.code = J("code");
                b.message = J("message");
                a && a(b);
                return !1
            }
            b = g.SSOServerUrl + "/checkLogin";
            b = Url.addParams({
                service: window.location.href,
                appId: g.appKey
            }, b);
            window.location.href = b;
            return !1
        }
        return u(c, a)
    }
    function z() {
        var c = window.location.href;
        if (g.useNextPage && Url.queryString("nextpage", c) !== a) {
            var b = Url.queryString("nextpage", c);
            g.loginRedirectUrl = g.nextPageNeedBase64 ? Base64.decode(b) : b
        } else
            g.loginRedirectUrl = g.needAttribute && Url.queryString("from", g.loginRedirectUrl) === a ? Url.addParams({
                from: "ew"
            }, g.loginRedirectUrl) : g.loginRedirectUrl;
        Url.queryString("client", c) !== a && (g.client = Url.queryString("client", c));
        Url.queryString("appId", g.loginRedirectUrl) !== a && (g.appKey = Url.queryString("appId", g.loginRedirectUrl))
    }
    function F(c, b) {
        var d = c.loginType || g.loginType.LOGINBYNORMAL
          , m = d === g.loginType.LOGINBYCHANGEACCOUNT ? Url.addParams({
            userChangeLogin: !0
        }, g.loginRedirectUrl) : g.loginRedirectUrl;
        c.service && (m = d === g.loginType.LOGINBYCHANGEACCOUNT ? Url.addParams({
            userChangeLogin: !0
        }, c.service) : c.service);
        if (!1 === g.isCenterSSO) {
            var f = g.SSOCenterServerUrl + "/login?service\x3d" + encodeURIComponent(m)
              , f = D(f);
            $.ajax({
                url: f,
                type: "GET",
                dataType: "jsonp",
                jsonp: "callback",
                crossDomain: !0,
                cache: !1,
                success: function(b) {
                    b = $.trim(b).replace(/\t/g, "");
                    b = y(b);
                    b.result && "success" === b.result && 1001 === parseInt(b.code) && b.data && b.data.st && (d === g.loginType.LOGINBYONLINEAUTO && b.data.tgt === c.tgt || d === g.loginType.LOGINBYCHANGEACCOUNT || L())
                },
                error: function(c) {
                    console.log(c)
                }
            })
        }
        m = g.SSOServerUrl + "/login?service\x3d" + encodeURIComponent(m);
        (f = K(g.casTgcCookieName)) && (m = Url.addParams({
            tgtId: f
        }, m));
        m = D(m);
        $.ajax({
            url: m,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            success: function(m) {
                m = $.trim(m).replace(/\t/g, "");
                m = y(m);
                if (m.result && "success" === m.result)
                    if (1001 === parseInt(m.code) && m.data && m.data.st)
                        if (d === g.loginType.LOGINBYONLINEAUTO && m.data.tgt === c.tgt || d === g.loginType.LOGINBYCHANGEACCOUNT) {
                            var f = {
                                result: "success",
                                lt: m.data.lt,
                                execution: m.data.execution,
                                SSO_R_SESSION_ID: m.data.SSO_R_SESSION_ID
                            };
                            m.data.SSO_R_SESSION_ID && B("SSO_R_SESSION_ID", m.data.SSO_R_SESSION_ID, 1);
                            b && b(f)
                        } else
                            A(a, function() {
                                setTimeout(function() {
                                    F(c, b)
                                }, 100)
                            });
                    else
                        f = {
                            result: "success",
                            lt: m.data.lt,
                            execution: m.data.execution,
                            SSO_R_SESSION_ID: m.data.SSO_R_SESSION_ID
                        },
                        m.data.SSO_R_SESSION_ID && B("SSO_R_SESSION_ID", m.data.SSO_R_SESSION_ID, 1),
                        b && b(f);
                else
                    b && b(m)
            },
            error: function(c) {
                b && b(a)
            }
        })
    }
    function v(c, d) {
        z(g.needAttribute, g.appKey, g.client, g.loginRedirectUrl);
        var m = c.loginType || g.loginType.LOGINBYNORMAL;
        F(c, function(f) {
            if (f === a && m !== g.loginType.LOGINBYCHANGEACCOUNT)
                f = {
                    result: "fail",
                    code: "-1",
                    data: "\u767b\u5f55\u5931\u8d25,\u51fa\u73b0\u5f02\u5e38\uff01"
                },
                d && d(f);
            else {
                f && f.result && "success" === f.result || d && d(f);
                c = c || {};
                var e = {};
                e.captchaId = c.captchaId || g.captchaId;
                e.captchaType = c.captchaType || g.captchaType;
                e.captchaType == g.thirdCaptchaType && (e.thirdCaptchaParam = JSON.stringify(g.captchaObj.getValidate()));
                e.version = g.accountLoginVersion;
                e.captchaCode = c.captchaCode;
                e.encode = !0;
                e.sourceappname = g.appName;
                e._eventId = "submit";
                e.appId = g.appKey;
                e.client = c.client || g.client;
                e.type = c.loginType || g.loginType.LOGINBYNORMAL;
                e.key = c.key || n(c.account, g.isCenterSSO);
                e.lt = f.lt;
                e.execution = f.execution;
                e.customLogoutUrl = f.customLogoutUrl || g.customLogoutUrl;
                e.ncetAppId = f.ncetAppId || g.ncetAppId;
                e.sysCode = f.sysCode || g.sysCode;
                e.behaviorCheckInPc = c.behaviorCheckInPc !== a ? c.behaviorCheckInPc : g.behaviorCheckInPc;
                e.needBehaviorCheck = c.needBehaviorCheck !== a ? c.needBehaviorCheck : g.needBehaviorCheck;
                e.customConfig = c.customConfig || g.customConfig;
                if (null != c.extInfo && "" !== c.extInfo)
                    e.extInfo = c.extInfo;
                else if ("pc" === g.client || "app" === g.client || "pc-web" === g.client || "app-web" === g.client)
                    e.extInfo = '{"deviceId": "' + g.deviceId + '"}';
                if (m === g.loginType.LOGINBYONLINEAUTO)
                    e.username = c.account,
                    e.mac = c.mac || g.mac,
                    e.tgt = c.tgt,
                    e.timestamp = c.timestamp,
                    e.signature = c.signature;
                else if (m === g.loginType.LOGINBYVERIFYCODE)
                    e.phoneNum = c.phoneNum,
                    e.smsVerifyCode = c.smsVerifyCode,
                    c.smsCaptchaId && (e.smsCaptchaId = c.smsCaptchaId);
                else if (m === g.loginType.LOGINBYGENERIC)
                    e.genericValidateUserAttributes = c.genericValidateUserAttributes,
                    e.genericUserInfoAttributes = c.genericUserInfoAttributes;
                else if (m === g.loginType.LOGINBYTOKEN)
                    e.token = c.token,
                    e.platformKey = c.platformKey,
                    e.signature = c.signature,
                    e.mac = c.mac || g.mac;
                else if (m === g.loginType.LOGINBYCHANGEACCOUNT)
                    e.username = c.account,
                    e.changeUserId = c.changeUserId;
                else if (m === g.loginType.LOGINBYNCET) {
                    if (c.ticket)
                        e.token = c.ticket;
                    else if (c.at) {
                        e.token = c.at;
                        e.username = c.account;
                        var h = RSAUtils.getKeyPair("010001", "", "00ccd806a03c7391ee8f884f5902102d95f6d534d597ac42219dd8a79b1465e186c0162a6771b55e7be7422c4af494ba0112ede4eb00fc751723f2c235ca419876e7103ea904c29522b72d754f66ff1958098396f17c6cd2c9446e8c2bb5f4000a9c1c6577236a57e270bef07e7fe7bbec1f0e8993734c8bd4750e01feb21b6dc9")
                          , k = "LT/" + f.lt + "/" + c.password;
                        e.encodeType = "R2/P/LT";
                        e.password = RSAUtils.encryptedString(h, k)
                    }
                    if (null != c.mac && "" !== c.mac || null != g.mac && "" !== g.mac)
                        e.mac = c.mac || g.mac
                } else {
                    e.username = c.account;
                    h = RSAUtils.getKeyPair("010001", "", "00ccd806a03c7391ee8f884f5902102d95f6d534d597ac42219dd8a79b1465e186c0162a6771b55e7be7422c4af494ba0112ede4eb00fc751723f2c235ca419876e7103ea904c29522b72d754f66ff1958098396f17c6cd2c9446e8c2bb5f4000a9c1c6577236a57e270bef07e7fe7bbec1f0e8993734c8bd4750e01feb21b6dc9");
                    k = "LT/" + f.lt + "/" + c.password;
                    e.encodeType = "R2/P/LT";
                    e.password = RSAUtils.encryptedString(h, k);
                    if (null != c.mac && "" !== c.mac || null != g.mac && "" !== g.mac)
                        e.mac = c.mac || g.mac;
                    e.useAreaExamNo = c.useAreaExamNo || g.useAreaExamNo;
                    e.areaCode = c.areaCode;
                    e.personalName = c.personalName
                }
                var l = m === g.loginType.LOGINBYCHANGEACCOUNT ? Url.addParams({
                    userChangeLogin: !0
                }, g.loginRedirectUrl) : g.loginRedirectUrl;
                c.service && (l = m === g.loginType.LOGINBYCHANGEACCOUNT ? Url.addParams({
                    userChangeLogin: !0
                }, c.service) : c.service);
                h = g.SSOServerUrl + "/login?service\x3d" + encodeURIComponent(l);
                h = D(h, f.SSO_R_SESSION_ID);
                $.ajax({
                    url: h,
                    type: "GET",
                    dataType: "jsonp",
                    jsonp: "callback",
                    data: e,
                    crossDomain: !0,
                    cache: !1,
                    success: function(a) {
                        a = $.trim(a).replace(/\t/g, "");
                        a = y(a);
                        if (a.result && "success" === a.result)
                            if (1E3 === parseInt(a.code))
                                !1 === g._retry ? (g._retry = !0,
                                v(c, d)) : d && d(a);
                            else {
                                if (I()) {
                                    B(g.casTgcCookieName, a.data.tgt, 1);
                                    var m = c.loginSuccessRedirect;
                                    if (null == m || !0 === m) {
                                        var m = {}
                                          , f = c.loginSuccessRedirectUrl;
                                        m.tgtId = a.data.tgt;
                                        m.serviceUrl = f ? f : window.location.href;
                                        H(m);
                                        return !1
                                    }
                                }
                                g._retry = !1;
                                a.params = e;
                                g.needToken ? (g.loginRedirectUrl = l,
                                b(a, function(c) {
                                    w(c, d)
                                })) : w(a, d)
                            }
                        else
                            d && d(a)
                    },
                    error: function(c) {
                        g._retry = !1;
                        c = {
                            result: "fail",
                            code: "-1",
                            data: "\u767b\u5f55\u5931\u8d25,\u51fa\u73b0\u5f02\u5e38\uff01"
                        };
                        d && d(c)
                    }
                })
            }
        })
    }
    function w(c, b) {
        !1 === g.isCenterSSO && 1 === g.syncType ? C(c.data.tgt, function() {
            b && b(c)
        }) : !1 === g.isCenterSSO && 2 === g.syncType ? E(function() {
            b && b(c)
        }) : b && b(c)
    }
    function C(c, b) {
        var a = g.SSOCenterServerUrl + "/login?ticketGrantingTicketIdFromAreaSSO\x3d" + c
          , a = D(a);
        $.ajax({
            url: a,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            timeout: 3E3,
            complete: function() {
                b && b()
            }
        })
    }
    function E(c) {
        var b = g.SSOServerUrl + "/login?service\x3d" + encodeURIComponent(Url.addParams({
            isAjax: "true"
        }, g.loginRedirectUrl)) + "\x26redirect\x3dtrue"
          , b = D(b);
        jQuery.ajax({
            url: b,
            type: "get",
            dataType: "jsonp",
            jsonp: "callback",
            xhrFields: {
                withCredentials: !0
            },
            crossDomain: !0,
            timeout: 3E3,
            complete: function() {
                c && c()
            }
        })
    }
    function f(c, b, d) {
        if (c === a || b === a)
            c = {
                result: "fail",
                code: "-1",
                data: "\u53c2\u6570\u4e0d\u5408\u6cd5"
            },
            d && d(c);
        else {
            var e = g.SSOServerUrl + "/v1/validation"
              , f = {};
            f.service = b;
            f.ticket = c;
            e = D(e);
            $.ajax({
                url: e,
                type: "GET",
                dataType: "jsonp",
                jsonp: "callback",
                data: f,
                crossDomain: !0,
                cache: !1,
                success: function(c) {
                    d && d(c)
                },
                error: function(c) {
                    c = {
                        result: "fail",
                        code: "-1",
                        data: "\u6821\u9a8c\u5931\u8d25,\u51fa\u73b0\u5f02\u5e38\uff01"
                    };
                    d && d(c)
                }
            })
        }
    }
    function k(c, b) {
        if (c === a) {
            var d = {
                result: "fail",
                code: "-1",
                data: "\u53c2\u6570\u4e0d\u5408\u6cd5"
            };
            b && b(d)
        } else {
            var d = g.SSOServerUrl + "/v1/atValidation"
              , e = {};
            e.at = c;
            d = D(d);
            $.ajax({
                url: d,
                type: "GET",
                dataType: "jsonp",
                jsonp: "callback",
                data: e,
                crossDomain: !0,
                cache: !1,
                success: function(c) {
                    var a = {};
                    c && "success" === c.code ? (a.result = "success",
                    a.code = c.code,
                    a.message = c.message,
                    a.data = c.data) : (a.result = "fail",
                    a.code = c.code,
                    a.message = c.message);
                    b && b(a)
                },
                error: function(c) {
                    c = {
                        result: "fail",
                        code: "-1",
                        data: "\u6821\u9a8c\u5931\u8d25,\u51fa\u73b0\u5f02\u5e38\uff01"
                    };
                    b && b(c)
                }
            })
        }
    }
    function h(c, b) {
        z(g.needAttribute, g.appKey, g.client, g.loginRedirectUrl);
        c.tgt || c.loginType ? d(c, b) : u(!1, function(a) {
            a && "success" === a.result ? (c.tgt = a.data.tgt,
            d(c, b)) : b && b(a)
        })
    }
    function A(c, b) {
        var a = g.SSOServerUrl + "/logout"
          , d = !1;
        "object" === typeof c && (c.tgtId && (d = !0),
        a = d ? Url.addParams({
            tgtId: c.tgtId
        }, a) : a,
        a = c.clearScope ? Url.addParams({
            clearScope: c.clearScope
        }, a) : a);
        !d && I() && (d = K(g.casTgcCookieName)) && (a = Url.addParams({
            tgtId: d
        }, a));
        a = D(a);
        $.ajax({
            url: a,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            success: function(c) {
                c = $.trim(c).replace(/\t/g, "");
                c = y(c);
                c.result && "success" === c.result && b && b(c)
            },
            error: function(c) {
                c = {
                    result: "fail",
                    code: "-1",
                    data: "\u767b\u51fa\u5931\u8d25,\u51fa\u73b0\u5f02\u5e38\uff01"
                };
                b && b(c)
            }
        })
    }
    function L() {
        var c = g.SSOCenterServerUrl + "/logout"
          , c = D(c);
        $.ajax({
            url: c,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            success: function(c) {
                console.log(c)
            },
            error: function(c) {
                console.log(c)
            }
        })
    }
    function H(c) {
        var b = g.SSOServerUrl + "/addTGCCookie?tgtId\x3d" + c.tgtId
          , b = c.serviceUrl ? Url.addParams({
            service: c.serviceUrl
        }, b) : Url.addParams({
            service: window.location.href
        }, b);
        window.location.href = b;
        return !1
    }
    function n(c, b) {
        if (!0 === g.accountTypeIsAuto || !0 === b && null === g.accountTypeIsAuto)
            return "auto";
        var d = /^[0-9a-z]([._]?[0-9a-z])+@([0-9a-z][-\w]*[0-9a-z]\.)+[a-z]{2,9}$/
          , e = /^1[3-9]\d{9}$/
          , f = /^(\d{8})$/
          , m = /^\d{16}$/
          , h = "login_name";
        c !== a && (c.match(d) ? h = "email" : c.match(e) ? h = "mobile" : c.match(f) ? h = "exam_no" : c.match(m) && (h = "student_enroll_no"));
        return h
    }
    function t(c) {
        c && (B("deviceId", c, 365),
        window.localStorage && localStorage.setItem("deviceId", c));
        window.localStorage && (c = localStorage.getItem("deviceId"));
        c ? B("deviceId", c, 365) : (c = K("deviceId"),
        c || (c = Math.uuid(),
        B("deviceId", c, 365)),
        window.localStorage && localStorage.setItem("deviceId", c));
        return c
    }
    function y(c) {
        return eval("(" + c + ")")
    }
    function B(c, b, a) {
        var d = new Date;
        d.setDate(d.getDate() + a);
        document.cookie = c + "\x3d" + escape(b) + (null == a ? "" : ";path\x3d/;expires\x3d" + d.toGMTString())
    }
    function K(c, b) {
        var a;
        a = new RegExp("(^| )" + c + "\x3d([^;]*)(;|$)");
        return document.cookie.match(a) ? (a = document.cookie.match(a),
        '""' === a[2] || "null" === a[2] ? null : !0 === b ? Base64.decode(unescape(a[2])) : unescape(a[2])) : null
    }
    function O(c) {
        function b(c) {
            var b = {};
            c && "third" === c.captchaType && "true" !== c.captchaCompatible ? (b.result = "fail",
            b.code = "fail.get.captcha",
            b.message = "\u83b7\u53d6\u9a8c\u8bc1\u7801\u5931\u8d25",
            sucWeb.callCB(c.getCaptchaResultCB, b)) : (f.service = c.service !== a ? c.service : g.loginRedirectUrl,
            f.mac = c.mac || g.mac,
            f.extInfo = '{"deviceId": "' + (c.deviceId || g.deviceId) + '"}',
            f.captchaCustomConfig = JSON.stringify({
                width: c.width,
                height: c.height,
                textLength: c.textLength,
                textChars: c.textChars,
                fontSize: c.fontSize,
                fontColor: c.fontColor
            }),
            g.captchaId && (f.captchaId = g.captchaId),
            $.ajax({
                url: d,
                type: "GET",
                dataType: "jsonp",
                jsonp: "callback",
                crossDomain: !0,
                cache: !1,
                data: f,
                success: function(a) {
                    a && "success" === a.code && a.data ? (b.result = "success",
                    b.code = a.code,
                    b.message = a.message,
                    b.data = a.data,
                    g.captchaId = a.data.captchaId,
                    g.captchaType = a.data.captchaType) : (b.result = "fail",
                    b.code = a.code,
                    b.message = a.message);
                    sucWeb.callCB(c.getCaptchaResultCB, b)
                },
                error: function(a) {
                    b.result = "fail";
                    b.code = a.code;
                    b.message = a.message;
                    sucWeb.callCB(c.getCaptchaResultCB, b)
                }
            }))
        }
        z(g.needAttribute, g.appKey, g.client, g.loginRedirectUrl);
        var d = g.SSOServerUrl + "/v1/getCaptcha"
          , e = g.SSOServerUrl + "/v1/getCaptchaType"
          , f = {};
        f.appId = c.appId || g.appKey;
        f.client = c.client || g.client;
        f.needSsoConf = "true";
        d = D(d);
        e = D(e);
        $.ajax({
            url: e,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            data: f,
            success: function(a) {
                if (a && "success" === a.code && a.data) {
                    if (a.data.ssoConf) {
                        var d = y(a.data.ssoConf);
                        g.disableSetCookieOpen = d.disableSetCookie
                    }
                    a = y(a.data.captchaConf);
                    g.captchaType = a.captchaType;
                    c.captchaType = a.captchaType;
                    c.captchaCompatible = a.captchaCompatible;
                    "third" === a.captchaType ? (c.gt = c.gt || a.gt,
                    a.apiServers && 0 != a.apiServers.length || (a.apiServers = ["gcaptcha4.geetest.com"]),
                    a.staticServers && 0 != a.staticServers.length || (a.staticServers = ["static.geetest.com", "dn-staticdown.qbox.me"]),
                    a.gtProtocol && (a.gtProtocol.match("https") ? a.gtProtocol = "https://" : a.gtProtocol = "http://"),
                    g.captchaObj = new sucWeb.ui.createGt({
                        param: c,
                        protocol: a.gtProtocol || "https://",
                        ssoApiServers: a.apiServers,
                        ssoStaticServers: a.staticServers,
                        cbs: {
                            onSuccess: c.captchaSuccessResultCB,
                            onReady: c.getCaptchaResultCB,
                            onError: c.thirdCaptchaErrorCB,
                            onClose: c.captchaCloseCB,
                            initFail: b
                        }
                    })) : sucWeb.callCB(b, c)
                } else
                    sucWeb.callCB(b, c)
            },
            error: function() {
                sucWeb.callCB(b, c)
            },
            fail: function() {
                sucWeb.callCB(b, c)
            }
        })
    }
    function M(c, a) {
        z(g.needAttribute, g.appKey, g.client, g.loginRedirectUrl);
        var b = g.SSOServerUrl + "/v1/getCaptchaType"
          , d = {};
        d.appId = c.appId || g.appKey;
        d.client = c.client || g.client;
        d.onlyNeedSsoConf = "true";
        b = D(b);
        $.ajax({
            url: b,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            data: d,
            success: function(c) {
                if (c && "success" === c.code && c.data && c.data.ssoConf) {
                    var b = y(c.data.ssoConf);
                    g.disableSetCookieOpen = b.disableSetCookie
                }
                a && a(c)
            },
            error: function() {},
            fail: function() {}
        })
    }
    function P(c) {
        var a = N(c)
          , b = document.createElement("iframe");
        b.src = a;
        b.frameBorder = c.frameBorder || "0";
        b.allowTransparency = c.allowTransparency || "true";
        b.scrolling = c.scrolling || "no";
        b.width = c.width || "300px";
        b.height = c.height || "400px";
        c = document.getElementById(c.id);
        c.innerHTML = "";
        c.appendChild(b)
    }
    function N(c) {
        var a = g.SSOServerUrl + "/login?thirdLoginType\x3dwechatLogin"
          , a = a + ("\x26client\x3d" + g.client)
          , a = a + ("\x26mac\x3d" + g.mac)
          , a = a + ("\x26extInfo\x3d" + encodeURIComponent('{"deviceId": "' + g.deviceId + '"}'));
        if ("object" === typeof c) {
            var b = "default";
            !0 === c.self_redirect ? b = "true" : !1 === c.self_redirect && (b = "false");
            a = a + ("\x26login_type\x3djssdk\x26self_redirect\x3d" + b) + (c.service ? "\x26service\x3d" + encodeURIComponent(c.service) : "");
            a += c.customConfig && "object" === typeof c.customConfig ? "\x26customConfig\x3d" + Base64.encode(JSON.stringify(c.customConfig)) : "";
            a += c.style ? "\x26style\x3d" + c.style : "";
            a += c.href ? "\x26href\x3d" + encodeURIComponent(c.href) : "";
            a += c.xscheme ? "\x26xscheme\x3d" + c.xscheme : ""
        }
        return a
    }
    function R(c, a) {
        var b = g.SSOServerUrl + "/v1/bindChild"
          , d = {}
          , e = {};
        e.appId = c.appId;
        e.client = c.client;
        e.token = c.token;
        e.deviceId = c.deviceId;
        e.username = c.username;
        e.loginName = c.loginName;
        var f = RSAUtils.getKeyPair("010001", "", "00ccd806a03c7391ee8f884f5902102d95f6d534d597ac42219dd8a79b1465e186c0162a6771b55e7be7422c4af494ba0112ede4eb00fc751723f2c235ca419876e7103ea904c29522b72d754f66ff1958098396f17c6cd2c9446e8c2bb5f4000a9c1c6577236a57e270bef07e7fe7bbec1f0e8993734c8bd4750e01feb21b6dc9");
        e.password = RSAUtils.encryptedString(f, c.password);
        e.encodeType = "R2/P";
        e.captchaId = c.captchaId || g.captchaId;
        e.captchaType = c.captchaType || g.captchaType;
        e.captchaType == g.thirdCaptchaType && (e.thirdCaptchaParam = JSON.stringify(g.captchaObj.getValidate()));
        e.captchaCode = c.captchaCode;
        b = D(b);
        $.ajax({
            url: b,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            data: e,
            success: function(c) {
                d.result = c && "success" === c.code ? "success" : "fail";
                d.code = c.code;
                d.message = c.message;
                a && a(d)
            },
            error: function(c) {
                d.result = "fail";
                d.code = c.code;
                d.message = c.message;
                a && a(d)
            }
        })
    }
    function S(c, a) {
        var b = g.SSOServerUrl + "/v1/thirdLogin"
          , d = {}
          , e = {};
        e.appId = c.appId || g.appKey;
        e.client = c.client || g.client;
        e.customConfig = c.customConfig;
        e.service = c.service;
        e.scope = c.scope;
        e.code = c.code;
        e.thirdId = c.thirdId;
        e.needBindPage = c.needBindPage;
        e.needToken = c.needToken;
        b = D(b);
        $.ajax({
            url: b,
            type: "GET",
            dataType: "jsonp",
            jsonp: "callback",
            crossDomain: !0,
            cache: !1,
            data: e,
            success: function(c) {
                a && a(c)
            },
            error: function(c) {
                d.result = "fail";
                d.code = c.code;
                d.message = c.message;
                a && a(d)
            }
        })
    }
    function D(c, a) {
        I() && (a || (a = K("SSO_R_SESSION_ID", !1)),
        c = Url.addParams({
            disableSetCookie: !0
        }, c),
        null != a && (c = Url.addParams({
            SSO_R_SESSION_ID: a
        }, c)));
        return c
    }
    function I() {
        if (!g.disableSetCookieOpen)
            return !1;
        var c = window.location.host
          , a = g.SSOServerUrl.split("/");
        g.SSODomain = a[2] ? a[2] : "";
        a = c.indexOf(g.SSODomain);
        return -1 !== a && c === c.substring(0, a) + g.SSODomain ? !1 : null != g.disableSetCookie ? "function" == typeof g.disableSetCookie ? g.disableSetCookie() : g.disableSetCookie : !1
    }
    function J(c) {
        var a = decodeURI(location.search)
          , b = {};
        if (-1 !== a.indexOf("?"))
            for (var a = a.substr(1).split("\x26"), d = 0; d < a.length; d++)
                b[a[d].split("\x3d")[0]] = unescape(a[d].split("\x3d")[1]);
        return b[c]
    }
    function Q() {
        if (window.history && history.replaceState) {
            var c = window.location.href;
            c && -1 !== c.indexOf("?") && (c = c.substring(c.indexOf("?")));
            if (c) {
                for (var a = 0; a < arguments.length; a++) {
                    var b = J(arguments[a]);
                    b && (c = c.replace(arguments[a] + "\x3d" + b, ""))
                }
                c && history.replaceState({}, "", c)
            }
        }
    }
    var g = {
        _version: "1.47.0.1333-20221223",
        appName: "edc",
        appKey: "",
        client: "web",
        deviceId: t(),
        mac: "",
        scope: "openapi apigateway",
        SSOServerUrl: "https://test-open.changyan.com/sso",
        loginRedirectUrl: "",
        SSOCenterServerUrl: "https://test-open.changyan.com/sso",
        isCenterSSO: !0,
        syncType: 1,
        needAttribute: !0,
        needToken: !1,
        _retry: !1,
        customLogoutUrl: "",
        loginType: {
            LOGINBYNORMAL: "loginByNormal",
            LOGINBYVERIFYCODE: "loginByVerifyCode",
            LOGINBYONLINEAUTO: "loginByOnLineAuto",
            LOGINBYGENERIC: "loginByGeneric",
            LOGINBYTOKEN: "loginByToken",
            LOGINBYCHANGEACCOUNT: "loginByChangeAccount",
            LOGINBYNCET: "loginByNcet"
        },
        accountTypeIsAuto: !0,
        ncetAppId: "",
        sysCode: "",
        useNextPage: !0,
        nextPageNeedBase64: !0,
        useAreaExamNo: !1,
        thirdCaptchaType: "third",
        picCaptchaType: "pic",
        accountLoginVersion: "v2",
        SSODomain: "test-open.changyan.com",
        disableSetCookie: null,
        disableSetCookieOpen: null,
        casTgcCookieName: "SSO_CASTGC",
        needBehaviorCheck: !1,
        behaviorCheckInPc: !0,
        customConfig: "",
        getSsoServerConf: function(c, a) {
            M(c, a)
        },
        login: function(c, a, b) {
            var d = {};
            d.account = c;
            d.password = a;
            v(d, b)
        },
        loginExt: function(c, a) {
            v(c, a)
        },
        logout: function(c) {
            A(a, c)
        },
        logoutExt: function(c, a) {
            A(c, a)
        },
        getDeviceId: function(c) {
            return t(c)
        },
        getLoginState: function(c) {
            return u(!0, c)
        },
        getLoginStateWithSt: function(c) {
            return u(!0, c)
        },
        getLoginStateNoSt: function(c) {
            return u(!1, c)
        },
        getLoginStateV2: function(c, a) {
            return p(c, a)
        },
        getLoginStateV2St: function(c) {
            return p(!0, c)
        },
        getLoginStateV2NoSt: function(c) {
            return p(!1, c)
        },
        getAccessToken: function(c) {
            l(null, c)
        },
        getAccessTokenV2: function(c) {
            G(null, c)
        },
        getAccessTokenWithParam: function(c, a) {
            l(c, a)
        },
        loginSSOTgt: function(c) {
            H(c)
        },
        validateServiceTicket: function(c, a, b) {
            f(c, a, b)
        },
        getSingleAccountTicket: function(c, a) {
            h(c, a)
        },
        getOrRefreshSmsLoginCaptcha: function(c, a) {
            e(c, a)
        },
        sendSms: function(c, a) {
            q(c, a)
        },
        checkCaptcha: function(c, a) {
            r(c, a)
        },
        getCaptcha: function(a) {
            O(a)
        },
        verify: function() {
            g.captchaObj && g.captchaObj.verify()
        },
        wxLoginFrame: function(a, b) {
            P(a);
            b && window.addEventListener("message", function(a) {
                b(a.data)
            }, !1)
        },
        wxLoginUrl: function(a) {
            return N(a)
        },
        ddLoginUrl: function(a) {
            var c = g.SSOServerUrl + "/login?thirdLoginType\x3ddingdingLogin"
              , c = c + ("\x26client\x3d" + g.client)
              , c = c + ("\x26mac\x3d" + g.mac)
              , c = c + ("\x26extInfo\x3d" + encodeURIComponent('{"deviceId": "' + g.deviceId + '"}'));
            "object" === typeof a && (c += a.service ? "\x26service\x3d" + encodeURIComponent(a.service) : "",
            c += a.customConfig && "object" === typeof a.customConfig ? "\x26customConfig\x3d" + Base64.encode(JSON.stringify(a.customConfig)) : "",
            c += a.href ? "\x26href\x3d" + encodeURIComponent(a.href) : "");
            return c
        },
        bindChild: function(a, b) {
            R(a, b)
        },
        thirdAuthLogin: function(a, b) {
            S(a, b)
        },
        encryptedStringByR2P: function(a) {
            var c = RSAUtils.getKeyPair("010001", "", "00ccd806a03c7391ee8f884f5902102d95f6d534d597ac42219dd8a79b1465e186c0162a6771b55e7be7422c4af494ba0112ede4eb00fc751723f2c235ca419876e7103ea904c29522b72d754f66ff1958098396f17c6cd2c9446e8c2bb5f4000a9c1c6577236a57e270bef07e7fe7bbec1f0e8993734c8bd4750e01feb21b6dc9");
            return RSAUtils.encryptedString(c, a)
        },
        isDisableSetCookie: function() {
            return I()
        }
    };
    window.SSO = window.SSO || g
}
)();
window.sucWeb = {};
sucWeb.clazz = function(a, e) {
    function r(b, e, q) {
        var d = this;
        this.uedo = !0;
        "object" != typeof e && (e = {
            uedo: !0
        });
        b = b || {};
        var l = r.prototype;
        "function" == typeof a && (d._ = a.prototype);
        "inborn"in l && l.inborn.call(d, b);
        "function" == typeof a && a.call(d, b, e, !0);
        d.access || (d.access = function(a, b, l) {
            e[a] = function() {
                var a = b.apply(d, arguments);
                return l ? e : a
            }
            ;
            return d
        }
        );
        "function" == typeof a && (d._ = a.prototype);
        "born"in l && l.born.call(d, b);
        if (!q && "function" == typeof e.getDom)
            switch (sucWeb.type(e.getDom())) {
            case "dom":
            case "window":
            case "global":
                e.getDom().obj = e
            }
        return e
    }
    2 > arguments.length ? (e = a,
    a = null) : "function" !== typeof a && console && console.trace("Error : unkonw parent class");
    if ("function" == typeof a) {
        var q = function() {};
        q.prototype = a.prototype;
        r.prototype = new q
    }
    if ("object" == typeof e)
        for (var b in e)
            r.prototype[b] = e[b];
    return r
}
;
sucWeb.callCB = function(a) {
    if ("function" == typeof a)
        a.apply(this, Array.prototype.slice.call(arguments, 1));
    else if ("object" == typeof a && null != a && "function" == typeof a.cb)
        "object" == typeof a.scope ? a.cb.apply(a.scope, Array.prototype.slice.call(arguments, 1)) : a.cb.apply(this, Array.prototype.slice.call(arguments, 1));
    else
        return !1;
    return !0
}
;
sucWeb.type = function(a) {
    return null === a ? "null" : "object" === typeof a ? a.window && a.window.window && a.window === a.window.window ? "window" : 1 === a.nodeType && "string" === typeof a.nodeName ? "dom" : Object.prototype.toString.call(a).slice(8, -1).toLowerCase() : typeof a
}
;
sucWeb.define = function(a, e) {
    if (null == a)
        return e;
    if (null == e)
        return a;
    if (sucWeb.type(a) !== sucWeb.type(e))
        return e;
    switch (sucWeb.type(e)) {
    case "object":
    case "array":
        for (var r in e)
            a[r] = sucWeb.define(a[r], e[r])
    }
    return a
}
;
sucWeb.ns = function(a) {
    if ("string" == typeof a) {
        a = a.split(".");
        var e = a[0];
        eval("if(typeof(" + e + ")\x3d\x3d'undefined') " + e + "\x3d{};");
        for (var r = 1; r < a.length; r++)
            e += "." + a[r],
            eval("if(typeof(" + e + ")\x3d\x3d'undefined') " + e + "\x3d{};");
        return sucWeb
    }
}
;
sucWeb.ns("sucWeb.ui");
sucWeb.ui.createGt = sucWeb.clazz({
    born: function(a) {
        this.c = sucWeb.define(a, {
            product: "bind",
            width: "300px",
            lang: "zh-cn",
            https: !1,
            timeout: 3E4,
            zoomEle: null,
            hideSuccess: !1,
            hideClose: !1,
            hideRefresh: !1,
            parent: "",
            bindForm: "",
            ssoApiServers: [],
            ssoStaticServers: [],
            param: null,
            cbs: {
                initFail: null,
                onReady: null,
                onSuccess: null,
                onError: null,
                onClose: null
            }
        });
        this.init();
        this.access("reset", this.reset).access("destroy", this.destroy).access("verify", this.verify).access("getCaptchaObj", this.getCaptchaObj).access("getValidate", this.getValidate)
    },
    initGt: function() {
        (function(a, e, r) {
            function q(a) {
                this._obj = a
            }
            function b(a) {
                var b = this;
                (new q(a))._each(function(a, d) {
                    b[a] = d
                })
            }
            function d(a) {
                return a.replace(/(\S)(_([a-zA-Z]))/g, function(a, b, d, e) {
                    return b + e.toUpperCase() || ""
                })
            }
            function l(a, b) {
                if (a !== Object(a) || "[object Date]" == E.call(a) || "[object RegExp]" == E.call(a) || "[object Boolean]" == E.call(a) || "function" === typeof a)
                    return b ? d(a) : a;
                if ("[object Array]" == E.call(a))
                    for (var e = [], f = 0; f < a.length; f++)
                        e.push(l(a[f]));
                else
                    for (f in e = {},
                    a)
                        a.hasOwnProperty(f) && (e[l(f, !0)] = l(a[f]));
                return e
            }
            if ("undefined" === typeof a)
                throw Error("Geetest requires browser environment");
            var G = a.document
              , u = a.Math
              , p = G.getElementsByTagName("head")[0];
            q.prototype = {
                _each: function(a) {
                    var b = this._obj, d;
                    for (d in b)
                        b.hasOwnProperty(d) && a(d, b[d]);
                    return this
                },
                _extend: function(a) {
                    var b = this;
                    (new q(a))._each(function(a, d) {
                        b._obj[a] = d
                    })
                }
            };
            var z = function() {
                return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a) {
                    var b = 16 * u.random() | 0;
                    return ("x" === a ? b : b & 3 | 8).toString(16)
                })
            };
            b.prototype = {
                apiServers: e,
                staticServers: r,
                protocol: "http://",
                typePath: "/load",
                fallback_config: {
                    bypass: {
                        staticServers: ["static.geetest.com/", "dn-staticdown.qbox.me/"],
                        type: "bypass",
                        bypass: "/v4/bypass.js"
                    }
                },
                _get_fallback_config: function() {
                    return "string" === typeof this.type ? this.fallback_config[this.type] : this.fallback_config.bypass
                },
                _extend: function(a) {
                    var b = this;
                    (new q(a))._each(function(a, d) {
                        b[a] = d
                    })
                }
            };
            var F = function(a) {
                return "object" === typeof a && null !== a
            };
            /Mobi/i.test(navigator.userAgent);
            var v = {}
              , w = {}
              , C = function(a, b) {
                if ("function" === typeof a) {
                    var d = Array.prototype.slice.call(arguments, 2);
                    return Function.prototype.bind ? a.bind(b, d) : function() {
                        var e = Array.prototype.slice.call(arguments);
                        return a.apply(b, d.concat(e))
                    }
                }
            }
              , E = Object.prototype.toString
              , f = function(a, b, d) {
                var e = G.createElement("script");
                e.charset = "UTF-8";
                e.async = !0;
                /static\.geetest\.com/g.test(a) && (e.crossOrigin = "anonymous");
                e.onerror = function() {
                    b(!0);
                    f = !0
                }
                ;
                var f = !1;
                e.onload = e.onreadystatechange = function() {
                    f || e.readyState && "loaded" !== e.readyState && "complete" !== e.readyState || (f = !0,
                    setTimeout(function() {
                        b(!1)
                    }, 0))
                }
                ;
                e.src = a;
                p.appendChild(e);
                setTimeout(function() {
                    f || (e.onerror = e.onload = null,
                    e.remove && e.remove(),
                    b(!0))
                }, d || 1E4)
            }
              , k = function(a) {
                if (!a)
                    return "";
                var b = "?";
                (new q(a))._each(function(a, d) {
                    if ("string" === typeof d || "number" === typeof d || "boolean" === typeof d)
                        b = b + encodeURIComponent(a) + "\x3d" + encodeURIComponent(d) + "\x26"
                });
                "?" === b && (b = "");
                return b.replace(/&$/, "")
            }
              , h = function(a, b, d, e) {
                b = b.replace(/^https?:\/\/|\/$/g, "");
                d = d.replace(/\/+/g, "/");
                0 !== d.indexOf("/") && (d = "/" + d);
                e = d + k(e);
                b && (e = a + b + e);
                return e
            }
              , A = function(b, d, e, k, l, q, r) {
                var n = function(y) {
                    if (r) {
                        var p = "geetest_" + (parseInt(1E4 * u.random()) + (new Date).valueOf());
                        a[p] = C(r, null, p);
                        l.callback = p
                    }
                    var t = h(d, e[y], k, l);
                    f(t, function(b) {
                        if (b) {
                            if (p)
                                try {
                                    a[p] = function() {
                                        a[p] = null
                                    }
                                } catch (I) {}
                            y >= e.length - 1 ? q(!0) : n(y + 1)
                        } else
                            q(!1)
                    }, b.timeout)
                };
                n(0)
            }
              , L = function(b, d, e, f) {
                A(e, e.protocol, b, d, {
                    captcha_id: e.captchaId,
                    challenge: e.challenge || z(),
                    client_type: 0,
                    pt: 0,
                    risk_type: e.riskType
                }, function(a) {
                    a && "function" === typeof e.offlineCb ? e.offlineCb() : a && f(e._get_fallback_config())
                }, function(b, d) {
                    "success" == d.status ? f(d.data) : f(d);
                    a[b] = void 0;
                    try {
                        delete a[b]
                    } catch (M) {}
                })
            }
              , H = function(a, b, d) {
                var e = {
                    networkError: "\u7f51\u7edc\u9519\u8bef",
                    gtTypeError: "gt\u5b57\u6bb5\u4e0d\u662f\u5b57\u7b26\u4e32\u7c7b\u578b"
                };
                if ("function" === typeof b.onError)
                    b.onError({
                        desc: d.desc,
                        msg: d.msg,
                        code: d.code
                    });
                else
                    throw Error(e[a]);
            };
            if (a.Geetest || G.getElementById("gt_lib"))
                w.slide = "loaded";
            a.initGeetest4 = function(d, e) {
                var f = new b(d);
                d.https ? f.protocol = "https://" : d.protocol || (f.protocol = a.location.protocol + "//");
                F(d.getType) && f._extend(d.getType);
                L(f.apiServers, f.typePath, f, function(b) {
                    b = l(b);
                    if ("error" === b.status)
                        return H("networkError", f, b);
                    var d = b.type;
                    f.debug && (new q(b))._extend(f.debug);
                    var h = function() {
                        f._extend(b);
                        e(new a.Geetest4(f))
                    };
                    v[d] = v[d] || [];
                    var k = w[d] || "init";
                    if ("init" === k)
                        w[d] = "loading",
                        v[d].push(h),
                        b.gctPath && A(f, f.protocol, Object.hasOwnProperty(f.staticServers) ? f.staticServers : b.staticServers || f.staticServers, b.gctPath, null, function(a) {
                            a && H("networkError", f, {
                                code: "60205",
                                msg: "Network failure",
                                desc: {
                                    detail: "gct resource load timeout"
                                }
                            })
                        }),
                        A(f, f.protocol, Object.hasOwnProperty(f.staticServers) ? f.staticServers : b.staticServers || f.staticServers, b.bypass || b.staticPath + b.js, null, function(a) {
                            if (a)
                                w[d] = "fail",
                                H("networkError", f, {
                                    code: "60204",
                                    msg: "Network failure",
                                    desc: {
                                        detail: "js resource load timeout"
                                    }
                                });
                            else {
                                w[d] = "loaded";
                                a = v[d];
                                for (var b = 0, e = a.length; b < e; b += 1) {
                                    var h = a[b];
                                    "function" === typeof h && h()
                                }
                                v[d] = []
                            }
                        });
                    else {
                        if ("loaded" === k)
                            return h();
                        "fail" === k ? (H("networkError", f),
                        {
                            code: "60204",
                            msg: "Network failure",
                            desc: {
                                detail: "js resource load timeout"
                            }
                        }) : "loading" === k && v[d].push(h)
                    }
                })
            }
        }
        )(window, this.c.ssoApiServers, this.c.ssoStaticServers)
    },
    init: function() {
        var a = this;
        a.initGt();
        var e = JSON.parse(JSON.stringify(a.c));
        delete e.param;
        delete e.cbs;
        e.captchaId = a.c.param.gt;
        e.offline = !1;
        e.new_captcha = !0;
        e.offlineCb = function() {
            sucWeb.callCB(a.c.cbs.initFail, a.c.param)
        }
        ;
        a.initGeetest(e)
    },
    getValidate: function() {
        return this.validateCodeObj
    },
    getValidateCodeObj: function() {
        return this.captchaObj.getValidate()
    },
    initGeetest: function(a) {
        var e = this;
        initGeetest4(a, function(a) {
            e.captchaObj = a;
            e.c.parent && a.appendTo(e.c.parent);
            a.onSuccess(function() {
                e.validateCodeObj = e.getValidateCodeObj(a);
                e.c.cbs.onSuccess ? sucWeb.callCB(e.c.cbs.onSuccess, e.validateCodeObj) : sucWeb.callCB(e.onSuccess, e.validateCodeObj)
            }).onError(function(a) {
                e.c.cbs.onError ? sucWeb.callCB(e.c.cbs.onError, a) : sucWeb.callCB(e.onError, a)
            }).onReady(function() {
                e.c.cbs.onReady && sucWeb.callCB(e.c.cbs.onReady, {
                    result: "success",
                    code: "success",
                    data: {
                        captchaType: "third"
                    }
                })
            }).onClose(function() {
                e.c.cbs.onClose ? sucWeb.callCB(e.c.cbs.onClose) : sucWeb.callCB(e.onClose)
            })
        })
    },
    onSuccess: function(a) {},
    onError: function(a) {},
    onClose: function() {},
    getCaptchaObj: function() {
        return this.captchaObj
    },
    reset: function() {
        this.captchaObj.reset()
    },
    destroy: function() {
        this.captchaObj.destroy()
    },
    verify: function() {
        this.captchaObj.showBox()
    }
});
function getKey(k){
    var h = window.RSAUtils.getKeyPair("010001", "", "00ccd806a03c7391ee8f884f5902102d95f6d534d597ac42219dd8a79b1465e186c0162a6771b55e7be7422c4af494ba0112ede4eb00fc751723f2c235ca419876e7103ea904c29522b72d754f66ff1958098396f17c6cd2c9446e8c2bb5f4000a9c1c6577236a57e270bef07e7fe7bbec1f0e8993734c8bd4750e01feb21b6dc9");
    return window.RSAUtils.encryptedString(h, k);
}